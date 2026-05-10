"use client";

import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  Globe,
  DollarSign,
  Megaphone,
  Activity,
  ArrowRight,
  TrendingUp,
  MoreHorizontal,
  ChevronDown,
  Zap,
  Mail,
  Share2,
  Search,
} from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts";

/* ─── Data ──────────────────────────────────────────────────────── */

const visitorData = [
  { t: "Oct", v: 22 }, { t: "Nov", v: 35 }, { t: "Dec", v: 28 },
  { t: "Jan", v: 45 }, { t: "Feb", v: 38 }, { t: "Mar", v: 50 },
  { t: "Apr", v: 42 }, { t: "May", v: 58 },
];

const heroStats = [
  { label: "Revenue",   value: "$4,280", dot: "#7b2fff" },
  { label: "Views",     value: "1,847",  dot: "#10b981" },
  { label: "Campaigns", value: "12",     dot: "#8b5cf6" },
  { label: "Profit",    value: "$2,130", dot: "#f59e0b" },
];

const campaigns = [
  {
    name: "May Newsletter",
    type: "Email Campaign",
    icon: Mail,
    reach: "142 recipients",
    metric: "68% open rate",
    metricUp: true,
    spark: [10, 15, 12, 22, 18, 28, 24, 32],
    color: "#8b5cf6",
    bg: "bg-violet-500/15 dark:bg-violet-500/20",
  },
  {
    name: "Instagram Reel — Croissants",
    type: "Social Media",
    icon: Share2,
    reach: "3,241 views",
    metric: "14.2% engagement",
    metricUp: true,
    spark: [5, 18, 9, 28, 20, 35, 22, 40],
    color: "#ec4899",
    bg: "bg-pink-500/15 dark:bg-pink-500/20",
  },
  {
    name: "Google Ad — Custom Cakes",
    type: "Paid Search",
    icon: Search,
    reach: "890 clicks",
    metric: "4.8% CTR",
    metricUp: false,
    spark: [8, 12, 10, 15, 14, 18, 16, 20],
    color: "#f59e0b",
    bg: "bg-amber-500/15 dark:bg-amber-500/20",
  },
  {
    name: "Spring Promo Email",
    type: "Email Campaign",
    icon: Mail,
    reach: "98 recipients",
    metric: "51% open rate",
    metricUp: false,
    spark: [6, 8, 11, 9, 14, 12, 16, 15],
    color: "#7b2fff",
    bg: "bg-blue-500/15 dark:bg-blue-500/20",
  },
];

