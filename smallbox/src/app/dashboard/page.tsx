"use client";

import { motion, type Variants } from "framer-motion";
import { DashboardHeader } from "@/components/DashboardHeader";
import { TiltCard } from "@/components/TiltCard";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  DollarSign,
  Megaphone,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Nov", revenue: 3200, expenses: 1800 },
  { month: "Dec", revenue: 3800, expenses: 2100 },
  { month: "Jan", revenue: 3100, expenses: 1900 },
  { month: "Feb", revenue: 4200, expenses: 2200 },
  { month: "Mar", revenue: 3900, expenses: 2000 },
  { month: "Apr", revenue: 4800, expenses: 2400 },
  { month: "May", revenue: 4280, expenses: 2150 },
];

const stats = [
  { label: "Monthly Revenue", value: "$4,280", change: "+18%", up: true, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { label: "Website Views", value: "1,847", change: "+12%", up: true, icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { label: "Campaigns", value: "12", change: "+3 this month", up: true, icon: Megaphone, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { label: "Budget Remaining", value: "$1,850", change: "-$430 spent", up: false, icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
];

const quickActions = [
  { label: "Build a Website", desc: "AI-generated in minutes", icon: Globe, href: "/dashboard/website", color: "bg-primary", glow: "hover:shadow-[0_0_28px_rgba(0,98,255,0.35)]" },
  { label: "Add Transaction", desc: "Track income or expense", icon: DollarSign, href: "/dashboard/finance", color: "bg-emerald-500", glow: "hover:shadow-[0_0_28px_rgba(16,185,129,0.35)]" },
  { label: "Generate Content", desc: "AI marketing copy", icon: Megaphone, href: "/dashboard/marketing", color: "bg-violet-600", glow: "hover:shadow-[0_0_28px_rgba(124,58,237,0.35)]" },
];

const activity = [
  { icon: Globe, text: "Website published", sub: "mybakery.smallbox.app", time: "2h ago", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: DollarSign, text: "Expense added", sub: "Supplies — $234.50", time: "5h ago", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: Megaphone, text: "Campaign sent", sub: "May Newsletter — 142 recipients", time: "1d ago", color: "text-violet-500", bg: "bg-violet-500/10" },
  { icon: Zap, text: "AI generated website copy", sub: "watsonx.ai · 3 sections", time: "2d ago", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: CheckCircle2, text: "Budget review complete", sub: "April — 78% used", time: "3d ago", color: "text-sky-500", bg: "bg-sky-500/10" },
];

const budgets = [
  { category: "Supplies", used: 780, total: 1000, pct: 78 },
  { category: "Marketing", used: 320, total: 500, pct: 64 },
  { category: "Utilities", used: 210, total: 350, pct: 60 },
  { category: "Rent", used: 1200, total: 1200, pct: 100 },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: "easeOut" },
  }),
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader title="Overview" subtitle="Welcome back — here's your business at a glance" />

      <main className="flex-1 p-6 space-y-6">
        {/* Stats Grid */}
        <motion.div
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {stats.map((s, i) => (
            <TiltCard key={s.label} intensity={4}>
              <motion.div
                variants={fadeUp}
                custom={i}
                className={`rounded-2xl border ${s.border} glass-card p-5 h-full transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center`}>
                    <s.icon size={18} className={s.color} />
                  </div>
                  <span className={`text-xs font-medium flex items-center gap-1 ${s.up ? "text-emerald-500" : "text-amber-500"}`}>
                    {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {s.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#1d1d1f] dark:text-white mb-0.5">{s.value}</p>
                <p className="text-xs text-black/40 dark:text-white/40">{s.label}</p>
              </motion.div>
            </TiltCard>
          ))}
        </motion.div>

        {/* Main content row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="xl:col-span-2 rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-[#1d1d1f] dark:text-white">Revenue vs Expenses</h3>
                <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">Last 7 months</p>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                ↑ 18% overall
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0062ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0062ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" className="dark:[stroke:rgba(255,255,255,0.06)]" />
                <XAxis dataKey="month" tick={{ fill: "rgba(0,0,0,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(0,0,0,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", color: "#1d1d1f" }}
                  labelStyle={{ color: "rgba(0,0,0,0.5)" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0062ff" strokeWidth={2} fill="url(#colorRevenue)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#colorExpenses)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#1d1d1f] dark:text-white">Recent Activity</h3>
              <Clock size={14} className="text-black/35 dark:text-white/35" />
            </div>
            <div className="space-y-4">
              {activity.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <div className={`w-8 h-8 rounded-xl ${a.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <a.icon size={14} className={a.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1d1d1f] dark:text-white truncate">{a.text}</p>
                    <p className="text-xs text-black/40 dark:text-white/40 truncate">{a.sub}</p>
                  </div>
                  <span className="text-[10px] text-black/35 dark:text-white/35 shrink-0">{a.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6"
          >
            <h3 className="font-semibold text-[#1d1d1f] dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((qa) => (
                <Link key={qa.label} href={qa.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 p-3 rounded-xl bg-black/3 dark:bg-white/4 border border-black/6 dark:border-white/6 hover:border-primary/25 transition-all cursor-pointer group ${qa.glow}`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${qa.color} flex items-center justify-center shadow-sm`}>
                      <qa.icon size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1d1d1f] dark:text-white">{qa.label}</p>
                      <p className="text-xs text-black/40 dark:text-white/40">{qa.desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-black/30 dark:text-white/30 group-hover:text-primary transition-colors" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Budget Overview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="xl:col-span-2 rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#1d1d1f] dark:text-white">Budget Overview</h3>
              <Link href="/dashboard/finance" className="text-xs text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-4">
              {budgets.map((b, i) => (
                <motion.div
                  key={b.category}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                >
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-[#1d1d1f] dark:text-white font-medium">{b.category}</span>
                    <span className="text-black/40 dark:text-white/40">
                      ${b.used.toLocaleString()} / ${b.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-black/8 dark:bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${b.pct}%` }}
                      transition={{ delay: 0.6 + i * 0.06, duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: b.pct >= 100 ? "#ef4444" : b.pct >= 80 ? "#f59e0b" : "#0062ff" }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-black/35 dark:text-white/35">{b.pct}% used</span>
                    {b.pct >= 100 && <span className="text-[10px] text-red-500 font-medium">Budget exceeded</span>}
                    {b.pct >= 80 && b.pct < 100 && <span className="text-[10px] text-amber-500 font-medium">Near limit</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
