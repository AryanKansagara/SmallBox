/**
 * POST /api/finance/insights
 *
 * Uses watsonx.ai to generate 2–3 specific, actionable budget insights
 * based on the current month's spending vs budget targets.
 *
 * IBM Service: watsonx.ai (IBM Granite)
 * Spec ref: §6.2 — "watsonx.ai — categorizes uploaded receipts and suggests budget insights"
 */

import { NextRequest, NextResponse } from "next/server";
import { generateText, isWatsonxConfigured } from "@/lib/watsonx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Transaction = {
  category: string;
  amount: number;
  transactionType: "income" | "expense";
};

type BudgetInput = {
  category: string;
  total: number;
};

type InsightsRequest = {
  month: string;
  transactions: Transaction[];
  budgets: BudgetInput[];
};

export type Insight = {
  title: string;
  body: string;
  type: "warning" | "tip" | "positive";
};

function localInsights(
  transactions: Transaction[],
  budgets: BudgetInput[],
): Insight[] {
  const insights: Insight[] = [];

  const spent: Record<string, number> = {};
  for (const t of transactions) {
    if (t.transactionType === "expense") {
      spent[t.category] = (spent[t.category] ?? 0) + t.amount;
    }
  }

  for (const b of budgets) {
    const usedAmt = spent[b.category] ?? 0;
    const pct = Math.round((usedAmt / b.total) * 100);
    if (pct >= 100) {
      insights.push({
        title: `${b.category} budget exceeded`,
        body: `You've spent $${usedAmt.toFixed(2)} — $${(usedAmt - b.total).toFixed(2)} over your $${b.total} limit. Review this category's expenses and adjust your limit or reduce spending next month.`,
        type: "warning",
      });
    } else if (pct >= 80) {
      insights.push({
        title: `${b.category} nearing its limit`,
        body: `You've used ${pct}% of your $${b.total} ${b.category} budget with $${(b.total - usedAmt).toFixed(2)} remaining. Be mindful of further spending in this area.`,
        type: "warning",
      });
    } else if (pct <= 30 && b.total > 100) {
      insights.push({
        title: `Unused ${b.category} budget`,
        body: `Only ${pct}% of your $${b.total} ${b.category} budget has been used. Consider reallocating some of the $${(b.total - usedAmt).toFixed(2)} remaining to higher-impact areas like marketing or equipment.`,
        type: "tip",
      });
    }
  }

  const totalIncome = transactions.filter((t) => t.transactionType === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = Object.values(spent).reduce((s, v) => s + v, 0);
  if (totalIncome > 0) {
    const margin = Math.round(((totalIncome - totalExpenses) / totalIncome) * 100);
    if (margin > 40) {
      insights.push({
        title: "Strong profit margin",
        body: `Your ${margin}% profit margin this month is excellent. Consider reinvesting a portion into marketing or equipment to drive growth next month.`,
        type: "positive",
      });
    }
  }

  return insights.slice(0, 3);
}

function parseInsights(text: string): Insight[] {
  const cleaned = text.replace(/```json?/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1) return [];

  // Try the full bracketed slice first; if model truncated, try closing manually
  const candidates = [
    end > start ? cleaned.slice(start, end + 1) : null,
    cleaned.slice(start) + "]",
    cleaned.slice(start),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (!Array.isArray(parsed)) continue;
      // Validate every item has required string fields — skip bad ones
      const validInsights: Insight[] = parsed
        .filter((it): it is Record<string, unknown> => typeof it === "object" && it !== null)
        .map((it) => ({
          title: String(it.title ?? "").trim(),
          body: String(it.body ?? "").trim(),
          type:
            it.type === "warning" || it.type === "positive" || it.type === "tip"
              ? it.type
              : "tip",
        }))
        .filter((it) => it.title.length > 0 && it.body.length > 0)
        .slice(0, 3);
      if (validInsights.length > 0) return validInsights;
    } catch {
      // try next candidate
    }
  }

  return [];
}

export async function POST(req: NextRequest) {
  let body: InsightsRequest;
  try {
    body = (await req.json()) as InsightsRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { transactions = [], budgets = [] } = body;

  if (!isWatsonxConfigured() || budgets.length === 0) {
    return NextResponse.json({
      insights: localInsights(transactions, budgets),
      source: "fallback",
    });
  }

  const spent: Record<string, number> = {};
  for (const t of transactions) {
    if (t.transactionType === "expense") {
      spent[t.category] = (spent[t.category] ?? 0) + t.amount;
    }
  }

  const budgetLines = budgets
    .map((b) => {
      const usedAmt = spent[b.category] ?? 0;
      const pct = Math.round((usedAmt / b.total) * 100);
      return `${b.category}: $${usedAmt.toFixed(2)} spent of $${b.total} budget (${pct}%)`;
    })
    .join("\n");

  const prompt = `You are a small business financial advisor. Analyze the budgets below and return EXACTLY 3 insights as a JSON array. Output the JSON array only — no prose, no explanation, no markdown fences.

Each item: {"title": "short title (max 5 words)", "body": "one actionable sentence", "type": "warning" or "tip" or "positive"}

Example output:
[{"title":"Marketing budget exceeded","body":"You spent 120% of your marketing budget — pause new ad campaigns until next month.","type":"warning"},{"title":"Healthy supplies usage","body":"Supplies are tracking at 45% of budget, leaving room for inventory growth.","type":"positive"},{"title":"Reallocate idle rent budget","body":"Only 20% of rent budget used; consider moving the surplus to marketing.","type":"tip"}]

Budgets this month:
${budgetLines}

JSON array:`;

  // Stop as soon as the first JSON array closes — saves tokens + prevents repetition
  const result = await generateText(prompt, 350, ["\nBudgets", "\n\n"]);

  const parsed = result.source === "watsonx" && result.text
    ? parseInsights(result.text)
    : [];

  const insights = parsed.length > 0 ? parsed : localInsights(transactions, budgets);

  return NextResponse.json({
    insights,
    source: parsed.length > 0 ? "watsonx" : "fallback",
    powered_by: "watsonx.ai — Llama 3.3 70B",
  });
}