/* ─── Sparkline ──────────────────────────────────────────────────── */

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const W = 72;
  const H = 28;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / (max - min || 1)) * H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <DashboardHeader
        title="Overview"
        subtitle="Welcome back — here's Sweet Crumbs Bakery at a glance"
      />

      <main className="flex-1 p-5 flex flex-col gap-5 overflow-auto">
        {/* ── Top row ─────────────────────────────────────────────── */}
        <div className="flex gap-5" style={{ minHeight: 360 }}>

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-[3] relative rounded-2xl overflow-hidden flex flex-col"
            style={{
              background:
                "linear-gradient(135deg,#08091a 0%,#0d1230 45%,#1c0d30 75%,#091020 100%)",
            }}
          >
            {/* Ambient glows */}
            <div className="pointer-events-none absolute inset-0">
              <div
                style={{
                  position: "absolute", top: "-25%", left: "-5%",
                  width: "55%", height: "80%",
                  background: "radial-gradient(ellipse,rgba(123,47,255,0.22) 0%,transparent 70%)",
                }}
              />
              <div
                style={{
                  position: "absolute", bottom: "0%", right: "5%",
                  width: "50%", height: "65%",
                  background: "radial-gradient(ellipse,rgba(160,80,255,0.18) 0%,transparent 70%)",
                }}
              />
            </div>

            {/* Body */}
            <div className="relative z-10 flex-1 p-8 flex flex-col">
              {/* IBM badge */}
              <div className="mb-6 inline-flex">
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1 text-[11px] text-white/65 font-medium">
                  <Zap size={10} className="text-blue-400" fill="currentColor" />
                  Powered by IBM watsonx.ai
                </span>
              </div>

              {/* Heading */}
              <p className="text-white/35 text-sm mb-2 font-medium">Sweet Crumbs Bakery</p>
              <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-8 tracking-tight">
                Optimize<br />Your Business
              </h2>

              <Link href="/dashboard/website">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-white text-[#08091a] font-semibold text-sm px-7 py-3 rounded-full"
                >
                  Start Growing <ArrowRight size={14} />
                </motion.button>
              </Link>
            </div>

            {/* Stats strip */}
            <div className="relative z-10 flex border-t border-white/[0.09] bg-black/25 backdrop-blur-sm">
              {heroStats.map((s) => (
                <div
                  key={s.label}
                  className="flex-1 px-5 py-4 border-r border-white/[0.07] last:border-r-0"
                >
                  <p className="text-xl xl:text-2xl font-bold text-white mb-0.5">{s.value}</p>
                  <p className="text-[11px] text-white/40 flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0"
                      style={{ background: s.dot }}
                    />
                    {s.label}
                  </p>
                </div>
              ))}
              <button className="px-4 border-l border-white/[0.07] flex items-center justify-center shrink-0">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
                  <ArrowRight size={14} className="text-white" />
                </div>
              </button>
            </div>
          </motion.div>

          {/* Right column */}
          <div className="flex-[2] flex flex-col gap-5 min-w-0">

            {/* Visitors chart */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex-1 rounded-2xl border border-black/[0.07] dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl p-5 flex flex-col"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                  Website Visitors right now
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff2a] inline-block" />
                </p>
                <span className="text-[11px] bg-black/[0.06] dark:bg-white/[0.08] text-black/50 dark:text-white/50 px-2 py-0.5 rounded-full">
                  live
                </span>
              </div>
              <p className="text-3xl font-bold text-[#1d1d1f] dark:text-white mb-3">58</p>
              <ResponsiveContainer width="100%" height={90}>
                <LineChart data={visitorData} margin={{ top: 2, right: 4, left: -40, bottom: 0 }}>
                  <XAxis
                    dataKey="t"
                    tick={{ fill: "rgba(155,155,155,0.55)", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#c8ff2a"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10,10,25,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      color: "#fff",
                      fontSize: 11,
                    }}
                    itemStyle={{ color: "#c8ff2a" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Latest transaction */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="flex-1 rounded-2xl border border-black/[0.07] dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl p-5 flex flex-col gap-3"
            >
              <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white">Latest Transaction</p>

              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <TrendingUp size={11} className="text-emerald-500" />
                    <span className="text-[10px] text-emerald-500 font-semibold">+6% this week</span>
                  </div>
                  <p className="text-3xl font-bold text-[#1d1d1f] dark:text-white">
                    $234<span className="text-xl">.50</span>
                  </p>
                  <p className="text-xs text-black/40 dark:text-white/40 mt-1">Supplies · 5h ago</p>
                </div>
                <div
                  className="w-[72px] h-[72px] rounded-2xl shrink-0 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)" }}
                >
                  <Megaphone size={26} className="text-blue-400/50" />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                <div className="w-7 h-7 rounded-lg bg-primary/12 flex items-center justify-center shrink-0">
                  <Activity size={12} className="text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-black/40 dark:text-white/40">Total revenue this month</p>
                  <p className="text-sm font-bold text-[#1d1d1f] dark:text-white">$4,280.00</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Campaigns table ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="rounded-2xl border border-black/[0.07] dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white">
              Your top campaigns this period
            </p>
            <button className="flex items-center gap-1.5 text-xs bg-black/[0.05] dark:bg-white/[0.07] border border-black/[0.08] dark:border-white/[0.1] px-3 py-1.5 rounded-xl text-[#1d1d1f] dark:text-white">
              Popularity <ChevronDown size={12} />
            </button>
          </div>

          {/* Header row */}
          <div className="grid items-center gap-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.06] text-[11px] text-black/35 dark:text-white/35"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 72px 32px" }}>
            <span>Campaign</span>
            <span>Reach</span>
            <span>Performance</span>
            <span>Trend</span>
            <span />
          </div>

          <div className="space-y-0.5 mt-1">
            {campaigns.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="grid items-center gap-4 py-3 px-2 -mx-2 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors group cursor-default"
                style={{ gridTemplateColumns: "2fr 1fr 1fr 72px 32px" }}
              >
                {/* Campaign info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}
                  >
                    <c.icon size={16} style={{ color: c.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1d1d1f] dark:text-white truncate">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-black/38 dark:text-white/38">{c.type}</p>
                  </div>
                </div>

                <span className="text-sm text-black/55 dark:text-white/55">{c.reach}</span>

                <span
                  className="text-sm font-semibold"
                  style={{ color: c.metricUp ? "#10b981" : "#f59e0b" }}
                >
                  {c.metric}
                </span>

                <Sparkline data={c.spark} color={c.color} />

                <button className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.08] flex items-center justify-center">
                  <MoreHorizontal size={14} className="text-black/40 dark:text-white/40" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
