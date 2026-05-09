"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHeader } from "@/components/DashboardHeader";
import { type NluAnalyzeResponse } from "@/lib/ibm-nlu";
import {
  Sparkles,
  Mail,
  Star,
  Copy,
  RefreshCw,
  Send,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Image,
  Share2,
  BarChart2,
  Users,
  CheckCircle2,
} from "lucide-react";

const contentTypes = [
  { id: "instagram", label: "Instagram Caption", icon: Image },
  { id: "facebook", label: "Facebook Post", icon: Share2 },
  { id: "email", label: "Promotional Email", icon: Mail },
  { id: "ad", label: "Google Ad Copy", icon: BarChart2 },
];

const generatedCaptions = [
  "🎂 Made with love, baked to perfection. Every cake at Sweet Crumbs is crafted to make your celebration unforgettable. Order yours today! ✨ #CustomCakes #Bakery #Mississauga",
  "Life is short — eat the cake! 🍰 Our custom birthday cakes are made from scratch with premium ingredients. DM us to start your order! #SweetCrumbs #Bakery #CustomCake",
  "Your dream cake is just a click away 💫 We specialize in custom cakes for birthdays, weddings, and every sweet moment in between. Link in bio to order! #Cakes #CustomOrder #Bakery",
];

const emailTemplates = [
  { id: "promotional", label: "Promotional", icon: Star },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "announcement", label: "Announcement", icon: MessageSquare },
];

