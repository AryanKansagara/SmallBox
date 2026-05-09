import { NextRequest, NextResponse } from "next/server";
import { categorizeTransaction, isWatsonxConfigured } from "@/lib/watsonx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { description?: string; amount?: number };
  try {
    body = (await req.json()) as { description?: string; amount?: number };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const description = body.description?.toString().trim() ?? "";
  if (!description) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  try {
    const result = await categorizeTransaction(description, body.amount);
    return NextResponse.json({
      category: result.category,
      transactionType: result.transactionType,
      source: result.source,
      powered_by: isWatsonxConfigured() ? "watsonx.ai (ibm/granite-3-8b-instruct)" : "local-classifier",
    });
  } catch (err) {
    console.error("POST /api/finance/categorize error:", err);
    return NextResponse.json({ error: "Categorization failed" }, { status: 500 });
  }
}
