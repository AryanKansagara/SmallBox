"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  Globe,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Rocket,
  Palette,
  Phone,
  Building2,
  FileText,
  Upload,
  Eye,
} from "lucide-react";

const steps = [
  { id: 1, label: "Business Info", icon: Building2 },
  { id: 2, label: "Services", icon: FileText },
  { id: 3, label: "Style", icon: Palette },
  { id: 4, label: "Features", icon: Phone },
  { id: 5, label: "Generate", icon: Sparkles },
];

const industries = ["Retail", "Food & Beverage", "Services", "Healthcare", "Education", "E-commerce", "Construction", "Beauty & Wellness", "Finance", "Other"];
const tones = [
  { value: "professional", label: "Professional", desc: "Formal, trustworthy, and polished" },
  { value: "friendly", label: "Friendly", desc: "Warm, approachable, and conversational" },
  { value: "bold", label: "Bold", desc: "Energetic, confident, and impactful" },
];

type FormData = {
  businessName: string;
  industry: string;
  description: string;
  services: string[];
  tone: string;
  primaryColor: string;
  contactForm: boolean;
  bookingForm: boolean;
  logo: boolean;
};

export default function WebsiteBuilderPage() {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [form, setForm] = useState<FormData>({
    businessName: "",
    industry: "",
    description: "",
    services: ["", "", ""],
    tone: "professional",
    primaryColor: "#0062ff",
    contactForm: true,
    bookingForm: false,
    logo: false,
  });

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 3500);
  };

  const updateService = (index: number, value: string) => {
    const s = [...form.services];
    s[index] = value;
    setForm({ ...form, services: s });
  };

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader title="Website Builder" subtitle="Generate a professional website in minutes with AI" />

      <main className="flex-1 p-6">
        {!generated ? (
          <div className="max-w-3xl mx-auto">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <motion.button
                    whileHover={step !== s.id ? { scale: 1.05 } : {}}
                    onClick={() => s.id < step && setStep(s.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      step === s.id
                        ? "bg-[#0062ff] text-white"
                        : step > s.id
                        ? "bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 cursor-pointer"
                        : "bg-[#1a2235] text-[#4b5e7a] border border-[#2a3a55]"
                    }`}
                  >
                    {step > s.id ? <CheckCircle2 size={12} /> : <s.icon size={12} />}
                    {s.label}
                  </motion.button>
                  {i < steps.length - 1 && (
                    <div className={`h-px w-6 ${step > s.id ? "bg-[#10b981]/40" : "bg-[#2a3a55]"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-[#2a3a55] bg-[#111827] p-8"
              >
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-1">Tell us about your business</h2>
                      <p className="text-sm text-[#4b5e7a]">This helps watsonx.ai craft the perfect website copy for you.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8b9cb6] mb-2">Business Name *</label>
                      <input
                        value={form.businessName}
                        onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                        placeholder="e.g. Sweet Crumbs Bakery"
                        className="w-full bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4b5e7a] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8b9cb6] mb-2">Industry</label>
                      <div className="flex flex-wrap gap-2">
                        {industries.map((ind) => (
                          <motion.button
                            key={ind}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setForm({ ...form, industry: ind })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              form.industry === ind
                                ? "bg-[#0062ff]/15 border-[#0062ff]/40 text-[#0062ff]"
                                : "bg-[#1a2235] border-[#2a3a55] text-[#8b9cb6] hover:border-[#0062ff]/30"
                            }`}
                          >
                            {ind}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8b9cb6] mb-2">Business Description</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Describe what you do and who you serve..."
                        rows={4}
                        className="w-full bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4b5e7a] outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-1">What do you offer?</h2>
                      <p className="text-sm text-[#4b5e7a]">List your top services or products (up to 5).</p>
                    </div>
                    {form.services.map((s, i) => (
                      <div key={i}>
                        <label className="block text-sm font-medium text-[#8b9cb6] mb-2">Service {i + 1} {i === 0 && "*"}</label>
                        <input
                          value={s}
                          onChange={(e) => updateService(i, e.target.value)}
                          placeholder={["e.g. Custom Birthday Cakes", "e.g. Catering for Events", "e.g. Baking Classes"][i] || `Service ${i + 1}`}
                          className="w-full bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4b5e7a] outline-none transition-colors"
                        />
                      </div>
                    ))}
                    {form.services.length < 5 && (
                      <button
                        onClick={() => setForm({ ...form, services: [...form.services, ""] })}
                        className="text-sm text-[#0062ff] hover:underline"
                      >
                        + Add another service
                      </button>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-1">Choose your style</h2>
                      <p className="text-sm text-[#4b5e7a]">Define the look and feel of your website.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8b9cb6] mb-3">Tone & Personality</label>
                      <div className="space-y-3">
                        {tones.map((t) => (
                          <motion.button
                            key={t.value}
                            whileHover={{ x: 2 }}
                            onClick={() => setForm({ ...form, tone: t.value })}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                              form.tone === t.value
                                ? "bg-[#0062ff]/10 border-[#0062ff]/40"
                                : "bg-[#1a2235] border-[#2a3a55] hover:border-[#0062ff]/20"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              form.tone === t.value ? "border-[#0062ff]" : "border-[#4b5e7a]"
                            }`}>
                              {form.tone === t.value && <div className="w-2 h-2 rounded-full bg-[#0062ff]" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{t.label}</p>
                              <p className="text-xs text-[#4b5e7a]">{t.desc}</p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8b9cb6] mb-2">Brand Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={form.primaryColor}
                          onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-[#2a3a55] bg-transparent"
                        />
                        <input
                          value={form.primaryColor}
                          onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                          className="bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors font-mono"
                        />
                        <div className="flex gap-2">
                          {["#0062ff", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map((c) => (
                            <button
                              key={c}
                              onClick={() => setForm({ ...form, primaryColor: c })}
                              className="w-7 h-7 rounded-full border-2 transition-all"
                              style={{ background: c, borderColor: form.primaryColor === c ? "#fff" : "transparent" }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-1">Add features</h2>
                      <p className="text-sm text-[#4b5e7a]">Select what you'd like to include on your site.</p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { key: "contactForm", label: "Contact Form", desc: "Let customers reach you directly" },
                        { key: "bookingForm", label: "Booking / Appointment Form", desc: "Allow customers to schedule with you" },
                        { key: "logo", label: "Upload Logo", desc: "Add your existing logo to the site" },
                      ].map((f) => (
                        <motion.button
                          key={f.key}
                          whileHover={{ x: 2 }}
                          onClick={() => setForm({ ...form, [f.key]: !form[f.key as keyof FormData] })}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                            form[f.key as keyof FormData]
                              ? "bg-[#0062ff]/10 border-[#0062ff]/40"
                              : "bg-[#1a2235] border-[#2a3a55] hover:border-[#0062ff]/20"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            form[f.key as keyof FormData] ? "bg-[#0062ff] border-[#0062ff]" : "border-[#4b5e7a]"
                          }`}>
                            {form[f.key as keyof FormData] && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{f.label}</p>
                            <p className="text-xs text-[#4b5e7a]">{f.desc}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    {form.logo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="border-2 border-dashed border-[#2a3a55] rounded-xl p-8 text-center hover:border-[#0062ff]/40 transition-colors cursor-pointer"
                      >
                        <Upload size={24} className="text-[#4b5e7a] mx-auto mb-2" />
                        <p className="text-sm text-[#4b5e7a]">Drop your logo here or click to upload</p>
                        <p className="text-xs text-[#4b5e7a] mt-1">PNG, SVG, or JPG up to 5MB</p>
                      </motion.div>
                    )}
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-1">Generate your website</h2>
                      <p className="text-sm text-[#4b5e7a]">watsonx.ai will create a complete website from your answers.</p>
                    </div>

                    {/* Summary */}
                    <div className="bg-[#1a2235] rounded-xl border border-[#2a3a55] p-5 space-y-3">
                      <p className="text-xs font-semibold text-[#4b5e7a] uppercase tracking-widest">Summary</p>
                      {[
                        { label: "Business", value: form.businessName || "Not set" },
                        { label: "Industry", value: form.industry || "Not set" },
                        { label: "Tone", value: form.tone },
                        { label: "Services", value: `${form.services.filter(Boolean).length} listed` },
                        { label: "Features", value: [form.contactForm && "Contact form", form.bookingForm && "Booking form"].filter(Boolean).join(", ") || "None" },
                      ].map((r) => (
                        <div key={r.label} className="flex items-center justify-between text-sm">
                          <span className="text-[#8b9cb6]">{r.label}</span>
                          <span className="text-white font-medium">{r.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#0062ff]/5 border border-[#0062ff]/20 rounded-xl p-4">
                      <p className="text-xs text-[#0062ff] font-semibold mb-1">Powered by watsonx.ai</p>
                      <p className="text-xs text-[#4b5e7a]">
                        AI will generate homepage copy, about section, service descriptions, contact page, and SEO metadata — all tailored to your business.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#2a3a55]">
                  <motion.button
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2a3a55] text-sm text-[#8b9cb6] hover:text-white hover:border-[#0062ff]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </motion.button>

                  {step < 5 ? (
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(0,98,255,0.4)" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setStep(step + 1)}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#0062ff] text-white text-sm font-semibold hover:bg-[#0050d0] transition-colors"
                    >
                      Continue
                      <ChevronRight size={16} />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(0,98,255,0.5)" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleGenerate}
                      disabled={generating}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0062ff] text-white text-sm font-semibold hover:bg-[#0050d0] disabled:opacity-70 transition-all"
                    >
                      {generating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles size={16} />
                          </motion.div>
                          Generating with watsonx.ai...
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
        ) : (
          /* Generated result */
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20">
              <CheckCircle2 size={20} className="text-[#10b981]" />
              <div>
                <p className="font-semibold text-white text-sm">Website generated successfully!</p>
                <p className="text-xs text-[#4b5e7a]">watsonx.ai created your site in 3.2 seconds. Preview and publish below.</p>
              </div>
            </div>

            {/* Website Preview */}
            <div className="rounded-2xl border border-[#2a3a55] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a3a55] bg-[#0a0e1a]">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]/70" />
                <span className="w-3 h-3 rounded-full bg-[#f59e0b]/70" />
                <span className="w-3 h-3 rounded-full bg-[#10b981]/70" />
                <div className="flex-1 mx-4 bg-[#1a2235] rounded px-3 py-1 text-xs text-[#4b5e7a]">
                  {form.businessName ? form.businessName.toLowerCase().replace(/\s+/g, "") : "mybusiness"}.smallbox.app
                </div>
                <button className="text-xs text-[#0062ff] flex items-center gap-1">
                  <Eye size={12} /> Preview
                </button>
              </div>
              <div className="bg-white h-72 flex items-center justify-center relative overflow-hidden">
                {/* Simple preview mockup */}
                <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${form.primaryColor}15, ${form.primaryColor}05)` }}>
                  <div className="px-8 py-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded" style={{ background: form.primaryColor }} />
                      <span className="font-bold text-gray-800 text-sm">{form.businessName || "Your Business"}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                    <div className="h-8 rounded-full w-32" style={{ background: form.primaryColor }} />
                  </div>
                  <div className="px-8 grid grid-cols-3 gap-3 mt-2">
                    {form.services.filter(Boolean).slice(0, 3).map((s, i) => (
                      <div key={i} className="bg-white/80 rounded-lg p-3 shadow-sm">
                        <div className="h-2 rounded mb-1" style={{ background: form.primaryColor, width: "60%" }} />
                        <div className="h-2 bg-gray-200 rounded w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(0,98,255,0.4)" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0062ff] text-white font-semibold text-sm hover:bg-[#0050d0] transition-colors"
              >
                <Rocket size={16} />
                Publish Website
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setGenerated(false); setStep(1); }}
                className="px-6 py-3 rounded-xl border border-[#2a3a55] text-[#8b9cb6] hover:text-white hover:border-[#0062ff]/30 font-medium text-sm transition-all"
              >
                Edit Answers
              </motion.button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