const reviews = [
  "The cake was absolutely amazing! Perfect flavor and beautiful decoration. Will order again!",
  "Delivery was late but the taste made up for it. Would recommend.",
  "Best bakery in Mississauga. The custom wedding cake exceeded all expectations!",
  "Prices are a bit high but quality is worth it. Staff is very friendly.",
];

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<"content" | "campaigns" | "reviews">("content");
  const [contentType, setContentType] = useState("instagram");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<NluAnalyzeResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [emailTemplate, setEmailTemplate] = useState("promotional");
  const [emailList, setEmailList] = useState("");

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setCaptions(generatedCaptions);
    }, 2000);
  };

  const handleCopy = (i: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAnalyze = async () => {
    if (!reviewText.trim() || analyzing) return;

    setAnalysisError(null);
    setAnalyzing(true);
    try {
      const response = await fetch("/api/ibm/nlu/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewsText: reviewText }),
      });

      const data = (await response.json()) as NluAnalyzeResponse | { error?: string };
      if (!response.ok) {
        setAnalysisResult(null);
        setAnalysisError(data.error ?? "Watson NLU could not analyze these reviews.");
        return;
      }

      setAnalysisResult(data as NluAnalyzeResponse);
    } catch {
      setAnalysisResult(null);
      setAnalysisError("Network error while contacting Watson NLU. Check your local server and IBM credentials.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader title="Marketing" subtitle="AI-powered content, email campaigns, and review insights" />

      <main className="flex-1 p-6 space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#111827] rounded-xl border border-[#2a3a55] w-fit">
          {[
            { id: "content", label: "AI Content Generator", icon: Sparkles },
            { id: "campaigns", label: "Email Campaigns", icon: Mail },
            { id: "reviews", label: "Review Analyzer", icon: Star },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-[#0062ff] text-white" : "text-[#8b9cb6] hover:text-white"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* AI CONTENT GENERATOR */}
          {activeTab === "content" && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="grid grid-cols-1 xl:grid-cols-5 gap-6"
            >
              {/* Input panel */}
              <div className="xl:col-span-2 rounded-2xl border border-[#2a3a55] bg-[#111827] p-6 space-y-5">
                <div>
                  <h3 className="font-semibold text-white mb-1">Generate Content</h3>
                  <p className="text-xs text-[#4b5e7a]">Powered by watsonx.ai</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b9cb6] mb-2">Content Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {contentTypes.map((ct) => (
                      <motion.button
                        key={ct.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setContentType(ct.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          contentType === ct.id
                            ? "bg-[#0062ff]/15 border-[#0062ff]/40 text-[#0062ff]"
                            : "bg-[#1a2235] border-[#2a3a55] text-[#8b9cb6] hover:border-[#0062ff]/20"
                        }`}
                      >
                        <ct.icon size={13} />
                        {ct.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b9cb6] mb-2">What to promote?</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Our new summer cake collection, using fresh strawberries, launching this weekend..."
                    rows={4}
                    className="w-full bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4b5e7a] outline-none transition-colors resize-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(0,98,255,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0062ff] text-white font-semibold text-sm hover:bg-[#0050d0] disabled:opacity-70 transition-all"
                >
                  {generating ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Sparkles size={16} />
                      </motion.div>
                      Generating 3 variations...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate with watsonx.ai
                    </>
                  )}
                </motion.button>
              </div>

              {/* Output panel */}
              <div className="xl:col-span-3 space-y-4">
                {captions.length === 0 && !generating ? (
                  <div className="rounded-2xl border border-dashed border-[#2a3a55] bg-[#111827] p-12 text-center">
                    <Sparkles size={32} className="text-[#4b5e7a] mx-auto mb-3" />
                    <p className="text-[#8b9cb6] font-medium">Generated content will appear here</p>
                    <p className="text-[#4b5e7a] text-sm mt-1">Fill in the form and click Generate</p>
                  </div>
                ) : generating ? (
                  <div className="rounded-2xl border border-[#2a3a55] bg-[#111827] p-12 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 rounded-full border-2 border-[#0062ff] border-t-transparent mx-auto mb-4"
                    />
                    <p className="text-[#8b9cb6] font-medium">watsonx.ai is generating your content...</p>
                  </div>
                ) : (
                  captions.map((caption, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ borderColor: "rgba(0,98,255,0.3)" }}
                      className="rounded-2xl border border-[#2a3a55] bg-[#111827] p-5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="text-xs font-semibold text-[#0062ff] bg-[#0062ff]/10 px-2 py-0.5 rounded">
                          Variation {i + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 rounded-lg hover:bg-[#1a2235] text-[#4b5e7a] hover:text-[#10b981] transition-colors">
                            <ThumbsUp size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-[#1a2235] text-[#4b5e7a] hover:text-[#ef4444] transition-colors">
                            <ThumbsDown size={14} />
                          </button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleCopy(i, caption)}
                            className={`p-1.5 rounded-lg transition-colors ${copiedIndex === i ? "text-[#10b981] bg-[#10b981]/10" : "text-[#4b5e7a] hover:text-white hover:bg-[#1a2235]"}`}
                          >
                            {copiedIndex === i ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                          </motion.button>
                        </div>
                      </div>
                      <p className="text-sm text-white leading-relaxed">{caption}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* EMAIL CAMPAIGNS */}
          {activeTab === "campaigns" && (
            <motion.div
              key="campaigns"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-6"
            >
              {/* Campaign builder */}
              <div className="rounded-2xl border border-[#2a3a55] bg-[#111827] p-6 space-y-5">
                <div>
                  <h3 className="font-semibold text-white mb-1">Email Campaign Builder</h3>
                  <p className="text-xs text-[#4b5e7a]">Send AI-crafted emails to your customer list</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b9cb6] mb-2">Template</label>
                  <div className="space-y-2">
                    {emailTemplates.map((t) => (
                      <motion.button
                        key={t.id}
                        whileHover={{ x: 2 }}
                        onClick={() => setEmailTemplate(t.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          emailTemplate === t.id
                            ? "bg-[#0062ff]/10 border-[#0062ff]/40"
                            : "bg-[#1a2235] border-[#2a3a55] hover:border-[#0062ff]/20"
                        }`}
                      >
                        <t.icon size={16} className={emailTemplate === t.id ? "text-[#0062ff]" : "text-[#4b5e7a]"} />
                        <span className={`text-sm font-medium ${emailTemplate === t.id ? "text-white" : "text-[#8b9cb6]"}`}>{t.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b9cb6] mb-2">Email List</label>
                  <textarea
                    value={emailList}
                    onChange={(e) => setEmailList(e.target.value)}
                    placeholder="Paste emails (one per line) or upload CSV..."
                    rows={4}
                    className="w-full bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4b5e7a] outline-none resize-none transition-colors"
                  />
                  <p className="text-xs text-[#4b5e7a] mt-1">Or <button className="text-[#0062ff] hover:underline">upload CSV file</button></p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(0,98,255,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0062ff] text-white font-semibold text-sm"
                >
                  <Sparkles size={16} />
                  Generate Email Content
                </motion.button>
              </div>

              {/* Preview */}
              <div className="rounded-2xl border border-[#2a3a55] bg-[#111827] p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-white">Email Preview</h3>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 text-xs text-[#8b9cb6] hover:text-white transition-colors">
                      <RefreshCw size={12} /> Regenerate
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 text-gray-800">
                  <div className="border-b border-gray-100 pb-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded bg-[#0062ff] flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">SC</span>
                      </div>
                      <span className="font-bold text-sm">Sweet Crumbs Bakery</span>
                    </div>
                    <p className="text-xs text-gray-400">🎉 May Special: 20% Off All Custom Cakes This Weekend!</p>
                  </div>
                  <p className="text-sm font-semibold mb-2">Hi there! 👋</p>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    We&apos;re celebrating spring with an exclusive 20% discount on all custom cake orders placed this weekend only.
                    Whether it&apos;s a birthday, wedding, or just a Tuesday — you deserve something delicious.
                  </p>
                  <div className="bg-[#0062ff] text-white text-center py-2.5 rounded-xl text-sm font-semibold mb-3">
                    Order Now — 20% Off Ends Sunday
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    Sweet Crumbs Bakery · Mississauga, ON · <span className="underline cursor-pointer">Unsubscribe</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-[#4b5e7a]">
                    <Users size={12} />
                    <span>0 recipients</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: "0 0 16px rgba(0,98,255,0.4)" }}
                    whileTap={{ scale: 0.96 }}
                    className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0062ff] text-white text-sm font-semibold"
                  >
                    <Send size={13} /> Send Campaign
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* REVIEW ANALYZER */}
          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-6"
            >
              {/* Input */}
              <div className="rounded-2xl border border-[#2a3a55] bg-[#111827] p-6 space-y-5">
                <div>
                  <h3 className="font-semibold text-white mb-1">Review Analyzer</h3>
                  <p className="text-xs text-[#4b5e7a]">Powered by Watson NLU — extract sentiment and insights</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b9cb6] mb-2">Paste Customer Reviews</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => {
                      setReviewText(e.target.value);
                      setAnalysisError(null);
                      setAnalysisResult(null);
                    }}
                    placeholder="Paste reviews from Google, Yelp, or any source — one per line..."
                    rows={6}
                    className="w-full bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4b5e7a] outline-none resize-none transition-colors"
                  />
                </div>

                <div>
                  <p className="text-xs text-[#4b5e7a] mb-2">Or use sample reviews:</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setReviewText(reviews.join("\n"));
                      setAnalysisError(null);
                      setAnalysisResult(null);
                    }}
                    className="text-xs text-[#0062ff] hover:underline"
                  >
                    Load sample reviews
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(0,98,255,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAnalyze}
                  disabled={analyzing || !reviewText}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0062ff] text-white font-semibold text-sm disabled:opacity-60 transition-all"
                >
                  {analyzing ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Sparkles size={16} />
                      </motion.div>
                      Analyzing with Watson NLU...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Analyze Reviews
                    </>
                  )}
                </motion.button>
              </div>

              {/* Results */}
              <div className="space-y-4">
                {!analysisResult && !analysisError ? (
                  <div className="rounded-2xl border border-dashed border-[#2a3a55] bg-[#111827] p-12 text-center">
                    <Star size={32} className="text-[#4b5e7a] mx-auto mb-3" />
                    <p className="text-[#8b9cb6] font-medium">Sentiment results will appear here</p>
                    <p className="text-[#4b5e7a] text-sm mt-1">Paste reviews and click Analyze</p>
                  </div>
                ) : analysisError ? (
                  <div className="rounded-2xl border border-[#ef4444]/20 bg-[#111827] p-8 text-center">
                    <Star size={32} className="text-[#ef4444] mx-auto mb-3" />
                    <p className="text-white font-medium">Analysis unavailable</p>
                    <p className="text-[#8b9cb6] text-sm mt-1">{analysisError}</p>
                  </div>
                ) : (
                  <>
                    {/* Sentiment Score */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl border border-[#2a3a55] bg-[#111827] p-6"
                    >
                      <h4 className="font-semibold text-white mb-4">Overall Sentiment Score</h4>
                      <div className="flex items-center gap-5">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2a3a55" strokeWidth="3" />
                            <motion.path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke={analysisResult.label === "negative" ? "#ef4444" : analysisResult.label === "neutral" ? "#f59e0b" : "#10b981"}
                              strokeWidth="3"
                              strokeDasharray={`${analysisResult.overallScore}, 100`}
                              strokeLinecap="round"
                              initial={{ strokeDasharray: "0, 100" }}
                              animate={{ strokeDasharray: `${analysisResult.overallScore}, 100` }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-2xl font-black ${
                              analysisResult.label === "negative"
                                ? "text-[#ef4444]"
                                : analysisResult.label === "neutral"
                                ? "text-[#f59e0b]"
                                : "text-[#10b981]"
                            }`}>
                              {analysisResult.overallScore}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium mb-1 capitalize">{analysisResult.label} sentiment</p>
                          <p className="text-xs text-[#4b5e7a]">Based on {analysisResult.reviewCount} reviews analyzed by Watson NLU</p>
                          <div className="flex gap-3 mt-3">
                            <span className={`flex items-center gap-1 text-xs ${
                              analysisResult.label === "negative"
                                ? "text-[#ef4444]"
                                : analysisResult.label === "neutral"
                                ? "text-[#f59e0b]"
                                : "text-[#10b981]"
                            }`}>
                              <ThumbsUp size={12} />
                              {analysisResult.label === "negative"
                                ? "Needs Attention"
                                : analysisResult.label === "neutral"
                                ? "Mixed Feedback"
                                : "Mostly Positive"}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-[#f59e0b]">
                              <MessageSquare size={12} />
                              {analysisResult.negativeThemes.length > 0 ? `${analysisResult.negativeThemes.length} Areas to Improve` : "No major issues detected"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Keywords */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-2xl border border-[#2a3a55] bg-[#111827] p-6"
                    >
                      <h4 className="font-semibold text-white mb-4">Key Themes</h4>
                      <div className="mb-3">
                        <p className="text-xs text-[#10b981] font-semibold mb-2">✓ Positive mentions</p>
                        {analysisResult.positiveThemes.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.positiveThemes.map((k) => (
                              <span key={k} className="px-2.5 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-xs font-medium">{k}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#4b5e7a]">Watson NLU did not find strong positive themes in this batch.</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-[#ef4444] font-semibold mb-2">⚠ Areas of concern</p>
                        {analysisResult.negativeThemes.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.negativeThemes.map((k) => (
                              <span key={k} className="px-2.5 py-1 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-medium">{k}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#4b5e7a]">No strong recurring complaints were detected in these reviews.</p>
                        )}
                      </div>
                    </motion.div>

                    {/* AI Suggestions */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="rounded-2xl border border-[#0062ff]/20 bg-[#0062ff]/5 p-6"
                    >
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <Sparkles size={16} className="text-[#0062ff]" />
                        AI Recommendations
                      </h4>
                      <div className="space-y-3">
                        {analysisResult.suggestions.map((s, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-[#0062ff] text-sm mt-0.5">{i + 1}.</span>
                            <p className="text-sm text-[#8b9cb6]">{s}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
