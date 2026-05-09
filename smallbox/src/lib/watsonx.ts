/**
 * IBM watsonx.ai text generation client.
 *
 * Required env vars:
 *   IBM_CLOUD_API_KEY   — IBM Cloud API key (also used for Cloudant IAM auth)
 *   WATSONX_PROJECT_ID  — watsonx.ai project id (from cloud.ibm.com)
 *   WATSONX_URL         — (optional) defaults to us-south endpoint
 *   WATSONX_MODEL_ID    — (optional) defaults to ibm/granite-3-8b-instruct
 *
 * Falls back to a deterministic rule-based response when not configured so
 * the app keeps working without any credentials.
 */

import { getWatsonxIamToken } from "./ibm-iam";

export type GenerateResult = {
  text: string;
  source: "watsonx" | "fallback";
};

// ── Process-level categorization cache ───────────────────────────────────────
// Avoids re-calling watsonx.ai for descriptions we've already classified.
// Key: lowercased trimmed description. Lives for the lifetime of the process.
const categCache = new Map<
  string,
  { category: string; transactionType: "income" | "expense" }
>();

export function getCached(description: string) {
  return categCache.get(description.toLowerCase().trim()) ?? null;
}

export function setCached(
  description: string,
  result: { category: string; transactionType: "income" | "expense" },
) {
  if (categCache.size > 2000) categCache.clear(); // cap memory
  categCache.set(description.toLowerCase().trim(), result);
}

export function isWatsonxConfigured(): boolean {
  const hasKey = Boolean(process.env.WATSONX_API_KEY ?? process.env.IBM_CLOUD_API_KEY);
  const hasProject = Boolean(process.env.WATSONX_PROJECT_ID);
  if (!hasKey || !hasProject) {
    console.warn(`[watsonx] not configured — hasKey:${hasKey} hasProject:${hasProject}`);
  }
  return hasKey && hasProject;
}

export async function generateText(
  prompt: string,
  maxNewTokens = 200,
  stopSequences?: string[],
): Promise<GenerateResult> {
  if (!isWatsonxConfigured()) {
    return { text: "", source: "fallback" };
  }

  console.log(`[watsonx] calling model ${process.env.WATSONX_MODEL_ID ?? "ibm/granite-3-8b-instruct"} (${process.env.WATSONX_URL ?? "us-south"})`);

  let token: string;
  try {
    token = await getWatsonxIamToken();
    console.log("[watsonx] IAM token obtained");
  } catch (err) {
    console.error("[watsonx] IAM token error:", err);
    return { text: "", source: "fallback" };
  }

  const baseUrl = (
    process.env.WATSONX_URL ?? "https://us-south.ml.cloud.ibm.com"
  ).replace(/\/+$/, "");
  const modelId =
    process.env.WATSONX_MODEL_ID ?? "ibm/granite-3-8b-instruct";

  const res = await fetch(
    `${baseUrl}/ml/v1/text/generation?version=2024-05-01`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model_id: modelId,
        project_id: process.env.WATSONX_PROJECT_ID,
        input: prompt,
        parameters: {
          decoding_method: "greedy",
          max_new_tokens: maxNewTokens,
          temperature: 0.2,
          repetition_penalty: 1.05,
          ...(stopSequences && stopSequences.length > 0
            ? { stop_sequences: stopSequences }
            : {}),
        },
      }),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`[watsonx] API error ${res.status}:`, errBody);
    return { text: "", source: "fallback" };
  }

  const data = (await res.json()) as {
    results?: Array<{ generated_text?: string }>;
  };
  const text = data.results?.[0]?.generated_text?.trim() ?? "";
  return { text, source: "watsonx" };
}

/**
 * Ask watsonx.ai to categorise a single transaction description.
 * Returns the best-match category name and whether it is income or expense.
 * Falls back to a keyword-based local classifier when watsonx.ai is not set up.
 */
