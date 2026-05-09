export interface NluAnalyzeResponse {
  label: "positive" | "neutral" | "negative";
  overallScore: number;
  reviewCount: number;
  positiveThemes: string[];
  negativeThemes: string[];
  suggestions: string[];
  error?: string;
  sentiment?: { document?: { score: number; label: string } };
  keywords?: Array<{ text: string; relevance: number; sentiment?: { label: string } }>;
  concepts?: Array<{ text: string; relevance: number }>;
}
