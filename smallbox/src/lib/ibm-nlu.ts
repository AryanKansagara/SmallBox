export type SentimentLabel = "positive" | "neutral" | "negative";

export interface NluAnalyzeRequest {
  reviewsText: string;
}

export interface NluAnalyzeResponse {
  overallScore: number;
  label: SentimentLabel;
  positiveThemes: string[];
  negativeThemes: string[];
  suggestions: string[];
  reviewCount: number;
}

export const DEFAULT_IBM_NLU_VERSION = "2022-08-10";

export function normalizeReviewsText(reviewsText: string): string[] {
  return reviewsText
    .split(/\r?\n/)
    .map((review) => review.trim())
    .filter(Boolean);
}

export function scoreToLabel(score: number): SentimentLabel {
  if (score >= 0.2) return "positive";
  if (score <= -0.2) return "negative";
  return "neutral";
}

export function scoreToPercentage(score: number): number {
  return Math.max(0, Math.min(100, Math.round((score + 1) * 50)));
}

export function cleanCategoryLabel(category: string): string {
  const parts = category.split("/").filter(Boolean);
  if (parts.length === 0) return category.trim();
  return parts[parts.length - 1].replace(/-/g, " ").trim();
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

export function buildSuggestions(params: {
  label: SentimentLabel;
  positiveThemes: string[];
  negativeThemes: string[];
  categories: string[];
  reviewCount: number;
}): string[] {
  const { label, positiveThemes, negativeThemes, categories, reviewCount } = params;
  const suggestions: string[] = [];

  if (negativeThemes.length > 0) {
    const primaryIssue = titleCase(negativeThemes[0]);
    suggestions.push(`Address ${primaryIssue.toLowerCase()} directly in customer messaging and operational follow-ups.`);
  }

  if (positiveThemes.length > 0) {
    const standoutStrength = titleCase(positiveThemes[0]);
    suggestions.push(`Lean into ${standoutStrength.toLowerCase()} in your website and social content because customers already mention it positively.`);
  }

  if (suggestions.length < 2 && categories.length > 0) {
    suggestions.push(`Use your review themes to shape the next campaign for your ${categories[0].toLowerCase()} audience.`);
  }

  if (suggestions.length < 2) {
    if (label === "negative") {
      suggestions.push("Follow up with recent customers after purchase and ask one targeted question to pinpoint the biggest friction point.");
    } else if (label === "positive") {
      suggestions.push("Turn your strongest reviews into testimonials and feature them in your next email or landing page update.");
    } else {
      suggestions.push("Ask customers for more detailed feedback so future review analysis has clearer strengths and concerns to act on.");
    }
  }

  if (suggestions.length < 2 && reviewCount <= 2) {
    suggestions.push("Collect a few more reviews before making major business changes so the signal is less noisy.");
  }

  return unique(suggestions).slice(0, 2);
}
