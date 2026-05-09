/**
 * POST /api/finance/categorize-batch
 *
 * Classifies an array of transaction descriptions in a SINGLE watsonx.ai call.
 * Cache hits are resolved before the API call, so repeated descriptions never
 * consume tokens.
 *
 * Free-tier impact: a 20-row CSV upload = 1 API call instead of 20.
 *
 * Body: { items: Array<{ description: string; amount?: number }> }
 * Response: { results: Array<{ category, transactionType, source }> }
 */

import { NextRequest, NextResponse } from "next/server";
import { categorizeTransactionsBatch } from "@/lib/watsonx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { items?: Array<{ description?: string; amount?: number }> };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const items = (body.items ?? [])
    .filter((it) => typeof it.description === "string" && it.description.trim())
    .map((it) => ({
      description: it.description!.trim().slice(0, 200),
      amount: typeof it.amount === "number" ? it.amount : undefined,
    }))
    .slice(0, 100); // hard cap — free tier protection

  if (items.length === 0) {
    return NextResponse.json({ error: "Provide at least one item" }, { status: 400 });
  }

  try {
    const results = await categorizeTransactionsBatch(items);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("POST /api/finance/categorize-batch error:", err);
    return NextResponse.json({ error: "Batch categorization failed" }, { status: 500 });
  }
}
