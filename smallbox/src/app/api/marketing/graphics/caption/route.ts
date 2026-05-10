import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/watsonx";

export interface CaptionRequest {
  platform: string;
  postType: string;
  details: string;
  tone: string;
  businessName?: string;
  industry?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CaptionRequest;
    const { platform, postType, details, tone, businessName = "our business", industry = "small business" } = body;

    const prompt = `You are a social media copywriter for ${businessName}, a ${industry}.

Write exactly 3 distinct ${platform} ${postType} captions for this brief:
Platform: ${platform}
Post type: ${postType}
Tone: ${tone}
Details: ${details}

Requirements:
- Output plain text only, no JSON, no markdown fences, no commentary
- Prefix each option with 1., 2., and 3. on its own line
- Match the tone: ${tone}
- Each caption should be meaningfully different in angle or hook
- Include relevant hashtags for ${platform} content
- Keep captions ready to post, no placeholders

Start immediately with the numbered captions.`;

    const result = await generateText(prompt, 600);

    const lines = (result.text || "").split("\n");
    const captions: string[] = [];

    for (const line of lines) {
      const match = line.trim().match(/^\d+\.\s+(.+)$/);
      if (match) captions.push(match[1].trim());
    }

    if (captions.length < 3) {
      const fallbacks = buildFallbackCaptions(platform, postType, details, tone, businessName);
      return NextResponse.json({
        captions: captions.length > 0 ? captions : fallbacks,
        source: "local",
        error: result.error ?? "Could not parse watsonx response",
      });
    }

    return NextResponse.json({ captions: captions.slice(0, 3), source: result.source });
  } catch (err) {
    console.error("Caption generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

function buildFallbackCaptions(
  platform: string,
  postType: string,
  details: string,
  tone: string,
  businessName: string,
): string[] {
  const brief = details.slice(0, 80);
  const tags = `#${platform.toLowerCase()} #smallbusiness #${businessName.replace(/\s+/g, "").toLowerCase()}`;

  if (tone === "Casual") {
    return [
      `Hey everyone! ${brief} — come check it out! 🙌 ${tags}`,
      `Just dropping in to share: ${brief}. You're going to love it! ✨ ${tags}`,
      `Quick update from ${businessName}: ${brief} 🎉 ${tags}`,
    ];
  }
  if (tone === "Professional") {
    return [
      `We are pleased to announce: ${brief}. Learn more today. ${tags}`,
      `${businessName} is proud to share: ${brief}. Contact us for details. ${tags}`,
      `Exciting news from ${businessName}: ${brief}. Reach out to get started. ${tags}`,
    ];
  }
  return [
    `✨ ${brief} — made just for you! ${tags}`,
    `🚀 Big things are happening at ${businessName}: ${brief} ${tags}`,
    `💫 You asked, we delivered: ${brief}. Tag someone who needs this! ${tags}`,
  ];
}
