import { NextRequest, NextResponse } from "next/server";
import { StitchToolClient } from "@google/stitch-sdk";

const STITCH_PROJECT_ID = "9080752046954043293";

export interface WebsiteFormData {
  businessName: string;
  industry: string;
  description: string;
  callToAction: string;
  pages: string[];
  vibe: string;
  brandColor: string;
  hasLogo: boolean;
  details: string;
}

function buildStitchPrompt(form: WebsiteFormData): string {
  const servicesList = form.pages.includes("Services")
    ? `Include a dedicated services section.` : "";
  const contactBlock = form.pages.includes("Contact")
    ? `Include a contact section with a form that has name, email, message fields and a submit button.` : "";
  const galleryBlock = form.pages.includes("Gallery")
    ? `Include a photo gallery or portfolio section.` : "";
  const faqBlock = form.pages.includes("FAQ")
    ? `Include an FAQ accordion section with 3–5 commonly asked questions.` : "";
  const aboutBlock = form.pages.includes("About")
    ? `Include a compelling about/story section.` : "";

  return `Design a complete, professional business website homepage for the following business:

**Business:** ${form.businessName}
**Industry:** ${form.industry || "Small Business"}
**Description:** ${form.description || `A professional ${form.industry || "small"} business`}
**Primary Goal:** Encourage visitors to ${form.callToAction.toLowerCase()}
**Visual Style:** ${form.vibe}
**Brand Color:** ${form.brandColor}
${form.details ? `**Business Details:** ${form.details}` : ""}

**Pages to include:** ${form.pages.join(", ")}

**Requirements:**
- Professional navigation bar with logo placeholder, nav links to each page, and a primary CTA button labeled "${form.callToAction}"
- Hero section with a bold headline, supporting tagline, and a prominent "${form.callToAction}" button in ${form.brandColor}
${aboutBlock}
${servicesList}
${contactBlock}
${galleryBlock}
${faqBlock}
- Professional footer with business name, nav links, and contact info

**Design System:**
- Primary color: ${form.brandColor}
- Typography: IBM Plex Sans (professional SaaS feel)
- Style: ${form.vibe} — dark background (#07080f), glass-card surfaces with subtle borders, rounded-xl corners
- Glassmorphism cards with backdrop-blur
- Smooth hover transitions on all interactive elements
- Mobile-responsive layout

Make it look like a premium, enterprise-quality website that builds immediate trust for a ${form.industry || "small"} business. The primary CTA "${form.callToAction}" should appear prominently in the hero and repeated in the footer.`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractScreen(result: any) {
  const outputComponents = result?.outputComponents ?? [];
  for (const component of outputComponents) {
    const screens = component?.design?.screens;
    if (Array.isArray(screens) && screens.length > 0) return screens[0];
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const form: WebsiteFormData = await req.json();
    const apiKey = process.env.STITCH_API_KEY || process.env.GOOGLE_STITCH_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "STITCH_API_KEY is not configured" }, { status: 500 });
    }

    const prompt = buildStitchPrompt(form);
    const client = new StitchToolClient({ apiKey });

    try {
      const result = await client.callTool("generate_screen_from_text", {
        projectId: STITCH_PROJECT_ID,
        prompt,
        deviceType: "DESKTOP",
        modelId: "GEMINI_3_1_PRO",
      });

      const screen = extractScreen(result);
      if (!screen) {
        return NextResponse.json(
          { error: "Stitch generation did not return a screen" },
          { status: 500 }
        );
      }

      const screenName: string = screen.name ?? "";
      const screenId: string = screen.id ?? screenName.split("/").pop() ?? "";
      const title: string = screen.title ?? form.businessName;

      // Fetch the HTML content server-side so the client doesn't need auth
      let htmlContent = "";
      const htmlCodeUrl: string =
        typeof screen.htmlCode === "object" ? screen.htmlCode?.downloadUrl ?? "" : "";

      if (htmlCodeUrl) {
        try {
          const htmlRes = await fetch(htmlCodeUrl);
          if (htmlRes.ok) htmlContent = await htmlRes.text();
        } catch {
          // non-fatal — iframe will show empty
        }
      }

      return NextResponse.json({ screenId, screenName, title, htmlContent, prompt });
    } finally {
      await client.close();
    }
  } catch (err) {
    console.error("Stitch generate route error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
