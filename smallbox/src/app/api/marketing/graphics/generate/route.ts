import { NextRequest, NextResponse } from "next/server";

// Aspect ratios per format
const DIMENSIONS: Record<string, { width: number; height: number }> = {
  "Instagram Post":        { width: 1080, height: 1080 },
  "Instagram Story":       { width: 1080, height: 1920 },
  "Instagram Reel Cover":  { width: 1080, height: 1920 },
  "Facebook Post":         { width: 1200, height: 630 },
  "Facebook Cover":        { width: 1640, height: 624 },
  "Facebook Ad":           { width: 1200, height: 628 },
  "Twitter Post":          { width: 1600, height: 900 },
  "Twitter Header":        { width: 1500, height: 500 },
  "LinkedIn Post":         { width: 1200, height: 627 },
  "LinkedIn Article Banner": { width: 1920, height: 1080 },
};

export interface GraphicsGenerateRequest {
  platform: string;
  postType: string;
  caption: string;
  brandColor?: string;
  businessName?: string;
  industry?: string;
  tone?: string;
}

function buildImagePrompt(req: GraphicsGenerateRequest): string {
  const { platform, postType, caption, brandColor = "#7b2fff", businessName = "a business", industry = "small business", tone = "Professional" } = req;

  const toneMap: Record<string, string> = {
    Casual: "warm, friendly, approachable",
    Professional: "clean, corporate, polished",
    Playful: "vibrant, fun, energetic",
    Inspirational: "uplifting, motivational, bold",
    Bold: "striking, high-contrast, impactful",
  };
  const mood = toneMap[tone] ?? "professional, modern";

  // Strip hashtags from caption for the image prompt — they clutter image gen
  const cleanCaption = caption.replace(/#\S+/g, "").trim().slice(0, 120);

  return `A professional ${platform} ${postType} social media graphic for ${businessName}, a ${industry} business. ${mood} visual style. Brand accent color ${brandColor}. The graphic promotes: "${cleanCaption}". High quality digital marketing design, no text overlay needed, clean background, modern layout. 8k, sharp, advertisement quality.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GraphicsGenerateRequest;
    const { platform, postType } = body;

    const dims = DIMENSIONS[`${platform} ${postType}`] ?? { width: 1080, height: 1080 };

    const imagePrompt = buildImagePrompt(body);
    const encodedPrompt = encodeURIComponent(imagePrompt);

    // Pollinations.ai — free, no auth, returns image directly
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dims.width}&height=${dims.height}&model=flux&nologo=true&seed=${Date.now()}`;

    // Probe the URL to catch errors before sending to client
    const probe = await fetch(imageUrl, { method: "HEAD" }).catch(() => null);
    if (probe && !probe.ok) {
      return NextResponse.json(
        { error: `Image generation service returned ${probe.status}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      imageUrl,
      width: dims.width,
      height: dims.height,
      prompt: imagePrompt,
      provider: "Pollinations.ai (Flux)",
    });
  } catch (err) {
    console.error("Graphics generate error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
