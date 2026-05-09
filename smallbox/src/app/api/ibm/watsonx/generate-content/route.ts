import { NextRequest, NextResponse } from "next/server";
import { generateContentWithWatsonx, type WatsonxContentType } from "@/lib/watsonx";

const validContentTypes = new Set<WatsonxContentType>(["instagram", "facebook", "email", "ad"]);

function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export async function POST(request: NextRequest) {
  let payload: { contentType?: unknown; prompt?: unknown };

  try {
    payload = (await request.json()) as { contentType?: unknown; prompt?: unknown };
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const contentType = getString(payload.contentType) as WatsonxContentType;
  const prompt = getString(payload.prompt).trim();

  if (!validContentTypes.has(contentType)) {
    return NextResponse.json({ error: "Choose a valid content type." }, { status: 400 });
  }

  if (!prompt) {
    return NextResponse.json({ error: "Enter a topic or prompt before generating content." }, { status: 400 });
  }

  const result = await generateContentWithWatsonx({ contentType, prompt });

  return NextResponse.json({
    variations: result.variations,
    source: result.source,
    generatedAt: result.generatedAt,
    watsonxError: result.error || undefined,
  });
}
