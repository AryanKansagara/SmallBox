"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  Copy,
  Download,
  RefreshCw,
  Camera,
  Globe,
  AtSign,
  Share2,
  type LucideIcon,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type Platform = "Instagram" | "Facebook" | "Twitter" | "LinkedIn";

interface Step {
  id: number;
  question: string;
  hint: string;
}

// ── Config ───────────────────────────────────────────────────────────────────

const PLATFORMS: { id: Platform; icon: LucideIcon; color: string }[] = [
  { id: "Instagram", icon: Camera, color: "#E1306C" },
  { id: "Facebook", icon: Globe, color: "#1877F2" },
  { id: "Twitter", icon: AtSign, color: "#1DA1F2" },
  { id: "LinkedIn", icon: Share2, color: "#0A66C2" },
];

const POST_TYPES: Record<Platform, string[]> = {
  Instagram: ["Post", "Story", "Reel Cover"],
  Facebook: ["Post", "Cover Photo", "Ad"],
  Twitter: ["Post", "Header"],
  LinkedIn: ["Post", "Article Banner"],
};

const TONES = ["Casual", "Professional", "Playful", "Inspirational", "Bold"];

const STEPS: Step[] = [
  { id: 1, question: "Which platform is this for?", hint: "Choose the social network you'll post to." },
  { id: 2, question: "What type of post?", hint: "Pick the format that fits your content." },
  { id: 3, question: "Tell us what to promote", hint: "Describe your product, event, or message in a sentence or two." },
  { id: 4, question: "What tone should it have?", hint: "This shapes how the captions will sound." },
];

const inputCls =
  "w-full bg-black/4 dark:bg-white/6 border border-black/10 dark:border-white/10 focus:border-primary/50 rounded-xl px-4 py-3 text-[#1d1d1f] dark:text-white text-sm placeholder:text-black/35 dark:placeholder:text-white/35 outline-none transition-colors resize-none";

// ── Component ─────────────────────────────────────────────────────────────────

