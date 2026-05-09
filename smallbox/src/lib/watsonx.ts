import {
	createEmailCampaignDraft,
	type EmailCampaignDraft,
	type EmailCampaignDraftInput,
	type EmailCampaignTemplate,
	type EmailCampaignTone,
} from "./email-campaign";

export type WatsonxContentType = "instagram" | "facebook" | "email" | "ad";

export type WatsonxSource = "watsonx" | "local";

export interface WatsonxGenerationResult {
	text: string;
	source: WatsonxSource;
	generatedAt: string;
	error?: string;
}

export interface WatsonxCategorizationResult {
	category: string;
	transactionType: "income" | "expense";
	source: WatsonxSource;
	generatedAt: string;
	error?: string;
}

export interface WatsonxEmailGenerationInput {
	businessName: string;
	audience: string;
	template: EmailCampaignTemplate;
	tone: EmailCampaignTone;
	offer: string;
}

export interface WatsonxContentGenerationInput {
	contentType: WatsonxContentType;
	prompt: string;
}

export interface WatsonxContentGenerationResult {
	variations: string[];
	source: WatsonxSource;
	generatedAt: string;
	error?: string;
}

export interface WatsonxEmailGenerationResult {
	draft: EmailCampaignDraft;
	source: WatsonxSource;
	generatedAt: string;
	error?: string;
}

const WATSONX_VERSION = "2024-03-19";

function getWatsonxConfig() {
	const apiKey = process.env.WATSONX_API_KEY?.trim();
	const projectId = process.env.WATSONX_PROJECT_ID?.trim();
	const url = process.env.WATSONX_URL?.trim();
	const modelId = process.env.WATSONX_MODEL_ID?.trim() || "ibm/granite-13b-chat-v2";

	return { apiKey, projectId, url, modelId };
}

export function isWatsonxConfigured(): boolean {
	const { apiKey, projectId, url } = getWatsonxConfig();
	return Boolean(apiKey && projectId && url);
}

function normalizeBaseUrl(url: string): string {
	const trimmed = url.replace(/\/$/, "");

	if (trimmed.endsWith("/ml/v1")) {
		return trimmed;
	}

	if (trimmed.includes(".ml.cloud.ibm.com")) {
		return `${trimmed}/ml/v1`;
	}

	return trimmed;
}

async function getWatsonxAccessToken(apiKey: string): Promise<string> {
	const response = await fetch("https://iam.cloud.ibm.com/identity/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Accept: "application/json",
		},
		body: new URLSearchParams({
			grant_type: "urn:ibm:params:oauth:grant-type:apikey",
			apikey: apiKey,
		}),
	});

	if (!response.ok) {
		throw new Error(`Failed to obtain Watsonx access token: ${response.status} ${response.statusText}`);
	}

	const data = (await response.json()) as { access_token?: string };
	if (!data.access_token) {
		throw new Error("Watsonx access token response did not include access_token");
	}

	return data.access_token;
}

