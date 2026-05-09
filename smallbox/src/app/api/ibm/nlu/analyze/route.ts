import { NextRequest, NextResponse } from "next/server";
import {
  buildSuggestions,
  cleanCategoryLabel,
  DEFAULT_IBM_NLU_VERSION,
  normalizeReviewsText,
  scoreToLabel,
  scoreToPercentage,
  type NluAnalyzeRequest,
  type NluAnalyzeResponse,
} from "@/lib/ibm-nlu";

interface IbmKeyword {
  text?: string;
  relevance?: number;
  sentiment?: {
    score?: number;
  };
}

interface IbmCategory {
  label?: string;
  score?: number;
}

interface IbmNluResponse {
  sentiment?: {
    document?: {
      score?: number;
      label?: string;
    };
  };
  keywords?: IbmKeyword[];
  categories?: IbmCategory[];
}

function getEnvConfig() {
  return {
    apiKey: process.env.IBM_NLU_API_KEY?.trim(),
    serviceUrl: process.env.IBM_NLU_URL?.trim(),
    version: process.env.IBM_NLU_VERSION?.trim() || DEFAULT_IBM_NLU_VERSION,
  };
}

function sortKeywords(keywords: IbmKeyword[]): IbmKeyword[] {
  return [...keywords].sort((a, b) => {
    const aScore = Math.abs(a.sentiment?.score ?? 0) + (a.relevance ?? 0);
    const bScore = Math.abs(b.sentiment?.score ?? 0) + (b.relevance ?? 0);
    return bScore - aScore;
  });
}

function pickThemes(keywords: IbmKeyword[], direction: "positive" | "negative"): string[] {
  const filtered = keywords.filter((keyword) => {
    const score = keyword.sentiment?.score ?? 0;
    return direction === "positive" ? score > 0.1 : score < -0.1;
  });

  return sortKeywords(filtered)
    .map((keyword) => keyword.text?.trim() ?? "")
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index)
    .slice(0, 5);
}

export async function POST(request: NextRequest) {
  const { apiKey, serviceUrl, version } = getEnvConfig();

  if (!apiKey || !serviceUrl) {
    return NextResponse.json(
      { error: "IBM Watson NLU is not configured. Add IBM_NLU_API_KEY and IBM_NLU_URL on the server." },
      { status: 500 }
    );
  }

  let payload: NluAnalyzeRequest;
  try {
    payload = (await request.json()) as NluAnalyzeRequest;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const reviews = normalizeReviewsText(payload.reviewsText ?? "");
  if (reviews.length === 0) {
    return NextResponse.json({ error: "Paste at least one customer review to analyze." }, { status: 400 });
  }

  const combinedText = reviews.join("\n");
  if (combinedText.length < 8) {
    return NextResponse.json(
      { error: "Add a bit more review text so Watson NLU has enough context to analyze." },
      { status: 400 }
    );
  }

  const auth = Buffer.from(`apikey:${apiKey}`).toString("base64");
  const endpoint = `${serviceUrl.replace(/\/+$/, "")}/v1/analyze?version=${encodeURIComponent(version)}`;

  let ibmResponse: Response;
  try {
    ibmResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: combinedText,
        language: "en",
        features: {
          sentiment: {},
          keywords: {
            sentiment: true,
            limit: 8,
          },
          categories: {},
        },
      }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach IBM Watson NLU. Check your service URL and network access." },
      { status: 502 }
    );
  }

  if (!ibmResponse.ok) {
    return NextResponse.json(
      { error: "IBM Watson NLU could not analyze the submitted reviews right now." },
      { status: 502 }
    );
  }

  const ibmResult = (await ibmResponse.json()) as IbmNluResponse;
  const documentScore = ibmResult.sentiment?.document?.score ?? 0;
  const positiveThemes = pickThemes(ibmResult.keywords ?? [], "positive");
  const negativeThemes = pickThemes(ibmResult.keywords ?? [], "negative");
  const categories = (ibmResult.categories ?? [])
    .map((category) => cleanCategoryLabel(category.label ?? ""))
    .filter(Boolean)
    .slice(0, 3);

  const response: NluAnalyzeResponse = {
    overallScore: scoreToPercentage(documentScore),
    label: scoreToLabel(documentScore),
    positiveThemes,
    negativeThemes,
    suggestions: buildSuggestions({
      label: scoreToLabel(documentScore),
      positiveThemes,
      negativeThemes,
      categories,
      reviewCount: reviews.length,
    }),
    reviewCount: reviews.length,
  };

  return NextResponse.json(response);
}