export async function categorizeTransaction(
  description: string,
  amount?: number,
): Promise<{ category: string; transactionType: "income" | "expense"; source: "watsonx" | "fallback" }> {
  const CATEGORIES = [
    "Sales",
    "Supplies",
    "Marketing",
    "Utilities",
    "Rent",
    "Payroll",
    "Insurance",
    "Equipment",
    "Other",
  ];

  // Check cache first — saves an API call if we've seen this description before
  const cached = getCached(description);
  if (cached) return { ...cached, source: "fallback" };

  const prompt = `Classify this small business transaction. Return JSON only, no explanation.
Valid categories: ${CATEGORIES.join(", ")}
Format: {"category":"Supplies","transactionType":"expense"}

Transaction: "${description}"${amount !== undefined ? ` $${amount.toFixed(2)}` : ""}
JSON:`;

  const result = await generateText(prompt, 50);

  if (result.source === "watsonx" && result.text) {
    try {
      // Strip any markdown fencing the model may add
      const json = result.text
        .replace(/```json?/gi, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(json) as Record<string, string>;
      const rawCat = parsed.category ?? parsed.c ?? "";
      const rawType = parsed.transactionType ?? parsed.type ?? parsed.t ?? "";
      const category = CATEGORIES.includes(rawCat) ? rawCat : "Other";
      const transactionType = rawType === "income" ? "income" : "expense";
      setCached(description, { category, transactionType });
      return { category, transactionType, source: "watsonx" };
    } catch {
      // fall through to local classifier
    }
  }

  const local = localClassify(description);
  setCached(description, local);
  return { ...local, source: "fallback" };
}

/**
 * Classify multiple transactions in a single watsonx.ai call.
 * Checks the cache for each item first — only sends uncached items to the API.
 * This is the key free-tier optimization: a 20-row CSV = 1 API call, not 20.
 */
export async function categorizeTransactionsBatch(
  items: Array<{ description: string; amount?: number }>,
): Promise<Array<{ category: string; transactionType: "income" | "expense"; source: "watsonx" | "fallback" }>> {
  const CATEGORIES = [
    "Sales", "Supplies", "Marketing", "Utilities", "Rent",
    "Payroll", "Insurance", "Equipment", "Other",
  ];

  // Resolve cache hits immediately; collect indices that need an API call
  type Resolved = { category: string; transactionType: "income" | "expense"; source: "watsonx" | "fallback" };
  const results: (Resolved | null)[] = items.map((item) => {
    const hit = getCached(item.description);
    return hit ? { ...hit, source: "fallback" as const } : null;
  });

  const uncachedIndices = results
    .map((r, i) => (r === null ? i : -1))
    .filter((i) => i !== -1);

  if (uncachedIndices.length === 0 || !isWatsonxConfigured()) {
    // Everything already cached — or no IBM credentials; run local classifier
    return results.map((r, i) =>
      r ?? { ...localClassify(items[i]!.description), source: "fallback" as const },
    );
  }

  // Build the prompt — use full key names so the model outputs them reliably
  const lines = uncachedIndices
    .map((idx) => {
      const item = items[idx]!;
      return `${idx}: "${item.description}"${item.amount !== undefined ? ` $${item.amount.toFixed(2)}` : ""}`;
    })
    .join("\n");

  const prompt = `You are a bookkeeper. Classify each transaction and return a JSON array only. No explanation.
Valid categories: ${CATEGORIES.join(", ")}
Format: [{"i":0,"category":"Sales","type":"income"},{"i":1,"category":"Supplies","type":"expense"},...]

Transactions:
${lines}

JSON:`;

  // ~20 tokens per item for full key names + values; add buffer for array brackets
  const maxTokens = Math.min(uncachedIndices.length * 22 + 20, 400);
  const result = await generateText(prompt, maxTokens);

  if (result.source === "watsonx" && result.text) {
    try {
      const cleaned = result.text.replace(/```json?/gi, "").replace(/```/g, "").trim();
      const start = cleaned.indexOf("[");
      const end = cleaned.lastIndexOf("]");
      // Gracefully handle truncated responses by closing the array
      const jsonStr = end > start
        ? cleaned.slice(start, end + 1)
        : cleaned.slice(start) + "]";
      const parsed = JSON.parse(jsonStr) as Array<Record<string, unknown>>;

      for (const item of parsed) {
        const idx = typeof item.i === "number" ? item.i : undefined;
        if (idx === undefined || idx < 0 || idx >= items.length) continue;
        // Accept both full key names (category/type) and shorthand (c/t)
        const rawCat = (item.category ?? item.c ?? "") as string;
        const rawType = (item.type ?? item.t ?? "") as string;
        const category = CATEGORIES.includes(rawCat) ? rawCat : "Other";
        const transactionType = rawType === "income" ? "income" : "expense";
        const resolved: Resolved = { category, transactionType, source: "watsonx" };
        results[idx] = resolved;
        setCached(items[idx]!.description, { category, transactionType });
      }
    } catch {
      // fall through — unfilled slots will get local classifier below
    }
  }

  // Fill any remaining nulls (parse failures) with local classifier
  return results.map((r, i) => {
    if (r !== null) return r;
    const local = localClassify(items[i]!.description);
    setCached(items[i]!.description, local);
    return { ...local, source: "fallback" as const };
  });
}

// ── Local keyword classifier (used when watsonx.ai is not configured) ────────

const INCOME_KEYWORDS = [
  "sale", "sales", "revenue", "payment received", "order received",
  "invoice paid", "deposit", "client payment", "customer payment",
  "walk-in", "catering", "workshop", "class fee", "tuition",
  "subscription received", "refund received", "grant", "loan received",
  "transfer in", "cash in", "income", "earning", "consulting fee",
  "service fee", "commission received", "tip received", "donation received",
  "product sold", "ticket sale", "event revenue",
];

const EXPENSE_MAP: Array<{ keywords: string[]; category: string }> = [
  {
    keywords: [
      "ingredient", "ingredients", "supply", "supplies", "packaging",
      "material", "materials", "stock", "inventory", "raw", "flour",
      "sugar", "wholesale", "purchase order", "vendor", "produce",
      "groceries", "stationery", "office supply", "paper", "ink",
    ],
    category: "Supplies",
  },
  {
    keywords: [
      "ad", "ads", "advert", "advertising", "marketing", "campaign",
      "facebook", "instagram", "google ads", "tiktok", "twitter",
      "promotion", "promo", "flyer", "banner", "sponsorship", "seo",
      "social media", "mailchimp", "email campaign", "influencer",
      "print ad", "radio", "billboard",
    ],
    category: "Marketing",
  },
  {
    keywords: [
      "rent", "lease", "office rent", "shop rent", "studio rent",
      "storage rent", "warehouse", "commercial space", "premises",
    ],
    category: "Rent",
  },
  {
    keywords: [
      "hydro", "electric", "electricity", "water bill", "gas bill",
      "internet", "utility", "utilities", "phone bill", "wifi",
      "broadband", "cable", "sewage", "heating", "cooling", "power bill",
      "cell phone", "mobile plan", "telephone",
    ],
    category: "Utilities",
  },
  {
    keywords: [
      "payroll", "salary", "salaries", "wage", "wages", "staff pay",
      "employee", "contractor pay", "freelancer", "hr", "direct deposit",
      "paycheque", "paycheck", "overtime", "bonus", "commission paid",
    ],
    category: "Payroll",
  },
  {
    keywords: [
      "insurance", "premium", "policy", "liability", "coverage",
      "business insurance", "health insurance", "vehicle insurance",
      "property insurance",
    ],
    category: "Insurance",
  },
  {
    keywords: [
      "equipment", "machine", "machinery", "tool", "tools", "computer",
      "laptop", "printer", "scanner", "oven", "appliance", "refrigerator",
      "mixer", "vehicle", "camera", "software license", "subscription software",
      "saas", "hardware", "server", "phone purchase",
    ],
    category: "Equipment",
  },
];

function localClassify(description: string): {
  category: string;
  transactionType: "income" | "expense";
} {
  const lower = description.toLowerCase();

  const isIncome = INCOME_KEYWORDS.some((kw) => lower.includes(kw));
  if (isIncome) return { category: "Sales", transactionType: "income" };

  for (const { keywords, category } of EXPENSE_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { category, transactionType: "expense" };
    }
  }

  return { category: "Other", transactionType: "expense" };
}
