import { NextRequest, NextResponse } from "next/server";
import {
  createEmailCampaignDraft,
  type EmailCampaignDraftInput,
  type EmailCampaignTone,
  type EmailCampaignTemplate,
} from "@/lib/email-campaign";
import { generateEmailWithWatsonx } from "@/lib/watsonx";

interface GenerateEmailRequest extends EmailCampaignDraftInput {
  recipientCount?: number;
}

const validTemplates = new Set<EmailCampaignTemplate>(["promotional", "newsletter", "announcement"]);
const validTones = new Set<EmailCampaignTone>(["professional", "friendly", "bold"]);

function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export async function POST(request: NextRequest) {
  let payload: Partial<GenerateEmailRequest>;

  try {
    payload = (await request.json()) as Partial<GenerateEmailRequest>;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const template = getString(payload.template) as EmailCampaignTemplate;
  const tone = getString(payload.tone) as EmailCampaignTone;

  if (!validTemplates.has(template)) {
    return NextResponse.json({ error: "Choose a valid email template." }, { status: 400 });
  }

  if (!validTones.has(tone)) {
    return NextResponse.json({ error: "Choose a valid email tone." }, { status: 400 });
  }

  const businessName = getString(payload.businessName, "Your business");
  const audience = getString(payload.audience, "your customers");
  const offer = getString(payload.offer, "a limited-time offer");

  // Try watsonx.ai first; fallback to local templates if it fails or isn't configured
  const result = await generateEmailWithWatsonx({
    businessName,
    audience,
    template,
    tone,
    offer,
  });

  // If watsonx failed, use local template as fallback
  let draft = result.draft;
  const source = result.source;

  if (result.error && source === "local") {
    // Watsonx failed; replace placeholder draft with proper local template
    draft = createEmailCampaignDraft({
      businessName,
      audience,
      template,
      tone,
      offer,
    });
  }

  return NextResponse.json({
    draft,
    source,
    recipientCount: Number(payload.recipientCount ?? 0),
    generatedAt: new Date().toISOString(),
    watsonxError: result.error || undefined,
  });
}
