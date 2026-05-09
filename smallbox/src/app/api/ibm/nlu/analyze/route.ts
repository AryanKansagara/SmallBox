import { NextRequest, NextResponse } from "next/server";
import { NluAnalyzeResponse } from "@/lib/ibm-nlu";

export async function POST(_req: NextRequest) {
  // Stub — replace with real IBM Watson NLU API call when credentials are ready
  const stub: NluAnalyzeResponse = {
    label: "positive",
    overallScore: 78,
    reviewCount: 4,
    positiveThemes: ["quality", "custom cakes", "friendly staff", "taste"],
    negativeThemes: ["delivery timing"],
    suggestions: [
      "Send automated SMS confirmations with estimated delivery windows to address delivery timing concerns.",
      "Highlight your staff's friendliness in your next marketing campaign — it's your top differentiator.",
      "Respond to all reviews publicly within 24 hours to show engagement and build trust.",
    ],
    sentiment: { document: { score: 0.72, label: "positive" } },
    keywords: [
      { text: "custom cakes", relevance: 0.91 },
      { text: "quality", relevance: 0.85 },
      { text: "delivery", relevance: 0.72 },
    ],
  };

  return NextResponse.json(stub);
}
