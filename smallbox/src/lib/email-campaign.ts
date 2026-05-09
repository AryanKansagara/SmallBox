export type EmailCampaignTemplate = "promotional" | "newsletter" | "announcement";

export type EmailCampaignTone = "professional" | "friendly" | "bold";

export interface EmailCampaignDraftInput {
  businessName: string;
  audience: string;
  template: EmailCampaignTemplate;
  tone: EmailCampaignTone;
  offer: string;
}

export interface EmailCampaignDraft {
  subject: string;
  preheader: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}

export interface EmailCampaignSendRequest {
  recipients: string[];
  draft: EmailCampaignDraft;
  businessName: string;
}

export interface EmailCampaignSendResult {
  acceptedCount: number;
  rejectedRecipients: string[];
}

export interface ParsedEmailRecipients {
  valid: string[];
  invalid: string[];
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeText(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function cleanOffer(offer: string): string {
  const trimmed = offer.trim();
  if (!trimmed) {
    return "a limited-time offer";
  }

  return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
}

export function parseEmailRecipients(input: string): ParsedEmailRecipients {
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];

  input
    .split(/[\n,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => {
      const lower = entry.toLowerCase();
      if (!emailPattern.test(entry)) {
        invalid.push(entry);
        return;
      }

      if (seen.has(lower)) {
        return;
      }

      seen.add(lower);
      valid.push(entry);
    });

  return { valid, invalid };
}

export function createEmailCampaignDraft(input: EmailCampaignDraftInput): EmailCampaignDraft {
  const businessName = titleCase(normalizeText(input.businessName, "Your business"));
  const audience = normalizeText(input.audience, "your customers");
  const offer = cleanOffer(input.offer);

  const toneIntro = {
    professional: "This message keeps the tone polished and direct.",
    friendly: "This message sounds warm, clear, and easy to read.",
    bold: "This message is written to feel energetic and action-oriented.",
  }[input.tone];

  const subjectByTemplate = {
    promotional: `${businessName}: ${offer}`,
    newsletter: `${businessName} update for ${audience}`,
    announcement: `Important update from ${businessName}`,
  }[input.template];

  const preheaderByTemplate = {
    promotional: `A quick email for ${audience} with a simple next step.`,
    newsletter: `A short update you can send to ${audience} right away.`,
    announcement: `Share this update with ${audience} before your next send.`,
  }[input.template];

  const bodyByTemplate = {
    promotional: [
      `Hi there,`,
      `We put together a promotion for ${businessName} that speaks directly to ${audience}. ${toneIntro} The offer is simple: ${offer}`,
      `You can edit this draft before sending so it matches your brand voice and timing.`,
    ],
    newsletter: [
      `Hi there,`,
      `${businessName} has a fresh update for ${audience}. ${toneIntro} Use this note to share what is new, what matters most, and what customers should know next.`,
      `If you want to adjust the message, you can update the subject, preheader, and body before the campaign goes out.`,
    ],
    announcement: [
      `Hi there,`,
      `We drafted a clear announcement for ${businessName} so you can keep ${audience} informed. ${toneIntro} This version is ready for quick review and editing.`,
      `Use the preview to finalize the message, then send it when you are ready.`,
    ],
  }[input.template];

  const ctaLabelByTemplate = {
    promotional: "Claim Offer",
    newsletter: "Read Update",
    announcement: "See Details",
  }[input.template];

  return {
    subject: subjectByTemplate,
    preheader: preheaderByTemplate,
    body: bodyByTemplate.join("\n\n"),
    ctaLabel: ctaLabelByTemplate,
    ctaUrl: "https://example.com",
  };
}

export function renderEmailCampaignHtml(draft: EmailCampaignDraft, businessName: string): string {
  const escapedBody = draft.body
    .split(/\n\n/)
    .map((paragraph) => `<p style="margin: 0 0 16px; line-height: 1.6; color: #334155;">${paragraph}</p>`)
    .join("");

  return `
    <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:32px;">
          <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e2e8f0;">
            <div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:6px;">${businessName}</div>
            <div style="font-size:12px;color:#64748b;">${draft.subject}</div>
          </div>
          <div style="font-size:16px;font-weight:600;color:#0f172a;margin-bottom:12px;">${draft.preheader}</div>
          ${escapedBody}
          <div style="text-align:center;margin:28px 0 20px;">
            <a href="${draft.ctaUrl}" style="display:inline-block;background:#0062ff;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:14px;font-weight:700;">${draft.ctaLabel}</a>
          </div>
          <div style="font-size:12px;color:#94a3b8;text-align:center;">If you do not want to receive future emails, unsubscribe anytime.</div>
        </div>
      </div>
    </div>
  `;
}