export default function GraphicsPage() {
  const router = useRouter();

  // Wizard state
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState<Platform | "">("");
  const [postType, setPostType] = useState("");
  const [details, setDetails] = useState("");
  const [tone, setTone] = useState("");

  // Caption generation
  const [generating, setGenerating] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [captionSource, setCaptionSource] = useState<"watsonx" | "local" | "">("");
  const [captionError, setCaptionError] = useState<string | null>(null);
  const [selectedCaption, setSelectedCaption] = useState<number | null>(null);

  // Design generation
  const [designing, setDesigning] = useState(false);
  const [designResult, setDesignResult] = useState<{
    imageUrl: string;
    width: number;
    height: number;
    prompt: string;
    provider: string;
  } | null>(null);
  const [designError, setDesignError] = useState<string | null>(null);

  // Copy feedback
  const [copied, setCopied] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const canAdvance = () => {
    if (step === 1) return platform !== "";
    if (step === 2) return postType !== "";
    if (step === 3) return details.trim().length > 5;
    if (step === 4) return tone !== "";
    return false;
  };

  const handleNext = async () => {
    if (!canAdvance()) return;
    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }
    // Step 4 → generate captions
    await generateCaptions();
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      if (step === 5) {
        // back from captions to step 4
        setCaptions([]);
        setSelectedCaption(null);
      }
    }
  };

  const generateCaptions = async () => {
    setGenerating(true);
    setCaptionError(null);
    setCaptions([]);
    setSelectedCaption(null);

    try {
      const res = await fetch("/api/marketing/graphics/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, postType, details, tone }),
      });

      const data = (await res.json()) as {
        captions?: string[];
        source?: "watsonx" | "local";
        error?: string;
      };

      if (!res.ok || !data.captions || data.captions.length === 0) {
        setCaptionError(data.error ?? "Could not generate captions right now.");
        return;
      }

      setCaptions(data.captions);
      setCaptionSource(data.source ?? "local");
      setStep(5);
    } catch {
      setCaptionError("Network error while generating captions.");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateDesign = async () => {
    if (selectedCaption === null) return;
    setDesigning(true);
    setDesignError(null);
    setDesignResult(null);

    try {
      const res = await fetch("/api/marketing/graphics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          postType,
          caption: captions[selectedCaption],
        }),
      });

      const data = (await res.json()) as {
        imageUrl?: string;
        width?: number;
        height?: number;
        prompt?: string;
        provider?: string;
        error?: string;
      };

      if (!res.ok || !data.imageUrl) {
        setDesignError(data.error ?? "Could not generate the graphic.");
        return;
      }

      // Pre-load the image (Pollinations generates on first GET, can take 30-90s)
      await new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        const timer = setTimeout(() => reject(new Error("Image took too long to generate. Please try again.")), 120_000);
        img.onload = () => { clearTimeout(timer); resolve(); };
        img.onerror = () => { clearTimeout(timer); reject(new Error("Image generation failed. Please try again.")); };
        img.src = data.imageUrl!;
      });

      setDesignResult({
        imageUrl: data.imageUrl,
        width: data.width ?? 1080,
        height: data.height ?? 1080,
        prompt: data.prompt ?? "",
        provider: data.provider ?? "Pollinations.ai",
      });
      setStep(6);
    } catch (err) {
      setDesignError(err instanceof Error ? err.message : "Network error while generating graphic.");
    } finally {
      setDesigning(false);
    }
  };

  const handleCopyCaption = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartOver = () => {
    setStep(1);
    setPlatform("");
    setPostType("");
    setDetails("");
    setTone("");
    setCaptions([]);
    setCaptionSource("");
    setCaptionError(null);
    setSelectedCaption(null);
    setDesignResult(null);
    setDesignError(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader
        title="Marketing Graphics"
        subtitle="AI-powered social media graphics powered by watsonx.ai"
      />

      <main className="flex-1 p-6">
        {/* Back to Marketing */}
        <button
          onClick={() => router.push("/dashboard/marketing")}
          className="flex items-center gap-2 text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Marketing
        </button>

        {/* Progress bar */}
        {step <= 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-black/40 dark:text-white/40">Step {step} of 4</span>
              <span className="text-xs text-black/40 dark:text-white/40">{Math.round((step / 4) * 100)}%</span>
            </div>
            <div className="h-1 bg-black/8 dark:bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── Step 1: Platform ── */}
          {step === 1 && (
            <WizardCard key="s1" step={STEPS[0]}>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map(({ id, icon: Icon, color }) => (
                  <motion.button
                    key={id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setPlatform(id); setPostType(""); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${platform === id ? "border-primary/60 bg-primary/10 text-primary" : "border-black/10 dark:border-white/10 bg-black/4 dark:bg-white/4 text-black/60 dark:text-white/60 hover:border-primary/25"}`}
                  >
                    <Icon size={18} color={color} />
                    {id}
                  </motion.button>
                ))}
              </div>
              <WizardNav onNext={handleNext} canNext={canAdvance()} />
            </WizardCard>
          )}

          {/* ── Step 2: Post Type ── */}
          {step === 2 && (
            <WizardCard key="s2" step={STEPS[1]}>
              <div className="grid grid-cols-2 gap-3">
                {(POST_TYPES[platform as Platform] ?? []).map((pt) => (
                  <motion.button
                    key={pt}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPostType(pt)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${postType === pt ? "border-primary/60 bg-primary/10 text-primary" : "border-black/10 dark:border-white/10 bg-black/4 dark:bg-white/4 text-black/60 dark:text-white/60 hover:border-primary/25"}`}
                  >
                    {pt}
                  </motion.button>
                ))}
              </div>
              <WizardNav onBack={handleBack} onNext={handleNext} canNext={canAdvance()} />
            </WizardCard>
          )}

          {/* ── Step 3: Details ── */}
          {step === 3 && (
            <WizardCard key="s3" step={STEPS[2]}>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g. Summer sale on handmade soaps — 30% off all orders this weekend only. Highlight our lavender and citrus scents."
                rows={5}
                className={inputCls}
              />
              <WizardNav onBack={handleBack} onNext={handleNext} canNext={canAdvance()} />
            </WizardCard>
          )}

          {/* ── Step 4: Tone ── */}
          {step === 4 && (
            <WizardCard key="s4" step={STEPS[3]}>
              <div className="grid grid-cols-2 gap-3">
                {TONES.map((t) => (
                  <motion.button
                    key={t}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setTone(t)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${tone === t ? "border-primary/60 bg-primary/10 text-primary" : "border-black/10 dark:border-white/10 bg-black/4 dark:bg-white/4 text-black/60 dark:text-white/60 hover:border-primary/25"}`}
                  >
                    {t}
                  </motion.button>
                ))}
              </div>

              {captionError && (
                <p className="text-red-400 text-sm mt-2">{captionError}</p>
              )}

              <WizardNav
                onBack={handleBack}
                onNext={handleNext}
                canNext={canAdvance()}
                nextLabel={generating ? "Generating..." : "Generate Captions"}
                loading={generating}
              />
            </WizardCard>
          )}

          {/* ── Step 5: Pick Caption ── */}
          {step === 5 && (
            <motion.div
              key="s5"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="max-w-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">Pick a caption</h2>
                  <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">
                    {captionSource === "watsonx" ? "Generated with watsonx.ai" : "Generated locally"}
                  </p>
                </div>
                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-1.5 text-xs text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
                >
                  <ArrowLeft size={12} />
                  Back
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {captions.map((caption, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedCaption(i)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedCaption === i ? "border-primary/60 bg-primary/8" : "border-black/8 dark:border-white/8 glass-card hover:border-primary/25"}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedCaption === i ? "border-primary bg-primary" : "border-black/20 dark:border-white/20"}`}
                      >
                        {selectedCaption === i && <Check size={10} className="text-white" />}
                      </span>
                      <p className="text-sm text-[#1d1d1f] dark:text-white leading-relaxed">{caption}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {designError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm">{designError}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                {selectedCaption !== null && (
                  <button
                    onClick={() => handleCopyCaption(captions[selectedCaption])}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/4 dark:bg-white/4 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-all"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy caption"}
                  </button>
                )}

                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(123,47,255,0.35)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGenerateDesign}
                  disabled={selectedCaption === null || designing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(123,47,255,0.3)]"
                >
                  {designing ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Sparkles size={15} />
                      </motion.div>
                      Generating… this may take up to 60s
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Generate Graphic
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Step 6: Result ── */}
          {step === 6 && designResult && selectedCaption !== null && (
            <motion.div
              key="s6"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="max-w-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">Your graphic is ready</h2>
                  <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">
                    {platform} {postType} · {tone} tone
                  </p>
                </div>
              </div>

              {/* Design preview */}
              <div className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6 mb-5 space-y-5">
                {/* Generated image */}
                <div className="w-full max-w-sm mx-auto rounded-xl overflow-hidden border border-black/8 dark:border-white/8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={designResult.imageUrl}
                    alt="Generated social media graphic"
                    className="w-full object-contain"
                  />
                </div>
                <p className="text-center text-xs text-black/30 dark:text-white/30">{designResult.provider}</p>

                {/* Caption */}
                <div>
                  <p className="text-xs text-black/40 dark:text-white/40 mb-2 font-medium uppercase tracking-wide">Your Caption</p>
                  <p className="text-sm text-[#1d1d1f] dark:text-white leading-relaxed p-3 rounded-xl bg-black/4 dark:bg-white/4 border border-black/8 dark:border-white/8">
                    {captions[selectedCaption]}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => handleCopyCaption(captions[selectedCaption])}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/4 dark:bg-white/4 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-all"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy caption"}
                </button>

                <button
                  onClick={async () => {
                    const res = await fetch(designResult.imageUrl);
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${platform}-${postType}-graphic.jpg`.replace(/\s+/g, "-").toLowerCase();
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/4 dark:bg-white/4 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-all"
                >
                  <Download size={14} />
                  Download image
                </button>

                <button
                  onClick={handleStartOver}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all"
                >
                  <RefreshCw size={14} />
                  Create Another
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function WizardCard({
  children,
  step,
}: {
  children: React.ReactNode;
  step: Step;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      className="max-w-lg"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-white">{step.question}</h2>
        <p className="text-sm text-black/40 dark:text-white/40 mt-1">{step.hint}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

function WizardNav({
  onBack,
  onNext,
  canNext,
  nextLabel = "Next",
  loading = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  canNext: boolean;
  nextLabel?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-all"
        >
          <ArrowLeft size={14} />
          Back
        </button>
      )}
      <motion.button
        whileHover={canNext && !loading ? { scale: 1.03, boxShadow: "0 0 24px rgba(123,47,255,0.35)" } : {}}
        whileTap={canNext && !loading ? { scale: 0.97 } : {}}
        onClick={onNext}
        disabled={!canNext || loading}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-40 transition-all shadow-[0_0_20px_rgba(123,47,255,0.25)]"
      >
        {loading ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Sparkles size={15} />
            </motion.div>
            {nextLabel}
          </>
        ) : (
          <>
            {nextLabel}
            <ArrowRight size={14} />
          </>
        )}
      </motion.button>
    </div>
  );
}
