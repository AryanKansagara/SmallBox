"use client";

import dynamic from "next/dynamic";
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
import { ThemeToggle } from "@/components/ThemeToggle";
import { TiltCard } from "@/components/TiltCard";

const HeroOrb = dynamic(() => import("@/components/HeroOrb"), { ssr: false });

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
  { icon: Globe, title: "Website Builder", description: "AI generates a professional website for your business in minutes. Answer a few questions — watsonx.ai handles the rest.", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { icon: DollarSign, title: "Finance & Budgeting", description: "Track income, expenses, and budgets with smart charts. Upload receipts and let AI categorize everything automatically.", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { icon: Megaphone, title: "Marketing AI", description: "Generate Instagram captions, email campaigns, and ad copy in seconds. Analyze customer reviews with Watson NLU.", color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { icon: Brain, title: "watsonx.ai Powered", description: "The same AI models used by Fortune 500 companies, now accessible to your small business — for free.", color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  { icon: Rocket, title: "One-Click Deploy", description: "IBM Cloud Continuous Delivery automatically builds and deploys your website. No DevOps knowledge needed.", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { icon: Shield, title: "Enterprise Security", description: "IBM Verify handles login, SSO, and MFA. Your data is protected by the same infrastructure trusted by IBM clients globally.", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
];

const ibmTech = ["watsonx.ai", "IBM Cloudant", "IBM Cloud", "Watson NLU", "IBM Verify", "IBM Instana", "Watson TTS"];

const howItWorks = [
  { num: "01", title: "Tell us about your business", desc: "Answer a short questionnaire about your business name, industry, services, and style preferences." },
  { num: "02", title: "AI builds everything", desc: "watsonx.ai generates your website, budget plan, and marketing copy — tailored to your business." },
  { num: "03", title: "Publish and grow", desc: "Launch your site with one click. Manage finances and marketing from your SmallBox dashboard." },
];

const testimonials = [
  { text: "I had a professional website for my bakery live in 20 minutes. I couldn't believe it was free.", author: "Maria Chen", role: "Owner, Sweet Crumbs Bakery", rating: 5 },
  { text: "The finance tracking alone saves me hours every month. The AI categorization is scary good.", author: "James Okafor", role: "Freelance Consultant", rating: 5 },
  { text: "My Instagram engagement doubled after using the AI caption generator. Game changer.", author: "Sofia Reyes", role: "Owner, Bloom Boutique", rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#080810] text-[#1d1d1f] dark:text-white overflow-x-hidden">
      {/* NAV */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 md:px-12 border-b border-black/6 dark:border-white/6">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_16px_rgba(0,98,255,0.5)]">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-[#1d1d1f] dark:text-white">SmallBox</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-black/50 dark:text-white/50">
          <a href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-black dark:hover:text-white transition-colors">How it Works</a>
          <a href="#ibm-tech" className="hover:text-black dark:hover:text-white transition-colors">IBM Technology</a>
          <a href="#testimonials" className="hover:text-black dark:hover:text-white transition-colors">Stories</a>
        </div>

        <div className="flex items-center gap-3 ml-8">
          <ThemeToggle />
          <Link href="/dashboard" className="text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(0,98,255,0.5)" }}
              whileTap={{ scale: 0.96 }}
              className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all shadow-[0_0_16px_rgba(0,98,255,0.3)]"
            >
              Get Started Free
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-36 pb-24 px-6 md:px-12 grid-bg overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/8 dark:bg-primary/12 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-[300px] h-[300px] bg-sky-400/5 dark:bg-sky-400/8 rounded-full blur-[100px] pointer-events-none" />

        <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-sm text-primary font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Powered by IBM watsonx.ai — Free for small businesses
            </div>
          </motion.div>

          {/* Hero two-col layout with 3D orb */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={stagger} initial="hidden" animate="visible">
              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6"
              >
                Enterprise tools.{" "}
                <span className="gradient-text">Small business</span>
                {" "}price:{" "}
                <span className="gradient-text">free.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg text-black/55 dark:text-white/55 mb-10 leading-relaxed"
              >
                SmallBox gives your business the same IBM-powered AI, analytics, and automation
                that Fortune 500 companies use — with zero technical expertise required.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex items-center gap-4 flex-wrap mb-8">
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: "0 0 32px rgba(0,98,255,0.5)" }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3.5 rounded-full transition-all text-base shadow-[0_0_20px_rgba(0,98,255,0.35)]"
                  >
                    Start Building Free
                    <ArrowRight size={18} />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 border border-black/12 dark:border-white/12 hover:border-primary/35 text-[#1d1d1f] dark:text-white font-semibold px-8 py-3.5 rounded-full transition-all text-base glass"
                >
                  <Play size={16} className="text-primary" />
                  Watch Demo
                </motion.button>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="flex items-center gap-6 text-sm text-black/40 dark:text-white/40 flex-wrap">
                {["No credit card required", "Free forever on IBM free tier", "Setup in under 5 minutes"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-emerald-500" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* 3D Hero Orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="relative hidden md:block"
            >
              <div className="w-full h-[420px] relative">
                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/15 rounded-full blur-[80px]" />
                <HeroOrb />
              </div>
              {/* Floating chips */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 -left-8 glass border border-primary/25 rounded-xl px-4 py-3 shadow-lg"
              >
                <p className="text-xs text-black/40 dark:text-white/40">AI Generated</p>
                <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white mt-0.5">Website live in 3 min</p>
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="absolute bottom-12 -right-8 glass border border-emerald-500/25 rounded-xl px-4 py-3 shadow-lg"
              >
                <p className="text-xs text-black/40 dark:text-white/40">This month</p>
                <p className="text-sm font-semibold text-emerald-500 mt-0.5">↑ Revenue +18%</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div variants={fadeUp} custom={5} className="mt-20 relative">
            <TiltCard intensity={2} className="mx-auto max-w-5xl">
              <div className="rounded-2xl border border-black/8 dark:border-white/8 glass-card overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-black/6 dark:border-white/6 bg-black/3 dark:bg-white/3">
                  <span className="w-3 h-3 rounded-full bg-red-400/70" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/70" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
                  <div className="flex-1 mx-4 bg-black/5 dark:bg-white/5 rounded px-3 py-1 text-xs text-black/40 dark:text-white/40">
                    smallbox.app/dashboard
                  </div>
                </div>
                <div className="flex h-72">
                  <div className="w-44 border-r border-black/6 dark:border-white/6 p-3 flex flex-col gap-1">
                    {["Overview", "Website Builder", "Finance", "Marketing", "Settings"].map((item, i) => (
                      <div key={item} className={`px-3 py-2 rounded-lg text-xs font-medium ${i === 0 ? "bg-primary/12 text-primary" : "text-black/40 dark:text-white/40"}`}>
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 p-5 flex flex-col gap-4">
                    <div className="text-sm font-semibold text-[#1d1d1f] dark:text-white">Dashboard Overview</div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Monthly Revenue", value: "$4,280", up: true },
                        { label: "Website Views", value: "1,847", up: true },
                        { label: "Campaigns Sent", value: "12", up: false },
                      ].map((s) => (
                        <div key={s.label} className="bg-black/4 dark:bg-white/5 rounded-xl p-3 border border-black/6 dark:border-white/6">
                          <p className="text-[10px] text-black/40 dark:text-white/40 mb-1">{s.label}</p>
                          <p className="text-base font-bold text-[#1d1d1f] dark:text-white">{s.value}</p>
                          <p className={`text-[10px] ${s.up ? "text-emerald-500" : "text-black/40 dark:text-white/40"}`}>
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
                          <div className="flex justify-between text-[10px] text-black/40 dark:text-white/40 mb-1">
                            <span>{b.label}</span><span>{b.pct}%</span>
                          </div>
                          <div className="h-1.5 bg-black/8 dark:bg-white/8 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </motion.div>
      </section>

      {/* IBM TECH STRIP */}
      <section id="ibm-tech" className="border-y border-black/6 dark:border-white/6 py-8 px-6 glass">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm text-black/35 dark:text-white/35 mb-6 font-medium uppercase tracking-widest">
            Trusted by small businesses · Powered by IBM
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {ibmTech.map((tech) => (
              <motion.div
                key={tech}
                whileHover={{ scale: 1.06 }}
                className="px-4 py-2 rounded-full border border-black/8 dark:border-white/8 bg-black/3 dark:bg-white/4 text-sm font-medium text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:border-primary/30 transition-all cursor-default backdrop-blur-sm"
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
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">What&apos;s included</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#1d1d1f] dark:text-white">Everything your business needs</h2>
            <p className="text-black/50 dark:text-white/50 text-lg max-w-2xl mx-auto">Three powerful tools, one dashboard. No subscriptions, no complexity.</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <TiltCard key={f.title} intensity={4}>
                <motion.div
                  variants={fadeUp}
                  custom={i}
                  className={`rounded-2xl border ${f.border} glass-card p-6 group cursor-default h-full transition-all duration-300`}
                >
                  <div className={`w-12 h-12 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <f.icon size={22} className={f.color} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white mb-2">{f.title}</h3>
                  <p className="text-black/50 dark:text-white/50 text-sm leading-relaxed">{f.description}</p>
                </motion.div>
              </TiltCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 glass border-y border-black/6 dark:border-white/6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Simple by design</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#1d1d1f] dark:text-white">How it works</h2>
            <p className="text-black/50 dark:text-white/50 text-lg max-w-xl mx-auto">From sign up to live website in under 5 minutes.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }} className="text-center">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 0 32px rgba(0,98,255,0.2)" }}
                  className="w-20 h-20 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mx-auto mb-6 transition-all"
                >
                  <span className="text-2xl font-black text-primary">{step.num}</span>
                </motion.div>
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-3">{step.title}</h3>
                <p className="text-black/50 dark:text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Success stories</p>
            <h2 className="text-4xl font-bold mb-4 text-[#1d1d1f] dark:text-white">Real businesses. Real results.</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TiltCard key={t.author} intensity={3}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6 h-full"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-[#1d1d1f] dark:text-white text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-[#1d1d1f] dark:text-white text-sm">{t.author}</p>
                    <p className="text-black/40 dark:text-white/40 text-xs mt-0.5">{t.role}</p>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 px-6 md:px-12">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#0050d0] to-[#003399]" />
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-sky-400/20 rounded-full blur-2xl" />

          <div className="relative px-10 py-16 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Ready to level the playing field?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">Join thousands of small businesses using IBM enterprise tools — completely free.</p>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255,255,255,0.3)" }}
                whileTap={{ scale: 0.96 }}
                className="bg-white text-primary font-bold px-10 py-4 rounded-full text-base hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
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
      <section className="py-16 px-6 md:px-12 border-t border-black/6 dark:border-white/6 glass">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-black/35 dark:text-white/35 text-sm font-medium uppercase tracking-widest mb-8">UN Sustainable Development Goals</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { sdg: "SDG 8", label: "Decent Work & Economic Growth", desc: "Empowering small businesses to compete with larger corporations" },
              { sdg: "SDG 9", label: "Industry, Innovation & Infrastructure", desc: "Democratizing access to IBM-grade cloud infrastructure" },
              { sdg: "SDG 10", label: "Reduced Inequalities", desc: "Closing the technology gap between large and small businesses" },
            ].map((s) => (
              <motion.div key={s.sdg} whileHover={{ y: -3 }} className="rounded-xl border border-black/8 dark:border-white/8 hover:border-primary/30 glass-card p-5 transition-all">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded mb-2 inline-block">{s.sdg}</span>
                <p className="font-semibold text-[#1d1d1f] dark:text-white text-sm mb-1">{s.label}</p>
                <p className="text-black/45 dark:text-white/45 text-xs leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/6 dark:border-white/6 py-12 px-6 md:px-12 glass">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_12px_rgba(0,98,255,0.4)]">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-[#1d1d1f] dark:text-white">SmallBox</span>
          </div>
          <p className="text-black/35 dark:text-white/35 text-sm text-center">
            © 2026 SmallBox · Powered by IBM Cloud & watsonx.ai · Built for IBM-UNSA Hackathon
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-primary/15 flex items-center justify-center">
              <span className="text-[8px] font-bold text-primary">IBM</span>
            </div>
            <span className="text-xs font-medium text-black/40 dark:text-white/40">Technology Partner</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
