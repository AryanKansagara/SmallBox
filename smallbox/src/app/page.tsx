"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  Globe,
  DollarSign,
  Megaphone,
  Zap,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Star,
  Shield,
  Rocket,
  Brain,
  Play,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const features = [
  {
    icon: Globe,
    title: "Website Builder",
    description: "AI generates a professional website for your business in minutes. Answer a few questions — watsonx.ai handles the rest.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: DollarSign,
    title: "Finance & Budgeting",
    description: "Track income, expenses, and budgets with smart charts. Upload receipts and let AI categorize everything automatically.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Megaphone,
    title: "Marketing AI",
    description: "Generate Instagram captions, email campaigns, and ad copy in seconds. Analyze customer reviews with Watson NLU.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: Brain,
    title: "watsonx.ai Powered",
    description: "The same AI models used by Fortune 500 companies, now accessible to your small business — for free.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
  {
    icon: Rocket,
    title: "One-Click Deploy",
    description: "IBM Cloud Continuous Delivery automatically builds and deploys your website. No DevOps knowledge needed.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "IBM Verify handles login, SSO, and MFA. Your data is protected by the same infrastructure trusted by IBM clients globally.",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
];

const ibmTech = [
  "watsonx.ai",
  "IBM Cloudant",
  "IBM Cloud",
  "Watson NLU",
  "IBM Verify",
  "IBM Instana",
  "Watson TTS",
];

const steps = [
  {
    num: "01",
    title: "Tell us about your business",
    desc: "Answer a short questionnaire about your business name, industry, services, and style preferences.",
  },
  {
    num: "02",
    title: "AI builds everything",
    desc: "watsonx.ai generates your website, budget plan, and marketing copy — tailored to your business.",
  },
  {
    num: "03",
    title: "Publish and grow",
    desc: "Launch your site with one click. Manage finances and marketing from your SmallBox dashboard.",
  },
];

const testimonials = [
  {
    text: "I had a professional website for my bakery live in 20 minutes. I couldn't believe it was free.",
    author: "Maria Chen",
    role: "Owner, Sweet Crumbs Bakery",
    rating: 5,
  },
  {
    text: "The finance tracking alone saves me hours every month. The AI categorization is scary good.",
    author: "James Okafor",
    role: "Freelance Consultant",
    rating: 5,
  },
  {
    text: "My Instagram engagement doubled after using the AI caption generator. Game changer.",
    author: "Sofia Reyes",
    role: "Owner, Bloom Boutique",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white overflow-x-hidden">
      {/* NAV */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 md:px-12">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-lg bg-[#0062ff] flex items-center justify-center shadow-[0_0_16px_rgba(0,98,255,0.5)]">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-lg tracking-tight">SmallBox</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-[#8b9cb6]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#ibm-tech" className="hover:text-white transition-colors">IBM Technology</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Stories</a>
        </div>

        <div className="flex items-center gap-3 ml-8">
          <Link href="/dashboard" className="text-sm text-[#8b9cb6] hover:text-white transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(0,98,255,0.5)" }}
              whileTap={{ scale: 0.96 }}
              className="bg-[#0062ff] hover:bg-[#0050d0] text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
            >
              Get Started Free
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-36 pb-24 px-6 md:px-12 grid-bg">
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#0062ff]/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0062ff]/30 bg-[#0062ff]/10 text-sm text-[#0062ff] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0062ff] animate-pulse" />
              Powered by IBM watsonx.ai — Free for small businesses
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-5xl md:text-7xl font-extrabold text-center leading-[1.05] tracking-tight mb-6"
          >
            Enterprise tools.{" "}
            <span className="gradient-text">Small business</span>
            <br />
            price: <span className="gradient-text">free.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-lg md:text-xl text-[#8b9cb6] text-center max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            SmallBox gives your business the same IBM-powered AI, analytics, and automation
            that Fortune 500 companies use — with zero technical expertise required.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex items-center justify-center gap-4 flex-wrap mb-16">
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 0 32px rgba(0,98,255,0.5)" }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 bg-[#0062ff] hover:bg-[#0050d0] text-white font-semibold px-8 py-3.5 rounded-full transition-colors text-base"
              >
                Start Building Free
                <ArrowRight size={18} />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 border border-[#2a3a55] hover:border-[#0062ff]/40 text-white font-semibold px-8 py-3.5 rounded-full transition-colors text-base bg-white/5"
            >
              <Play size={16} className="text-[#0062ff]" />
              Watch Demo
            </motion.button>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="flex items-center justify-center gap-6 text-sm text-[#4b5e7a] flex-wrap">
            {["No credit card required", "Free forever on IBM free tier", "Setup in under 5 minutes"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#10b981]" />
                {t}
              </span>
            ))}
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div variants={fadeUp} custom={5} className="mt-16 relative">
            <div className="rounded-2xl border border-[#2a3a55] bg-[#111827] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] mx-auto max-w-5xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a3a55] bg-[#0a0e1a]">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]/70" />
                <span className="w-3 h-3 rounded-full bg-[#f59e0b]/70" />
                <span className="w-3 h-3 rounded-full bg-[#10b981]/70" />
                <div className="flex-1 mx-4 bg-[#1a2235] rounded px-3 py-1 text-xs text-[#4b5e7a]">
                  smallbox.app/dashboard
                </div>
              </div>
              <div className="flex h-72">
                <div className="w-44 border-r border-[#2a3a55] p-3 flex flex-col gap-1">
                  {["Overview", "Website Builder", "Finance", "Marketing", "Settings"].map((item, i) => (
                    <div key={item} className={`px-3 py-2 rounded-lg text-xs font-medium ${i === 0 ? "bg-[#0062ff]/15 text-[#0062ff]" : "text-[#4b5e7a]"}`}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-5 flex flex-col gap-4">
                  <div className="text-sm font-semibold text-white">Dashboard Overview</div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Monthly Revenue", value: "$4,280", up: true },
                      { label: "Website Views", value: "1,847", up: true },
                      { label: "Campaigns Sent", value: "12", up: false },
                    ].map((s) => (
                      <div key={s.label} className="bg-[#1a2235] rounded-xl p-3 border border-[#2a3a55]">
                        <p className="text-[10px] text-[#4b5e7a] mb-1">{s.label}</p>
                        <p className="text-base font-bold text-white">{s.value}</p>
                        <p className={`text-[10px] ${s.up ? "text-[#10b981]" : "text-[#8b9cb6]"}`}>
                          {s.up ? "↑ 12% vs last month" : "→ Stable"}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Budget Used", pct: 65, color: "#0062ff" },
                      { label: "Marketing Goals", pct: 42, color: "#10b981" },
                    ].map((b) => (
                      <div key={b.label}>
                        <div className="flex justify-between text-[10px] text-[#4b5e7a] mb-1">
                          <span>{b.label}</span>
                          <span>{b.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-[#2a3a55] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 top-12 glass rounded-xl px-4 py-3 border border-[#0062ff]/30 hidden md:block"
            >
              <p className="text-xs text-[#4b5e7a]">AI Generated</p>
              <p className="text-sm font-semibold text-white mt-0.5">Website live in 3 min</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -left-4 bottom-8 glass rounded-xl px-4 py-3 border border-[#10b981]/30 hidden md:block"
            >
              <p className="text-xs text-[#4b5e7a]">This month</p>
              <p className="text-sm font-semibold text-[#10b981] mt-0.5">↑ Revenue +18%</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* IBM TECH STRIP */}
      <section id="ibm-tech" className="border-y border-[#2a3a55] py-8 px-6 bg-[#111827]/50">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm text-[#4b5e7a] mb-6 font-medium uppercase tracking-widest">
            Trusted by small businesses · Powered by IBM
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {ibmTech.map((tech) => (
              <motion.div
                key={tech}
                whileHover={{ scale: 1.06 }}
                className="px-4 py-2 rounded-full border border-[#2a3a55] bg-[#1a2235] text-sm font-medium text-[#8b9cb6] hover:text-white hover:border-[#0062ff]/40 transition-all cursor-default"
              >
                IBM · {tech}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-[#0062ff] text-sm font-semibold uppercase tracking-widest mb-3">What&apos;s included</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything your business needs</h2>
            <p className="text-[#8b9cb6] text-lg max-w-2xl mx-auto">
              Three powerful tools, one dashboard. No subscriptions, no complexity.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, boxShadow: "0 16px 48px rgba(0,0,0,0.4)" }}
                transition={{ duration: 0.2 }}
                className={`rounded-2xl border ${f.border} bg-[#111827] p-6 group cursor-default`}
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} className={f.color} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-[#8b9cb6] text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 bg-[#111827]/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#0062ff] text-sm font-semibold uppercase tracking-widest mb-3">Simple by design</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How it works</h2>
            <p className="text-[#8b9cb6] text-lg max-w-xl mx-auto">From sign up to live website in under 5 minutes.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-[#0062ff]/10 border border-[#0062ff]/20 flex items-center justify-center mx-auto mb-6 hover:bg-[#0062ff]/20 transition-colors">
                  <span className="text-2xl font-black text-[#0062ff]">{step.num}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-[#8b9cb6] text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#0062ff] text-sm font-semibold uppercase tracking-widest mb-3">Success stories</p>
            <h2 className="text-4xl font-bold mb-4">Real businesses. Real results.</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-[#2a3a55] bg-[#111827] p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-[#f59e0b] fill-[#f59e0b]" />
                  ))}
                </div>
                <p className="text-white text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-white text-sm">{t.author}</p>
                  <p className="text-[#4b5e7a] text-xs mt-0.5">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0062ff] via-[#0050d0] to-[#003399]" />
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          <div className="relative px-10 py-16 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Ready to level the playing field?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of small businesses using IBM enterprise tools — completely free.
            </p>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255,255,255,0.3)" }}
                whileTap={{ scale: 0.96 }}
                className="bg-white text-[#0062ff] font-bold px-10 py-4 rounded-full text-base hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
              >
                Get Started Free
                <ChevronRight size={18} />
              </motion.button>
            </Link>
            <p className="text-blue-200/70 text-sm mt-4">No credit card. No setup fees. No catch.</p>
          </div>
        </motion.div>
      </section>

      {/* SDG SECTION */}
      <section className="py-16 px-6 md:px-12 border-t border-[#2a3a55] bg-[#111827]/30">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[#4b5e7a] text-sm font-medium uppercase tracking-widest mb-8">UN Sustainable Development Goals</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { sdg: "SDG 8", label: "Decent Work & Economic Growth", desc: "Empowering small businesses to compete with larger corporations" },
              { sdg: "SDG 9", label: "Industry, Innovation & Infrastructure", desc: "Democratizing access to IBM-grade cloud infrastructure" },
              { sdg: "SDG 10", label: "Reduced Inequalities", desc: "Closing the technology gap between large and small businesses" },
            ].map((s) => (
              <motion.div
                key={s.sdg}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-[#2a3a55] hover:border-[#0062ff]/40 bg-[#111827] p-5 transition-all"
              >
                <span className="text-xs font-bold text-[#0062ff] bg-[#0062ff]/10 px-2 py-0.5 rounded mb-2 inline-block">{s.sdg}</span>
                <p className="font-semibold text-white text-sm mb-1">{s.label}</p>
                <p className="text-[#4b5e7a] text-xs leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#2a3a55] py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0062ff] flex items-center justify-center">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-white">SmallBox</span>
          </div>
          <p className="text-[#4b5e7a] text-sm text-center">
            © 2026 SmallBox · Powered by IBM Cloud & watsonx.ai · Built for IBM-UNSA Hackathon
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-[#0062ff]/20 flex items-center justify-center">
              <span className="text-[8px] font-bold text-[#0062ff]">IBM</span>
            </div>
            <span className="text-xs font-medium text-[#4b5e7a]">Technology Partner</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
