"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import type { WebsiteFormData } from "@/app/api/stitch/generate/route";

// ── Spec step labels ───────────────────────────────────────────────────────────
const STEP_LABELS = [
  "Primary Goal",
  "Pages",
  "Vibe",
  "Brand Color",
  "Details",
  "Review",
];

const CTA_OPTIONS = ["Call", "Book", "Contact", "Learn more"];
const PAGE_OPTIONS = ["Home", "About", "Services", "Contact", "Gallery", "FAQ"];
const VIBE_OPTIONS = [
  { value: "Clean & Professional", desc: "Formal, trustworthy, polished — great for services" },
  { value: "Bold & Modern", desc: "Energetic, confident, high-impact — stands out" },
  { value: "Warm & Friendly", desc: "Approachable, personal, community-focused" },
  { value: "Minimal & Elegant", desc: "Refined, quiet luxury — lets the work speak" },
];
const PRESET_COLORS = ["#7b2fff", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9", "#ec4899"];

const inputCls =
  "w-full bg-white/5 border border-white/10 focus:border-primary/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none transition-colors";

type GenerateResult = {
  screenId: string;
  screenName: string;
  title: string;
  htmlContent: string;
  prompt: string;
};

const GEN_STAGES = [
  { label: "Analyzing your business details", duration: 8 },
  { label: "Designing layout and structure", duration: 20 },
  { label: "Applying brand colors and typography", duration: 15 },
  { label: "Generating HTML & CSS", duration: 25 },
  { label: "Rendering final design", duration: 20 },
  { label: "Almost there…", duration: Infinity },
];

function GeneratingOverlay({ elapsed, businessName }: { elapsed: number; businessName: string }) {
  let cumulative = 0;
  let stageIndex = 0;
  for (let i = 0; i < GEN_STAGES.length - 1; i++) {
    cumulative += GEN_STAGES[i].duration;
    if (elapsed < cumulative) { stageIndex = i; break; }
    stageIndex = GEN_STAGES.length - 1;
  }

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader title="Website Builder" subtitle="Generating your site with Google Stitch" />
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center space-y-8"
        >
          {/* Animated ring */}
          <div className="relative flex items-center justify-center mx-auto w-24 h-24">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/20"
            />
            <motion.div
              className="absolute inset-0 rounded-full border-t-2 border-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-t border-primary/40"
              animate={{ rotate: -360 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            />
            <Sparkles size={28} className="text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="text-white font-semibold text-xl">
              Building {businessName || "your website"}…
            </h2>
            <p className="text-white/45 text-sm">
              Google Stitch + Gemini 3.1 Pro · typically 45–90 seconds
            </p>
          </div>

          {/* Stage list */}
          <div className="text-left space-y-3">
            {GEN_STAGES.slice(0, -1).map((stage, i) => {
              const done = i < stageIndex;
              const active = i === stageIndex;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                    done ? "bg-emerald-500/20 border border-emerald-400/50" :
                    active ? "bg-primary/20 border border-primary/50" :
                    "bg-white/5 border border-white/10"
                  }`}>
                    {done ? (
                      <CheckCircle2 size={12} className="text-emerald-400" />
                    ) : active ? (
                      <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-primary"
                      />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    )}
                  </div>
                  <span className={`text-sm transition-colors duration-500 ${
                    done ? "text-emerald-400/70" :
                    active ? "text-white" :
                    "text-white/25"
                  }`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
            Elapsed: {timeStr}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function WebsiteBuilderPage() {
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const [form, setForm] = useState<WebsiteFormData>({
    businessName: "",
    industry: "",
    description: "",
    callToAction: "",
    pages: ["Home", "Services", "Contact"],
    vibe: "",
    brandColor: "#7b2fff",
    hasLogo: false,
    details: "",
  });

  const toggle = (key: keyof WebsiteFormData, val: string) => {
    const arr = form[key] as string[];
    setForm({
      ...form,
      [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    try {
      const res = await fetch("/api/stitch/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setResult(data);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setGenerating(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const reset = () => {
    setResult(null);
    setGenError(null);
    setStep(0);
  };

  // ── Generating overlay ────────────────────────────────────────────────────
  if (generating) {
    return <GeneratingOverlay elapsed={elapsed} businessName={form.businessName} />;
  }

  // ── Generated result view ─────────────────────────────────────────────────
  if (result) {
    return (
      <div className="flex flex-col flex-1">
        <DashboardHeader title="Website Builder" subtitle="Your website has been generated" />
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Success banner */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-white text-sm">
                  {result.title || form.businessName} — generated with Google Stitch!
                </p>
                <p className="text-xs text-white/45">
                  Screen ID: {result.screenId} · Powered by Gemini 3.1 Pro
                </p>
              </div>
            </div>

            {/* Browser chrome + live iframe */}
            <div className="rounded-2xl border border-white/8 overflow-hidden glass-card">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-white/3">
                <span className="w-3 h-3 rounded-full bg-red-400/70" />
                <span className="w-3 h-3 rounded-full bg-amber-400/70" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
                <div className="flex-1 mx-4 bg-white/5 rounded px-3 py-1 text-xs text-white/40">
                  {form.businessName
                    ? form.businessName.toLowerCase().replace(/\s+/g, "")
                    : "mybusiness"}
                  .smallbox.app
                </div>
              </div>

              {result.htmlContent ? (
                <iframe
                  srcDoc={result.htmlContent}
                  title="Generated website"
                  className="w-full border-0"
                  style={{ height: 560 }}
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-white/30 text-sm">
                  Preview not available
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 flex-wrap">
              {result.htmlContent && (
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 28px rgba(123,47,255,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const blob = new Blob([result.htmlContent], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${form.businessName.replace(/\s+/g, "-").toLowerCase() || "website"}.html`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all shadow-[0_0_16px_rgba(123,47,255,0.3)]"
                >
                  <ExternalLink size={16} />
                  Download HTML
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/55 hover:text-white hover:border-primary/25 font-medium text-sm transition-all"
              >
                <RefreshCw size={15} />
                Generate Another
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // ── Questionnaire + Review ────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader
        title="Website Builder"
        subtitle="Answer 5 quick questions — Google Stitch generates your site"
      />

      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Step progress */}
          <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-1">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    step === i
                      ? "bg-primary text-white shadow-[0_0_14px_rgba(123,47,255,0.4)]"
                      : step > i
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                      : "bg-white/5 text-white/35 border border-white/8"
                  }`}
                >
                  {step > i ? <CheckCircle2 size={11} /> : <span className="w-4 text-center">{i + 1}</span>}
                  {label}
                </button>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`h-px w-4 ${step > i ? "bg-emerald-500/40" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-white/8 glass-card p-8"
            >
              {/* Step 0 — Primary Goal */}
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-1">
                      What&apos;s the main thing you want visitors to do?
                    </h2>
                    <p className="text-sm text-white/40">This becomes your primary call-to-action across the site.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {CTA_OPTIONS.map((opt) => (
                      <motion.button
                        key={opt}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setForm({ ...form, callToAction: opt })}
                        className={`p-4 rounded-xl border text-sm font-medium text-left transition-all ${
                          form.callToAction === opt
                            ? "bg-primary/15 border-primary/40 text-primary"
                            : "bg-white/3 border-white/8 text-white/60 hover:border-primary/25 hover:text-white"
                        }`}
                      >
                        {opt === "Call" && "📞 "}
                        {opt === "Book" && "📅 "}
                        {opt === "Contact" && "✉️ "}
                        {opt === "Learn more" && "📖 "}
                        {opt}
                      </motion.button>
                    ))}
                  </div>
                  <div className="space-y-3 pt-2 border-t border-white/8">
                    <label className="block text-sm font-medium text-white/55">
                      Business name <span className="text-primary">*</span>
                    </label>
                    <input
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      placeholder="e.g. Sweet Crumbs Bakery"
                      className={inputCls}
                    />
                    <label className="block text-sm font-medium text-white/55 mt-3">
                      Industry / type
                    </label>
                    <input
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      placeholder="e.g. Bakery, Consulting, Landscaping"
                      className={inputCls}
                    />
                    <label className="block text-sm font-medium text-white/55 mt-3">
                      Short description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="What do you do and who do you serve?"
                      rows={3}
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                </div>
              )}

              {/* Step 1 — Pages */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-1">
                      Which pages do you need?
                    </h2>
                    <p className="text-sm text-white/40">Select all that apply. Home is always included.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {PAGE_OPTIONS.map((page) => {
                      const checked = form.pages.includes(page);
                      const locked = page === "Home";
                      return (
                        <motion.button
                          key={page}
                          whileHover={!locked ? { scale: 1.02 } : {}}
                          whileTap={!locked ? { scale: 0.97 } : {}}
                          onClick={() => !locked && toggle("pages", page)}
                          className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium text-left transition-all ${
                            checked
                              ? "bg-primary/15 border-primary/40 text-primary"
                              : "bg-white/3 border-white/8 text-white/60 hover:border-primary/25 hover:text-white"
                          } ${locked ? "opacity-70 cursor-default" : ""}`}
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                              checked ? "bg-primary border-primary" : "border-white/25"
                            }`}
                          >
                            {checked && <CheckCircle2 size={10} className="text-white" />}
                          </div>
                          {page}
                          {locked && <span className="text-xs text-white/25 ml-auto">required</span>}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2 — Vibe */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-1">What&apos;s the vibe?</h2>
                    <p className="text-sm text-white/40">This shapes the visual style and tone of your whole site.</p>
                  </div>
                  <div className="space-y-3">
                    {VIBE_OPTIONS.map((v) => (
                      <motion.button
                        key={v.value}
                        whileHover={{ x: 3 }}
                        onClick={() => setForm({ ...form, vibe: v.value })}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                          form.vibe === v.value
                            ? "bg-primary/12 border-primary/40"
                            : "bg-white/3 border-white/8 hover:border-primary/25"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            form.vibe === v.value ? "border-primary" : "border-white/25"
                          }`}
                        >
                          {form.vibe === v.value && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{v.value}</p>
                          <p className="text-xs text-white/40">{v.desc}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3 — Brand Color */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-1">
                      Do you have a brand color?
                    </h2>
                    <p className="text-sm text-white/40">
                      This becomes the accent color across your entire site. Pick a preset or enter your own hex.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.brandColor}
                      onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
                      className="w-12 h-12 rounded-xl cursor-pointer border border-white/10 bg-transparent shrink-0"
                    />
                    <input
                      value={form.brandColor}
                      onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
                      className={`${inputCls} font-mono`}
                      maxLength={7}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-3">Presets</p>
                    <div className="flex gap-3 flex-wrap">
                      {PRESET_COLORS.map((c) => (
                        <motion.button
                          key={c}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setForm({ ...form, brandColor: c })}
                          className="w-9 h-9 rounded-full border-2 transition-all"
                          style={{
                            background: c,
                            borderColor: form.brandColor === c ? "#fff" : "transparent",
                          }}
                        />
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setForm({ ...form, brandColor: "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0") })}
                        className="px-4 h-9 rounded-full border border-white/15 text-xs text-white/50 hover:text-white hover:border-primary/35 transition-all"
                      >
                        Pick for me
                      </motion.button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white/55 mb-2">Preview</p>
                    <div className="rounded-xl p-5 border border-white/8 bg-white/3 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg" style={{ background: form.brandColor }} />
                        <span className="font-bold text-white text-sm">{form.businessName || "Your Business"}</span>
                      </div>
                      <motion.button
                        className="px-5 py-2 rounded-full text-white text-sm font-semibold"
                        style={{ background: form.brandColor }}
                      >
                        {form.callToAction || "Get Started"}
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 — Details */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-1">
                      Any specific details to include?
                    </h2>
                    <p className="text-sm text-white/40">
                      Hours, phone number, address, social links — anything you want on the site.
                    </p>
                  </div>
                  <textarea
                    value={form.details}
                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                    placeholder={`e.g.\nHours: Mon–Fri 9am–6pm\nPhone: (416) 555-0123\nAddress: 123 Main St, Toronto\nInstagram: @mybusiness`}
                    rows={7}
                    className={`${inputCls} resize-none`}
                  />
                  <p className="text-xs text-white/30">Optional — leave blank to skip.</p>
                </div>
              )}

              {/* Step 5 — Review & Generate */}
              {step === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-1">Review & Generate</h2>
                    <p className="text-sm text-white/40">
                      Confirm your answers. Google Stitch will generate your complete website.
                    </p>
                  </div>

                  <div className="bg-white/4 rounded-xl border border-white/8 p-5 space-y-3">
                    {[
                      { label: "Business", value: form.businessName || "—" },
                      { label: "Primary CTA", value: form.callToAction || "—" },
                      { label: "Pages", value: form.pages.join(", ") || "—" },
                      { label: "Vibe", value: form.vibe || "—" },
                      {
                        label: "Brand Color",
                        value: (
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full inline-block border border-white/20" style={{ background: form.brandColor }} />
                            {form.brandColor}
                          </span>
                        ),
                      },
                      { label: "Details", value: form.details ? "Provided" : "None" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between text-sm gap-4">
                        <span className="text-white/45 shrink-0">{row.label}</span>
                        <span className="text-white font-medium text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-primary/8 border border-primary/20 rounded-xl p-4">
                    <p className="text-xs text-primary font-semibold mb-1">
                      Powered by Google Stitch · Gemini 3.1 Pro
                    </p>
                    <p className="text-xs text-white/40">
                      Stitch will generate a complete, deployable Next.js + Tailwind website
                      tailored to your business. This usually takes 15–30 seconds.
                    </p>
                  </div>

                  {genError && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25">
                      <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-300 font-medium">Generation failed</p>
                        <p className="text-xs text-red-400/70 mt-0.5">{genError}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/8">
                <motion.button
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm text-white/45 hover:text-white hover:border-primary/25 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                  Back
                </motion.button>

                {step < 5 ? (
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 0 22px rgba(123,47,255,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep(step + 1)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all shadow-[0_0_14px_rgba(123,47,255,0.3)]"
                  >
                    Continue
                    <ChevronRight size={16} />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 0 28px rgba(123,47,255,0.55)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all shadow-[0_0_16px_rgba(123,47,255,0.35)]"
                  >
                    {generating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles size={16} />
                        </motion.div>
                        Generating with Stitch…
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Generate Website
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