async function callWatsonx(prompt: string): Promise<WatsonxGenerationResult> {
	const { apiKey, projectId, url, modelId } = getWatsonxConfig();

	if (!apiKey || !projectId || !url) {
		return {
			text: "",
			source: "local",
			generatedAt: new Date().toISOString(),
			error: "WATSONX_API_KEY, WATSONX_PROJECT_ID, or WATSONX_URL not configured",
		};
	}

	const accessToken = await getWatsonxAccessToken(apiKey);
	const baseUrl = normalizeBaseUrl(url);

	const response = await fetch(`${baseUrl}/text/chat?version=${WATSONX_VERSION}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify({
			model_id: modelId,
			messages: [{ role: "user", content: prompt }],
			max_tokens: 2048,
			temperature: 0.7,
			top_p: 1,
			project_id: projectId,
		}),
	});

	if (!response.ok) {
		const errorBody = await response.text().catch(() => "");
		throw new Error(`Watsonx API error: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`);
	}

	const rawData = (await response.json()) as Record<string, unknown>;
	let generatedText = "";

	if (Array.isArray(rawData.choices)) {
		const choices = rawData.choices as unknown[];
		const choice = (choices[0] ?? {}) as Record<string, unknown>;
		const message = choice.message as Record<string, unknown> | undefined;
		if (message && typeof message.content === "string") {
			generatedText = message.content;
		}
	}

	if (!generatedText && Array.isArray(rawData.results)) {
		const results = rawData.results as unknown[];
		const result = (results[0] ?? {}) as Record<string, unknown>;
		if (typeof result.generated_text === "string") {
			generatedText = result.generated_text;
		}
	}

	if (!generatedText) {
		throw new Error("No generated text in Watsonx response");
	}

	return {
		text: generatedText,
		source: "watsonx",
		generatedAt: new Date().toISOString(),
	};
}

function cleanWhitespace(value: string): string {
	return value.replace(/\s+/g, " ").trim();
}

function firstWords(value: string, limit: number): string[] {
	return cleanWhitespace(value)
		.toLowerCase()
		.replace(/[^a-z0-9\s']/g, " ")
		.split(/\s+/)
		.filter((word) => word.length > 3)
		.filter((word, index, words) => words.indexOf(word) === index)
		.slice(0, limit);
}

function toTitleCase(value: string): string {
	return cleanWhitespace(value)
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function buildContentPrompt(contentType: WatsonxContentType, prompt: string): string {
	const typeGuide = {
		instagram: "Instagram caption",
		facebook: "Facebook post",
		email: "Email copy",
		ad: "Google ad copy",
	};

	return `You are a senior marketing copywriter.

Write exactly 3 distinct ${typeGuide[contentType]} options for this brief: ${cleanWhitespace(prompt)}

Requirements:
- Output plain text only, no JSON, no markdown fences, no commentary
- Put each option on its own line
- Prefix each line with 1., 2., and 3.
- Keep each option concise, punchy, and ready to post
- Make each option meaningfully different in angle, hook, or wording
- If useful, include relevant hashtags for social content

Start immediately with the numbered options.`;
}

function buildEmailPrompt(
	template: EmailCampaignTemplate,
	tone: EmailCampaignTone,
	businessName: string,
	audience: string,
	offer: string,
): string {
	const exampleDrafts = {
		promotional: [
			"Subject: Exclusive offer for you\nPreheader: A limited-time way to save today\nBody: We made this offer just for our customers. Enjoy the savings while they last.\nCTA: Claim Offer",
			"Subject: Your special deal is here\nPreheader: Unlock savings before it ends\nBody: It is the perfect time to grab something you have had your eye on.\nCTA: Shop Now",
		],
		newsletter: [
			"Subject: This week’s updates from our team\nPreheader: Helpful ideas, news, and a quick win\nBody: Here is a short update with practical tips you can use right away.\nCTA: Read More",
			"Subject: Fresh insights inside\nPreheader: A quick look at what is new\nBody: We rounded up the most useful updates so you can stay in the loop.\nCTA: Explore",
		],
		announcement: [
			"Subject: Important update from our team\nPreheader: Here is what is changing and why\nBody: We are sharing an important update that will improve your experience.\nCTA: Learn More",
			"Subject: New update now available\nPreheader: See what is new today\nBody: We are excited to announce a new update that gives you more value and clarity.\nCTA: View Details",
		],
	};

	const toneGuide = {
		professional: "Use polished, clear, business-appropriate language with a confident tone.",
		friendly: "Use warm, conversational language that feels approachable and human.",
		bold: "Use energetic, persuasive language that creates urgency and excitement.",
	};

	const templateGuide = {
		promotional: "Focus on value, discounts, offers, and a direct call to action.",
		newsletter: "Focus on useful updates, insights, and a helpful conversational style.",
		announcement: "Focus on clear updates, new information, and an informative tone.",
	};

	const examples = exampleDrafts[template].join("\n\n");

	return `You are an expert email marketing copywriter.

Create a ${template} email for ${businessName} aimed at ${audience}.
Promote this offer or message: ${offer}

Tone guidance: ${toneGuide[tone]}
Template guidance: ${templateGuide[template]}

Reference examples:
${examples}

Requirements:
- Return valid JSON only
- Subject: 40-60 characters
- Preheader: 40-80 characters
- Body: 200-400 characters
- CTA label: 2-4 words
- CTA URL: use https://example.com/offer
- No markdown fences, no extra commentary

CRITICAL: Output ONLY valid JSON with no additional text or commentary.

Start your response with { and end with }

{
	"subject": "...",
	"preheader": "...",
	"body": "...",
	"ctaLabel": "...",
	"ctaUrl": "https://example.com/offer"
}`;
}

function extractJsonBlock(text: string): string | null {
	const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");

	const objectMatch = trimmed.match(/\{[\s\S]*\}/);
	if (objectMatch) {
		return objectMatch[0];
	}

	const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
	if (arrayMatch) {
		return arrayMatch[0];
	}

	return null;
}

function extractResultVariations(generatedText: string): string[] {
	const lines = generatedText.split("\n");
	const numbered: string[] = [];

	for (const line of lines) {
		const match = line.trim().match(/^\d+\.\s+(.+)$/);
		if (match) {
			numbered.push(match[1].trim());
		}
	}

	if (numbered.length >= 3) {
		return numbered.slice(0, 3);
	}

	const cleaned = lines.map((line) => line.trim()).filter(Boolean);
	if (cleaned.length >= 3) {
		return cleaned.slice(0, 3);
	}

	const jsonBlock = extractJsonBlock(generatedText);
	if (!jsonBlock) {
		throw new Error("Invalid JSON in Watsonx response");
	}

	const parsed = JSON.parse(jsonBlock) as { variations?: unknown };
	if (!Array.isArray(parsed.variations)) {
		throw new Error("Watsonx response did not include variations");
	}

	return parsed.variations.map((variation) => String(variation).trim()).filter(Boolean);
}

function extractEmailDraft(generatedText: string): EmailCampaignDraft {
	const jsonBlock = extractJsonBlock(generatedText);
	if (!jsonBlock) {
		throw new Error("Invalid JSON in Watsonx response");
	}

	const draft = JSON.parse(jsonBlock) as Partial<EmailCampaignDraft>;
	if (!draft.subject || !draft.preheader || !draft.body || !draft.ctaLabel || !draft.ctaUrl) {
		throw new Error("Incomplete draft generated by Watsonx");
	}

	return {
		subject: String(draft.subject).trim(),
		preheader: String(draft.preheader).trim(),
		body: String(draft.body).trim(),
		ctaLabel: String(draft.ctaLabel).trim(),
		ctaUrl: String(draft.ctaUrl).trim(),
	};
}

function buildFallbackContentVariations(input: WatsonxContentGenerationInput): string[] {
	const brief = cleanWhitespace(input.prompt);
	const keywords = firstWords(brief, 4);
	const keywordLine = keywords.length > 0 ? keywords.join(" ") : brief;
	const titleBrief = toTitleCase(brief);
	const hashtagGroup = keywords.length > 0
		? keywords.map((word) => `#${word.replace(/[^a-z0-9]/gi, "")}`).join(" ")
		: "#marketing #content #brand";
	const promptLead = brief.length > 100 ? `${brief.slice(0, 97).trimEnd()}...` : brief;

	switch (input.contentType) {
		case "instagram":
			return [
				`✨ ${titleBrief} — made to stand out. ${hashtagGroup}`,
				`Say hello to ${keywordLine}. Designed to grab attention fast. ${hashtagGroup}`,
				`Turn ${keywordLine} into a scroll-stopping moment. ${hashtagGroup}`,
			];
		case "facebook":
			return [
				`We are excited to share ${promptLead}. It is a great way to connect with your audience and keep the momentum going.`,
				`If you are looking for something fresh, ${promptLead} is built to get people talking and drive engagement.`,
				`A new opportunity is here: ${promptLead}. Share it with your audience and invite them to take the next step.`,
			];
		case "email":
			return [
				`Subject: ${titleBrief}\nPreview: A quick update worth opening\nBody: ${promptLead}. Learn more and take action today.`,
				`Subject: New from our team\nPreview: Something useful for you inside\nBody: ${titleBrief} is here, and we think you will love what it can do.`,
				`Subject: Your next step starts here\nPreview: Fresh ideas, clear value, and a simple CTA\nBody: Explore ${keywordLine} and see why it matters now.`,
			];
		case "ad":
			return [
				`Headline: ${titleBrief}\nDescription: ${promptLead}`,
				`Try ${keywordLine}. Simple, clear, and ready to convert.`,
				`${titleBrief} — the fast way to get attention and drive clicks.`,
			];
		default:
			return [promptLead, `${titleBrief} — variation two`, `${titleBrief} — variation three`];
	}
}

function classifyTransaction(description: string): { category: string; transactionType: "income" | "expense" } {
	const text = description.toLowerCase();

	if (/salary|invoice|payment received|deposit|income|revenue|sale/.test(text)) {
		return { category: "income", transactionType: "income" };
	}

	if (/rent|office|software|subscription|ads|marketing|travel|meals|supplies|equipment|utilities|tax|fee|expense/.test(text)) {
		return { category: text.includes("ads") || text.includes("marketing") ? "marketing" : "expense", transactionType: "expense" };
	}

	return { category: "general", transactionType: "expense" };
}

export async function generateText(
	prompt: string,
	_maxTokens = 350,
	_stopSequences: string[] = [],
): Promise<WatsonxGenerationResult> {
	try {
		return await callWatsonx(prompt);
	} catch (error) {
		return {
			text: "",
			source: "local",
			generatedAt: new Date().toISOString(),
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

export async function categorizeTransaction(
	description: string,
	_amount?: number,
): Promise<WatsonxCategorizationResult> {
	if (!isWatsonxConfigured()) {
		const local = classifyTransaction(description);
		return {
			...local,
			source: "local",
			generatedAt: new Date().toISOString(),
		};
	}

	const prompt = `Classify this transaction description into one category and whether it is income or expense. Return JSON only.

Description: ${description}

Return format:
{ "category": "...", "transactionType": "income" or "expense" }`;

	const result = await generateText(prompt, 120);
	if (result.source !== "watsonx" || !result.text) {
		const local = classifyTransaction(description);
		return {
			...local,
			source: "local",
			generatedAt: new Date().toISOString(),
			error: result.error,
		};
	}

	try {
		const jsonBlock = extractJsonBlock(result.text);
		if (!jsonBlock) throw new Error("No JSON response");
		const parsed = JSON.parse(jsonBlock) as { category?: unknown; transactionType?: unknown };
		const category = typeof parsed.category === "string" && parsed.category.trim() ? parsed.category.trim() : classifyTransaction(description).category;
		const transactionType = parsed.transactionType === "income" || parsed.transactionType === "expense"
			? parsed.transactionType
			: classifyTransaction(description).transactionType;

		return {
			category,
			transactionType,
			source: "watsonx",
			generatedAt: result.generatedAt,
		};
	} catch {
		const local = classifyTransaction(description);
		return {
			...local,
			source: "local",
			generatedAt: new Date().toISOString(),
			error: "Failed to parse watsonx categorization response",
		};
	}
}

export async function categorizeTransactionsBatch(
	items: Array<{ description: string; amount?: number }>,
): Promise<Array<{ description: string; category: string; transactionType: "income" | "expense"; source: WatsonxSource }>> {
	return Promise.all(
		items.map(async (item) => {
			const result = await categorizeTransaction(item.description, item.amount);
			return {
				description: item.description,
				category: result.category,
				transactionType: result.transactionType,
				source: result.source,
			};
		}),
	);
}

export async function generateEmailWithWatsonx(
	input: WatsonxEmailGenerationInput,
): Promise<WatsonxEmailGenerationResult> {
	const prompt = buildEmailPrompt(input.template, input.tone, input.businessName, input.audience, input.offer);

	try {
		const result = await callWatsonx(prompt);
		if (result.source !== "watsonx" || !result.text) {
			return {
				draft: createEmailCampaignDraft(input as EmailCampaignDraftInput),
				source: "local",
				generatedAt: new Date().toISOString(),
				error: result.error,
			};
		}

		return {
			draft: extractEmailDraft(result.text),
			source: "watsonx",
			generatedAt: result.generatedAt,
		};
	} catch (error) {
		return {
			draft: createEmailCampaignDraft(input as EmailCampaignDraftInput),
			source: "local",
			generatedAt: new Date().toISOString(),
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

export async function generateContentWithWatsonx(
	input: WatsonxContentGenerationInput,
): Promise<WatsonxContentGenerationResult> {
	try {
		const result = await callWatsonx(buildContentPrompt(input.contentType, input.prompt));
		if (result.source !== "watsonx" || !result.text) {
			return {
				variations: buildFallbackContentVariations(input),
				source: "local",
				generatedAt: new Date().toISOString(),
				error: result.error,
			};
		}

		return {
			variations: extractResultVariations(result.text),
			source: "watsonx",
			generatedAt: result.generatedAt,
		};
	} catch (error) {
		return {
			variations: buildFallbackContentVariations(input),
			source: "local",
			generatedAt: new Date().toISOString(),
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
