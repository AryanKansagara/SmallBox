"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHeader } from "@/components/DashboardHeader";
import { type NluAnalyzeResponse } from "@/lib/ibm-nlu";
import {
  createEmailCampaignDraft,
  parseEmailRecipients,
  type EmailCampaignDraft,
  type EmailCampaignTemplate,
  type EmailCampaignTone,
} from "@/lib/email-campaign";
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
] as const;

const emailTones = [
  { id: "friendly", label: "Friendly" },
  { id: "professional", label: "Professional" },
  { id: "bold", label: "Bold" },
] as const;

const reviews = [
  "The cake was absolutely amazing! Perfect flavor and beautiful decoration. Will order again!",
  "Delivery was late but the taste made up for it. Would recommend.",
  "Best bakery in Mississauga. The custom wedding cake exceeded all expectations!",
  "Prices are a bit high but quality is worth it. Staff is very friendly.",
];

const inputCls = "w-full bg-black/4 dark:bg-white/6 border border-black/10 dark:border-white/10 focus:border-primary/50 rounded-xl px-4 py-3 text-[#1d1d1f] dark:text-white text-sm placeholder:text-black/35 dark:placeholder:text-white/35 outline-none transition-colors resize-none";

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<"content" | "campaigns" | "reviews">("content");
  const [contentType, setContentType] = useState("instagram");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [contentStatus, setContentStatus] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<NluAnalyzeResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [emailTemplate, setEmailTemplate] = useState<EmailCampaignTemplate>("promotional");
  const [emailTone, setEmailTone] = useState<EmailCampaignTone>("friendly");
  const [emailBusinessName, setEmailBusinessName] = useState("Sweet Crumbs Bakery");
  const [emailAudience, setEmailAudience] = useState("recent customers");
  const [emailOffer, setEmailOffer] = useState("20% off all custom cakes this weekend");
  const [emailRecipients, setEmailRecipients] = useState("lisa@example.com\nmark@example.com");
  const [emailDraft, setEmailDraft] = useState<EmailCampaignDraft | null>(null);
  const [emailGenerating, setEmailGenerating] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const parsedRecipients = parseEmailRecipients(emailRecipients);
  const recipientCount = parsedRecipients.valid.length;

  const handleGenerate = async () => {
    if (generating) return;

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setCaptions([]);
      setContentError("Add a topic or promotion idea before generating content.");
      setContentStatus(null);
      return;
    }

    setGenerating(true);
    setContentError(null);
    setContentStatus(null);

    try {
      const response = await fetch("/api/ibm/watsonx/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType,
          prompt: trimmedPrompt,
        }),
      });

      const data = (await response.json()) as {
        variations?: string[];
        source?: "watsonx" | "local";
        watsonxError?: string;
        error?: string;
      };

      if (!response.ok || !Array.isArray(data.variations) || data.variations.length === 0) {
        setCaptions(generatedCaptions);
        setContentError(data.error ?? data.watsonxError ?? "Unable to generate content right now.");
        setContentStatus("Using fallback examples");
        return;
      }

      setCaptions(data.variations);
      if (data.source === "watsonx") {
        setContentStatus("Generated with watsonx.ai");
      } else {
        setContentStatus("Using local fallback examples");
        setContentError(data.watsonxError ?? "Watsonx returned a fallback response.");
      }
    } catch {
      setCaptions(generatedCaptions);
      setContentError("Network error while generating content.");
      setContentStatus("Using fallback examples");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (i: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGenerateEmailDraft = async () => {
    if (emailGenerating) return;

    setEmailError(null);
    setEmailStatus(null);
    setEmailGenerating(true);

    try {
      const response = await fetch("/api/ibm/watsonx/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template: emailTemplate,
          tone: emailTone,
          businessName: emailBusinessName,
          audience: emailAudience,
          offer: emailOffer,
          recipientCount,
        }),
      });

      const data = (await response.json()) as { draft?: EmailCampaignDraft; error?: string };
      if (!response.ok || !data.draft) {
        setEmailDraft(null);
        setEmailError(data.error ?? "Unable to generate an email draft right now.");
        return;
      }

      setEmailDraft(data.draft);
      setEmailStatus(`Draft ready for ${recipientCount} recipient${recipientCount === 1 ? "" : "s"}.`);
    } catch {
      setEmailDraft(null);
      setEmailError("Network error while generating the email draft.");
    } finally {
      setEmailGenerating(false);
    }
  };

  const handleSendCampaign = async () => {
    if (recipientCount === 0) {
      setEmailError("Add at least one valid recipient before sending.");
      return;
    }

    if (emailSending) return;

    setEmailError(null);
    setEmailStatus(null);
    setEmailSending(true);

    try {
      const response = await fetch("/api/campaigns/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: parsedRecipients.valid,
          draft: draftPreview,
          businessName: emailBusinessName,
          emailList: emailRecipients,
        }),
      });

      const data = (await response.json()) as {
        acceptedCount?: number;
        rejectedRecipients?: string[];
        invalidRecipients?: string[];
        providerErrors?: string[];
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        setEmailError(data.error ?? "Unable to send the campaign right now.");
        return;
      }

      const acceptedCount = data.acceptedCount ?? 0;
      const rejectedCount = data.rejectedRecipients?.length ?? 0;

      setEmailStatus(
        data.message ?? `Sent ${acceptedCount} email${acceptedCount === 1 ? "" : "s"} successfully.`
      );

      if (rejectedCount > 0) {
        setEmailError(
          `Some recipients were rejected: ${data.rejectedRecipients?.join(", ") ?? "unknown"}`
        );
      }
    } finally {
      setEmailSending(false);
    }
  };

  const draftPreview =
    emailDraft ??
    createEmailCampaignDraft({
      businessName: emailBusinessName,
      audience: emailAudience,
      template: emailTemplate,
      tone: emailTone,
      offer: emailOffer,
    });

  const analysisData = analysisResult as NluAnalyzeResponse;

  const handleAnalyze = async () => {
    if (!reviewText.trim() || analyzing) return;
    setAnalysisError(null);
    setAnalyzing(true);
    try {
      const response = await fetch("/api/ibm/nlu/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewsText: reviewText }),
      });

      const data = (await response.json()) as { error?: string } | NluAnalyzeResponse;
      if (!response.ok) {
        setAnalysisResult(null);
        setAnalysisError("error" in data ? data.error ?? "Watson NLU could not analyze these reviews." : "Watson NLU could not analyze these reviews.");
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
        <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/8 dark:border-white/8 w-fit backdrop-blur-sm">
          {[
            { id: "content", label: "AI Content Generator", icon: Sparkles },
            { id: "campaigns", label: "Email Campaigns", icon: Mail },
            { id: "reviews", label: "Review Analyzer", icon: Star },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-primary text-white shadow-sm" : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* AI CONTENT GENERATOR */}
          {activeTab === "content" && (
            <motion.div key="content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              {/* Input panel */}
              <div className="xl:col-span-2 rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6 space-y-5">
                <div>
                  <h3 className="font-semibold text-[#1d1d1f] dark:text-white mb-1">Generate Content</h3>
                  <p className="text-xs text-black/40 dark:text-white/40">Powered by watsonx.ai</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black/55 dark:text-white/55 mb-2">Content Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {contentTypes.map((ct) => (
                      <motion.button
                        key={ct.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setContentType(ct.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${contentType === ct.id ? "bg-primary/12 border-primary/35 text-primary" : "bg-black/4 dark:bg-white/4 border-black/8 dark:border-white/8 text-black/50 dark:text-white/50 hover:border-primary/20"}`}
                      >
                        <ct.icon size={13} />
                        {ct.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black/55 dark:text-white/55 mb-2">What to promote?</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Our new summer cake collection, using fresh strawberries, launching this weekend..."
                    rows={4}
                    className={inputCls}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(0,98,255,0.35)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-70 transition-all shadow-[0_0_20px_rgba(0,98,255,0.3)]"
                >
                  {generating ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Sparkles size={16} /></motion.div>
                      Generating 3 variations...
                    </>
                  ) : (
                    <><Sparkles size={16} />Generate with watsonx.ai</>
                  )}
                </motion.button>
              </div>

              {/* Output panel */}
              <div className="xl:col-span-3 space-y-4">
                {contentError && <p className="text-sm text-[#ef4444]">{contentError}</p>}
                {contentStatus && <p className="text-sm text-[#10b981]">{contentStatus}</p>}

                {captions.length === 0 && !generating ? (
                  <div className="rounded-2xl border border-dashed border-black/12 dark:border-white/12 glass-card p-12 text-center">
                    <Sparkles size={32} className="text-black/25 dark:text-white/25 mx-auto mb-3" />
                    <p className="text-black/55 dark:text-white/55 font-medium">Generated content will appear here</p>
                    <p className="text-black/35 dark:text-white/35 text-sm mt-1">Fill in the form and click Generate</p>
                  </div>
                ) : generating ? (
                  <div className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-12 text-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
                    <p className="text-black/55 dark:text-white/55 font-medium">watsonx.ai is generating your content...</p>
                  </div>
                ) : (
                  captions.map((caption, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ borderColor: "rgba(0,98,255,0.25)" }}
                      className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">Variation {i + 1}</span>
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/8 text-black/30 dark:text-white/30 hover:text-emerald-500 transition-colors"><ThumbsUp size={14} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/8 text-black/30 dark:text-white/30 hover:text-red-500 transition-colors"><ThumbsDown size={14} /></button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleCopy(i, caption)} className={`p-1.5 rounded-lg transition-colors ${copiedIndex === i ? "text-emerald-500 bg-emerald-500/10" : "text-black/30 dark:text-white/30 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/8"}`}>
                            {copiedIndex === i ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                          </motion.button>
                        </div>
                      </div>
                      <p className="text-sm text-white leading-relaxed whitespace-pre-line">{caption}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* EMAIL CAMPAIGNS */}
          {activeTab === "campaigns" && (
            <motion.div key="campaigns" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6 space-y-5">
                <div>
                  <h3 className="font-semibold text-white mb-1">Email Campaign Builder</h3>
                  <p className="text-xs text-[#4b5e7a]">Send AI-crafted emails to your customer list</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#8b9cb6] mb-2">Business Name</label>
                    <input
                      value={emailBusinessName}
                      onChange={(e) => setEmailBusinessName(e.target.value)}
                      className="w-full bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b9cb6] mb-2">Audience</label>
                    <input
                      value={emailAudience}
                      onChange={(e) => setEmailAudience(e.target.value)}
                      className="w-full bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#8b9cb6] mb-2">Tone</label>
                    <div className="grid grid-cols-3 gap-2">
                      {emailTones.map((tone) => (
                        <button
                          key={tone.id}
                          type="button"
                          onClick={() => setEmailTone(tone.id)}
                          className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                            emailTone === tone.id
                              ? "bg-[#0062ff]/15 border-[#0062ff]/40 text-white"
                              : "bg-[#1a2235] border-[#2a3a55] text-[#8b9cb6] hover:border-[#0062ff]/20"
                          }`}
                        >
                          {tone.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b9cb6] mb-2">Offer</label>
                    <input
                      value={emailOffer}
                      onChange={(e) => setEmailOffer(e.target.value)}
                      className="w-full bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black/55 dark:text-white/55 mb-2">Template</label>
                  <div className="space-y-2">
                    {emailTemplates.map((t) => (
                      <motion.button
                        key={t.id}
                        whileHover={{ x: 2 }}
                        onClick={() => setEmailTemplate(t.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${emailTemplate === t.id ? "bg-primary/10 border-primary/35" : "bg-black/3 dark:bg-white/3 border-black/8 dark:border-white/8 hover:border-primary/20"}`}
                      >
                        <t.icon size={16} className={emailTemplate === t.id ? "text-primary" : "text-black/35 dark:text-white/35"} />
                        <span className={`text-sm font-medium ${emailTemplate === t.id ? "text-[#1d1d1f] dark:text-white" : "text-black/50 dark:text-white/50"}`}>{t.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b9cb6] mb-2">Email List</label>
                  <textarea
                    value={emailRecipients}
                    onChange={(e) => {
                      setEmailRecipients(e.target.value);
                      setEmailStatus(null);
                    }}
                    placeholder="Paste emails (one per line) or upload CSV..."
                    rows={4}
                    className="w-full bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4b5e7a] outline-none resize-none transition-colors"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    <span className="text-[#8b9cb6]">{recipientCount} valid recipient{recipientCount === 1 ? "" : "s"}</span>
                    {parsedRecipients.invalid.length > 0 && (
                      <span className="text-[#ef4444]">{parsedRecipients.invalid.length} invalid entr{parsedRecipients.invalid.length === 1 ? "y" : "ies"}</span>
                    )}
                  </div>
                  <p className="text-xs text-[#4b5e7a] mt-1">Or <button className="text-[#0062ff] hover:underline">upload CSV file</button></p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(0,98,255,0.35)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGenerateEmailDraft}
                  disabled={emailGenerating}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0062ff] text-white font-semibold text-sm"
                >
                  {emailGenerating ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Sparkles size={16} />
                      </motion.div>
                      Generating draft...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Email Content
                    </>
                  )}
                </motion.button>

                {emailError && <p className="text-sm text-[#ef4444]">{emailError}</p>}
                {emailStatus && <p className="text-sm text-[#10b981]">{emailStatus}</p>}
                {parsedRecipients.invalid.length > 0 && (
                  <div className="rounded-xl border border-[#ef4444]/20 bg-[#1a2235] p-3 text-xs text-[#fca5a5]">
                    Invalid recipients: {parsedRecipients.invalid.join(", ")}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-white">Email Preview</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateEmailDraft}
                      className="flex items-center gap-1.5 text-xs text-[#8b9cb6] hover:text-white transition-colors"
                    >
                      <RefreshCw size={12} /> Regenerate
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 text-gray-800 shadow-sm">
                  <div className="border-b border-gray-100 pb-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded bg-[#0062ff] flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">SB</span>
                      </div>
                      <span className="font-bold text-sm">{emailBusinessName}</span>
                    </div>
                    <p className="text-xs text-gray-400">{draftPreview.subject}</p>
                  </div>
                  <p className="text-sm font-semibold mb-2">{draftPreview.preheader}</p>
                  <div className="space-y-3 text-xs text-gray-600 leading-relaxed mb-3">
                    {draftPreview.body.split(/\n\n/).map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <div className="bg-[#0062ff] text-white text-center py-2.5 rounded-xl text-sm font-semibold mb-3">
                    {draftPreview.ctaLabel}
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    {emailAudience} · {recipientCount} recipient{recipientCount === 1 ? "" : "s"} · <span className="underline cursor-pointer">Unsubscribe</span>
                  </p>
                </div>

                {emailDraft === null && (
                  <p className="mt-3 text-xs text-[#4b5e7a]">Preview is currently using the live draft generator defaults.</p>
                )}

                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-black/40 dark:text-white/40">
                    <Users size={12} />
                    <span>{recipientCount} recipient{recipientCount === 1 ? "" : "s"}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(0,98,255,0.35)" }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleSendCampaign}
                    disabled={emailSending}
                    className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0062ff] text-white text-sm font-semibold"
                  >
                    {emailSending ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                          <Send size={13} />
                        </motion.div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={13} /> Send Campaign
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* REVIEW ANALYZER */}
          {activeTab === "reviews" && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6 space-y-5">
                <div>
                  <h3 className="font-semibold text-[#1d1d1f] dark:text-white mb-1">Review Analyzer</h3>
                  <p className="text-xs text-black/40 dark:text-white/40">Powered by Watson NLU — extract sentiment and insights</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black/55 dark:text-white/55 mb-2">Paste Customer Reviews</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => { setReviewText(e.target.value); setAnalysisError(null); setAnalysisResult(null); }}
                    placeholder="Paste reviews from Google, Yelp, or any source — one per line..."
                    rows={6}
                    className={inputCls}
                  />
                </div>

                <div>
                  <p className="text-xs text-black/35 dark:text-white/35 mb-2">Or use sample reviews:</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { setReviewText(reviews.join("\n")); setAnalysisError(null); setAnalysisResult(null); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Load sample reviews
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(0,98,255,0.35)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAnalyze}
                  disabled={analyzing || !reviewText}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-60 transition-all shadow-[0_0_20px_rgba(0,98,255,0.3)]"
                >
                  {analyzing ? (
                    <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Sparkles size={16} /></motion.div>Analyzing with Watson NLU...</>
                  ) : (
                    <><Sparkles size={16} />Analyze Reviews</>
                  )}
                </motion.button>
              </div>

              <div className="space-y-4">
                {!analysisResult && !analysisError ? (
                  <div className="rounded-2xl border border-dashed border-black/12 dark:border-white/12 glass-card p-12 text-center">
                    <Star size={32} className="text-black/25 dark:text-white/25 mx-auto mb-3" />
                    <p className="text-black/55 dark:text-white/55 font-medium">Sentiment results will appear here</p>
                    <p className="text-black/35 dark:text-white/35 text-sm mt-1">Paste reviews and click Analyze</p>
                  </div>
                ) : analysisError ? (
                  <div className="rounded-2xl border border-red-500/20 glass-card p-8 text-center">
                    <Star size={32} className="text-red-500 mx-auto mb-3" />
                    <p className="text-[#1d1d1f] dark:text-white font-medium">Analysis unavailable</p>
                    <p className="text-black/50 dark:text-white/50 text-sm mt-1">{analysisError}</p>
                  </div>
                ) : analysisResult && (
                  <>
                    {/* Sentiment Score */}
                    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6">
                      <h4 className="font-semibold text-[#1d1d1f] dark:text-white mb-4">Overall Sentiment Score</h4>
                      <div className="flex items-center gap-5">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="3" className="dark:[stroke:rgba(255,255,255,0.1)]" />
                            <motion.path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke={analysisData.label === "negative" ? "#ef4444" : analysisData.label === "neutral" ? "#f59e0b" : "#10b981"}
                              strokeWidth="3"
                              strokeDasharray={`${analysisData.overallScore}, 100`}
                              strokeLinecap="round"
                              initial={{ strokeDasharray: "0, 100" }}
                              animate={{ strokeDasharray: `${analysisData.overallScore}, 100` }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-2xl font-black ${
                              analysisData.label === "negative"
                                ? "text-[#ef4444]"
                                : analysisData.label === "neutral"
                                ? "text-[#f59e0b]"
                                : "text-[#10b981]"
                            }`}>
                              {analysisData.overallScore}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium mb-1 capitalize">{analysisData.label} sentiment</p>
                          <p className="text-xs text-[#4b5e7a]">Based on {analysisData.reviewCount} reviews analyzed by Watson NLU</p>
                          <div className="flex gap-3 mt-3">
                            <span className={`flex items-center gap-1 text-xs ${
                              analysisData.label === "negative"
                                ? "text-[#ef4444]"
                                : analysisData.label === "neutral"
                                ? "text-[#f59e0b]"
                                : "text-[#10b981]"
                            }`}>
                              <ThumbsUp size={12} />
                              {analysisData.label === "negative"
                                ? "Needs Attention"
                                : analysisData.label === "neutral"
                                ? "Mixed Feedback"
                                : "Mostly Positive"}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-amber-500">
                              <MessageSquare size={12} />
                              {analysisData.negativeThemes.length > 0 ? `${analysisData.negativeThemes.length} Areas to Improve` : "No major issues detected"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Key Themes */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6">
                      <h4 className="font-semibold text-[#1d1d1f] dark:text-white mb-4">Key Themes</h4>
                      <div className="mb-3">
                        <p className="text-xs text-[#10b981] font-semibold mb-2">✓ Positive mentions</p>
                        {analysisData.positiveThemes.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {analysisData.positiveThemes.map((k) => (
                              <span key={k} className="px-2.5 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-xs font-medium">{k}</span>
                            ))}
                          </div>
                        ) : <p className="text-xs text-black/35 dark:text-white/35">No strong positive themes found.</p>}
                      </div>
                      <div>
                        <p className="text-xs text-[#ef4444] font-semibold mb-2">⚠ Areas of concern</p>
                        {analysisData.negativeThemes.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {analysisData.negativeThemes.map((k) => (
                              <span key={k} className="px-2.5 py-1 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-medium">{k}</span>
                            ))}
                          </div>
                        ) : <p className="text-xs text-black/35 dark:text-white/35">No recurring complaints detected.</p>}
                      </div>
                    </motion.div>

                    {/* AI Suggestions */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-xl p-6">
                      <h4 className="font-semibold text-[#1d1d1f] dark:text-white mb-3 flex items-center gap-2">
                        <Sparkles size={16} className="text-primary" />AI Recommendations
                      </h4>
                      <div className="space-y-3">
                        {analysisData.suggestions.map((s, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-primary text-sm mt-0.5">{i + 1}.</span>
                            <p className="text-sm text-black/60 dark:text-white/60">{s}</p>
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
