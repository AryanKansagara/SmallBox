import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";
import {
  parseEmailRecipients,
  renderEmailCampaignHtml,
  type EmailCampaignDraft,
  type EmailCampaignSendRequest,
  type EmailCampaignSendResult,
} from "@/lib/email-campaign";

function getTransportConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT?.trim() || "0");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim();
  const secure = process.env.SMTP_SECURE?.trim() === "true";

  return { host, port, user, pass, fromEmail, secure };
}

function buildFallbackText(draft: EmailCampaignDraft): string {
  return [draft.subject, draft.preheader, draft.body, `${draft.ctaLabel}: ${draft.ctaUrl}`].join("\n\n");
}

export async function POST(request: NextRequest) {
  let payload: Partial<EmailCampaignSendRequest> & { emailList?: string };

  try {
    payload = (await request.json()) as Partial<EmailCampaignSendRequest> & { emailList?: string };
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const draft = payload.draft;
  const recipients = Array.isArray(payload.recipients) ? payload.recipients : [];
  const recipientsInput = payload.emailList ?? recipients.join("\n");

  if (!draft?.subject || !draft.preheader || !draft.body || !draft.ctaLabel || !draft.ctaUrl) {
    return NextResponse.json({ error: "Provide a complete email draft before sending." }, { status: 400 });
  }

  const parsedRecipients = parseEmailRecipients(recipientsInput);
  if (parsedRecipients.valid.length === 0) {
    return NextResponse.json({ error: "Add at least one valid recipient before sending." }, { status: 400 });
  }

  const { host, port, user, pass, fromEmail, secure } = getTransportConfig();
  if (!host || !port || !user || !pass) {
    return NextResponse.json(
      {
        error: "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in your environment.",
      },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  const sender = fromEmail || user;
  const html = renderEmailCampaignHtml(draft, payload.businessName?.trim() || "SmallBox Campaign");
  const text = buildFallbackText(draft);

  const results = await Promise.allSettled(
    parsedRecipients.valid.map((recipient) =>
      transporter.sendMail({
        from: sender,
        to: recipient,
        subject: draft.subject,
        text,
        html,
      })
    )
  );

  const acceptedRecipients: string[] = [];
  const rejectedRecipients: string[] = [];
  const providerErrors: string[] = [];

  results.forEach((result, index) => {
    const recipient = parsedRecipients.valid[index];

    if (result.status === "rejected") {
      rejectedRecipients.push(recipient);
      providerErrors.push(result.reason instanceof Error ? result.reason.message : String(result.reason));
      return;
    }

    const accepted = Array.isArray(result.value.accepted)
      ? result.value.accepted.map((value) => String(value).toLowerCase())
      : [];
    const recipientLower = recipient.toLowerCase();
    if (accepted.includes(recipientLower)) {
      acceptedRecipients.push(recipient);
      return;
    }

    rejectedRecipients.push(recipient);
    providerErrors.push("SMTP provider did not confirm recipient acceptance.");
  });

  const acceptedCount = acceptedRecipients.length;

  const sendResult: EmailCampaignSendResult = {
    acceptedCount,
    rejectedRecipients,
  };

  if (acceptedCount === 0) {
    return NextResponse.json(
      {
        ...sendResult,
        invalidRecipients: parsedRecipients.invalid,
        providerErrors,
        error: "No emails were accepted by the SMTP provider. Check sender verification and provider logs.",
      },
      { status: 502 }
    );
  }

  const partialMessage =
    rejectedRecipients.length > 0
      ? `Sent ${acceptedCount} email${acceptedCount === 1 ? "" : "s"}; ${rejectedRecipients.length} recipient${rejectedRecipients.length === 1 ? " was" : "s were"} rejected.`
      : `Sent ${acceptedCount} email${acceptedCount === 1 ? "" : "s"} successfully.`;

  return NextResponse.json({
    ...sendResult,
    invalidRecipients: parsedRecipients.invalid,
    providerErrors,
    message: partialMessage,
  });
}