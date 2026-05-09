/**
 * GET /api/finance/list-models
 * Lists all foundation models available in your watsonx.ai region.
 * Temporary diagnostic endpoint — remove after finding the right model ID.
 */
import { NextResponse } from "next/server";
import { getWatsonxIamToken } from "@/lib/ibm-iam";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = (process.env.WATSONX_URL ?? "https://us-south.ml.cloud.ibm.com").replace(/\/+$/, "");
  try {
    const token = await getWatsonxIamToken();
    const res = await fetch(`${baseUrl}/ml/v1/foundation_model_specs?version=2024-05-01&limit=200`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const data = await res.json() as { resources?: Array<{ model_id: string; name: string }> };
    const models = (data.resources ?? []).map((m) => ({ id: m.model_id, name: m.name }));
    return NextResponse.json({ region: baseUrl, count: models.length, models });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
