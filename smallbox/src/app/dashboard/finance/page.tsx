"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHeader } from "@/components/DashboardHeader";
import { TiltCard } from "@/components/TiltCard";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  X,
  Pencil,
  Check,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────

type TransactionType = "income" | "expense";

interface Transaction {
  id: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  month: string;
  type: TransactionType;
}

interface Budget {
  category: string;
  total: number;
  color: string;
}

// ── Seed data ──────────────────────────────────────────────────────────────

const SEED_TRANSACTIONS: Transaction[] = [
  { id: 1, description: "Ingredient Supplier", category: "Supplies", amount: 234.50, date: "May 8", month: "2026-05", type: "expense" },
  { id: 2, description: "Wedding Cake Order", category: "Sales", amount: 850.00, date: "May 7", month: "2026-05", type: "income" },
  { id: 3, description: "Instagram Ads", category: "Marketing", amount: 75.00, date: "May 7", month: "2026-05", type: "expense" },
  { id: 4, description: "Catering Event", category: "Sales", amount: 1200.00, date: "May 6", month: "2026-05", type: "income" },
  { id: 5, description: "Utility Bill", category: "Utilities", amount: 140.00, date: "May 5", month: "2026-05", type: "expense" },
  { id: 6, description: "Baking Class", category: "Sales", amount: 320.00, date: "May 4", month: "2026-05", type: "income" },
  { id: 7, description: "Packaging Supplies", category: "Supplies", amount: 89.00, date: "May 3", month: "2026-05", type: "expense" },
  { id: 8, description: "Monthly Rent", category: "Rent", amount: 1200.00, date: "May 1", month: "2026-05", type: "expense" },
  { id: 9, description: "Walk-in Sales", category: "Sales", amount: 640.00, date: "May 2", month: "2026-05", type: "income" },
  { id: 10, description: "Decorating Supplies", category: "Supplies", amount: 156.50, date: "Apr 28", month: "2026-04", type: "expense" },
  { id: 11, description: "Event Catering", category: "Sales", amount: 980.00, date: "Apr 25", month: "2026-04", type: "income" },
  { id: 12, description: "Rent April", category: "Rent", amount: 1200.00, date: "Apr 1", month: "2026-04", type: "expense" },
  { id: 13, description: "Custom Cake Orders", category: "Sales", amount: 1420.00, date: "Apr 15", month: "2026-04", type: "income" },
  { id: 14, description: "Marketing Campaign", category: "Marketing", amount: 120.00, date: "Apr 10", month: "2026-04", type: "expense" },
  { id: 15, description: "Utility Bill", category: "Utilities", amount: 135.00, date: "Apr 5", month: "2026-04", type: "expense" },
];

const SEED_BUDGETS: Budget[] = [
  { category: "Supplies", total: 1000, color: "#7b2fff" },
  { category: "Marketing", total: 500, color: "#10b981" },
  { category: "Utilities", total: 350, color: "#f59e0b" },
  { category: "Rent", total: 1200, color: "#8b5cf6" },
];

const CATEGORIES = ["Sales", "Supplies", "Marketing", "Utilities", "Rent", "Other"];
const BUDGET_CATEGORIES = ["Supplies", "Marketing", "Utilities", "Rent", "Other"];
const MONTH_LABELS: Record<string, string> = {
  "2026-01": "Jan", "2026-02": "Feb", "2026-03": "Mar",
  "2026-04": "Apr", "2026-05": "May",
};

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TOOLTIP_STYLE = {
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: "12px",
  color: "#1d1d1f",
};

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [budgets, setBudgets] = useState<Budget[]>(SEED_BUDGETS);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "budgets">("overview");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ type: "expense" as TransactionType, description: "", category: "Supplies", amount: "" });
  const [entryError, setEntryError] = useState("");

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetForm, setBudgetForm] = useState({ category: "Supplies", total: "" });

  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  const currentMonth = "2026-05";
  const thisMonthTxns = useMemo(() => transactions.filter((t) => t.month === currentMonth), [transactions]);
  const totalIncome = useMemo(() => thisMonthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0), [thisMonthTxns]);
  const totalExpenses = useMemo(() => thisMonthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0), [thisMonthTxns]);
  const netProfit = totalIncome - totalExpenses;

  const monthlyData = useMemo(() => {
    const months = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"];
    const baselines: Record<string, { income: number; expenses: number }> = {
      "2026-01": { income: 3100, expenses: 1900 },
      "2026-02": { income: 4200, expenses: 2200 },
      "2026-03": { income: 3900, expenses: 2000 },
    };
    return months.map((m) => {
      const txns = transactions.filter((t) => t.month === m);
      if (txns.length === 0 && baselines[m]) return { month: MONTH_LABELS[m] ?? m, ...baselines[m] };
      const income = txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expenses = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { month: MONTH_LABELS[m] ?? m, income: Math.round(income), expenses: Math.round(expenses) };
    });
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const COLORS: Record<string, string> = { Supplies: "#7b2fff", Marketing: "#10b981", Utilities: "#f59e0b", Rent: "#8b5cf6", Other: "#38bdf8" };
    const map: Record<string, number> = {};
    thisMonthTxns.filter((t) => t.type === "expense").forEach((t) => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value), color: COLORS[name] ?? "#38bdf8" }));
  }, [thisMonthTxns]);

  const budgetUsed = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthTxns.filter((t) => t.type === "expense").forEach((t) => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return map;
  }, [thisMonthTxns]);

  const filteredTxns = useMemo(
    () => filterType === "all" ? transactions : transactions.filter((t) => t.type === filterType),
    [transactions, filterType]
  );

  const addTransaction = () => {
    const amt = parseFloat(newEntry.amount);
    if (!newEntry.description.trim()) { setEntryError("Description is required."); return; }
    if (isNaN(amt) || amt <= 0) { setEntryError("Enter a valid amount greater than 0."); return; }
    setEntryError("");
    const next: Transaction = { id: Date.now(), description: newEntry.description.trim(), category: newEntry.category, amount: amt, date: todayLabel(), month: currentMonth, type: newEntry.type };
    setTransactions((prev) => [next, ...prev]);
    setNewEntry({ type: "expense", description: "", category: "Supplies", amount: "" });
    setShowAddModal(false);
  };

  const deleteTransaction = (id: number) => setTransactions((prev) => prev.filter((t) => t.id !== id));

  const saveBudget = () => {
    const total = parseFloat(budgetForm.total);
    if (isNaN(total) || total <= 0) return;
    const COLORS: Record<string, string> = { Supplies: "#7b2fff", Marketing: "#10b981", Utilities: "#f59e0b", Rent: "#8b5cf6", Other: "#38bdf8" };
    setBudgets((prev) => {
      const existing = prev.find((b) => b.category === budgetForm.category);
      if (existing) return prev.map((b) => b.category === budgetForm.category ? { ...b, total } : b);
      return [...prev, { category: budgetForm.category, total, color: COLORS[budgetForm.category] ?? "#38bdf8" }];
    });
    setShowBudgetModal(false);
    setBudgetForm({ category: "Supplies", total: "" });
    setEditingBudget(null);
  };

  const openEditBudget = (b: Budget) => {
    setEditingBudget(b);
    setBudgetForm({ category: b.category, total: String(b.total) });
    setShowBudgetModal(true);
  };

  const summaryCards = [
    { label: "Total Income", value: `$${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Total Expenses", value: `$${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Net Profit", value: `$${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: netProfit >= 0 ? ArrowUpRight : ArrowDownRight, color: netProfit >= 0 ? "text-primary" : "text-red-500", bg: netProfit >= 0 ? "bg-primary/10" : "bg-red-500/10", border: netProfit >= 0 ? "border-primary/20" : "border-red-500/20" },
  ];

  const inputCls = "w-full bg-black/4 dark:bg-white/6 border border-black/10 dark:border-white/10 focus:border-primary/50 rounded-xl px-4 py-2.5 text-[#1d1d1f] dark:text-white text-sm placeholder:text-black/35 dark:placeholder:text-white/35 outline-none transition-colors";

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader title="Finance & Budgeting" subtitle="Track your income, expenses, and budgets" />

      <main className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summaryCards.map((s, i) => (
            <TiltCard key={s.label} intensity={4}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-2xl border ${s.border} glass-card p-5 h-full`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon size={18} className={s.color} />
                  </div>
                  <span className={`text-xs font-medium ${s.color}`}>May 2026</span>
                </div>
                <p className="text-2xl font-bold text-[#1d1d1f] dark:text-white">{s.value}</p>
                <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">{s.label}</p>
              </motion.div>
            </TiltCard>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/8 dark:border-white/8 w-fit backdrop-blur-sm">
          {(["overview", "transactions", "budgets"] as const).map((tab) => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-primary text-white shadow-sm" : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"}`}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6">
                <h3 className="font-semibold text-[#1d1d1f] dark:text-white mb-1">Income vs Expenses</h3>
                <p className="text-xs text-black/40 dark:text-white/40 mb-5">Monthly totals — updates as you add transactions</p>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6">
                <h3 className="font-semibold text-[#1d1d1f] dark:text-white mb-1">Expense Breakdown</h3>
                <p className="text-xs text-black/40 dark:text-white/40 mb-4">By category · May 2026</p>
                {expenseByCategory.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-black/35 dark:text-white/35 text-sm">No expenses yet</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={48} outerRadius={75} dataKey="value" paddingAngle={3}>
                          {expenseByCategory.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`$${Number(v).toFixed(2)}`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {expenseByCategory.map((c) => (
                        <div key={c.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                            <span className="text-black/50 dark:text-white/50">{c.name}</span>
                          </div>
                          <span className="text-[#1d1d1f] dark:text-white font-medium">${c.value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* TRANSACTIONS */}
          {activeTab === "transactions" && (
            <motion.div key="transactions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="rounded-2xl border border-black/8 dark:border-white/8 glass-card overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-black/8 dark:border-white/8 flex-wrap gap-3">
                <h3 className="font-semibold text-[#1d1d1f] dark:text-white">All Transactions ({filteredTxns.length})</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 p-0.5 bg-black/5 dark:bg-white/5 rounded-lg border border-black/8 dark:border-white/8">
                    {(["all", "income", "expense"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilterType(f)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all ${filterType === f ? "bg-primary text-white" : "text-black/45 dark:text-white/45 hover:text-black dark:hover:text-white"}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/8 dark:border-white/8 text-xs text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:border-primary/25 transition-all">
                    <Download size={12} /> Export
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold shadow-[0_0_16px_rgba(123,47,255,0.3)] hover:bg-primary/90 transition-all"
                  >
                    <Plus size={12} /> Add Entry
                  </motion.button>
                </div>
              </div>

              {filteredTxns.length === 0 ? (
                <div className="py-16 text-center text-black/35 dark:text-white/35 text-sm">No transactions found. Add one above.</div>
              ) : (
                <div className="divide-y divide-black/5 dark:divide-white/5 max-h-[480px] overflow-y-auto">
                  {filteredTxns.map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-black/3 dark:hover:bg-white/3 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.type === "income" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                          {t.type === "income" ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownRight size={14} className="text-red-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1d1d1f] dark:text-white">{t.description}</p>
                          <p className="text-xs text-black/40 dark:text-white/40">{t.category} · {t.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className={`text-sm font-semibold ${t.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                          {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                        </p>
                        <motion.button
                          initial={{ opacity: 0 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteTransaction(t.id)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-black/30 dark:text-white/30 hover:text-red-500 transition-all"
                        >
                          <X size={12} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* BUDGETS */}
          {activeTab === "budgets" && (
            <motion.div key="budgets" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-[#1d1d1f] dark:text-white">May 2026 Budget</h3>
                    <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">Click pencil to edit category limits</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { setEditingBudget(null); setBudgetForm({ category: "Supplies", total: "" }); setShowBudgetModal(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold shadow-[0_0_16px_rgba(123,47,255,0.3)]"
                  >
                    <Plus size={12} /> Add Budget
                  </motion.button>
                </div>

                {budgets.length === 0 ? (
                  <p className="text-center text-black/35 dark:text-white/35 text-sm py-10">No budgets set. Add one above.</p>
                ) : (
                  <div className="space-y-5">
                    {budgets.map((b) => {
                      const used = budgetUsed[b.category] ?? 0;
                      const pct = b.total > 0 ? Math.round((used / b.total) * 100) : 0;
                      const barColor = pct >= 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : b.color;
                      return (
                        <div key={b.category}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
                              <span className="text-sm font-medium text-[#1d1d1f] dark:text-white">{b.category}</span>
                              <button onClick={() => openEditBudget(b)} className="w-5 h-5 rounded flex items-center justify-center text-black/30 dark:text-white/30 hover:text-primary transition-colors">
                                <Pencil size={11} />
                              </button>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-[#1d1d1f] dark:text-white">${used.toFixed(2)}</span>
                              <span className="text-xs text-black/40 dark:text-white/40"> / ${b.total.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="h-2.5 bg-black/8 dark:bg-white/8 rounded-full overflow-hidden">
                            <motion.div
                              key={`${b.category}-${used}-${b.total}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(pct, 100)}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ background: barColor }}
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-black/35 dark:text-white/35">{pct}% used</span>
                            {pct >= 100 && <span className="text-[10px] text-red-500 font-medium">Budget exceeded!</span>}
                            {pct >= 80 && pct < 100 && <span className="text-[10px] text-amber-500 font-medium">Approaching limit</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6">
                <h3 className="font-semibold text-[#1d1d1f] dark:text-white mb-1">Spending by Category</h3>
                <p className="text-xs text-black/40 dark:text-white/40 mb-5">May 2026 — live from your transactions</p>
                {expenseByCategory.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-black/35 dark:text-white/35 text-sm">No expense data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={expenseByCategory} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`$${Number(v).toFixed(2)}`, "Spent"]} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Amount">
                        {expenseByCategory.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border-2 border-dashed border-black/12 dark:border-white/12 hover:border-primary/35 transition-all p-8 text-center group cursor-pointer backdrop-blur-sm"
        >
          <Upload size={28} className="text-black/30 dark:text-white/30 group-hover:text-primary mx-auto mb-3 transition-colors" />
          <p className="font-medium text-black/55 dark:text-white/55 group-hover:text-[#1d1d1f] dark:group-hover:text-white transition-colors">Upload Receipt or Bank Statement</p>
          <p className="text-sm text-black/40 dark:text-white/40 mt-1">Watson AI will extract and categorize transactions automatically</p>
          <p className="text-xs text-black/30 dark:text-white/30 mt-2">CSV, PDF, or Image — up to 10MB</p>
        </motion.div>
      </main>

      {/* ADD TRANSACTION MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
            >
              <div className="glass-strong dark:glass border border-black/10 dark:border-white/12 rounded-2xl p-6 shadow-[0_32px_80px_rgba(0,0,0,0.25)]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">Add Transaction</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-black/35 dark:text-white/35 hover:text-black dark:hover:text-white transition-colors"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {(["income", "expense"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setNewEntry({ ...newEntry, type: t })}
                        className={`py-2 rounded-xl text-sm font-medium capitalize border transition-all ${newEntry.type === t
                          ? t === "income" ? "bg-emerald-500/12 border-emerald-500/35 text-emerald-500" : "bg-red-500/12 border-red-500/35 text-red-500"
                          : "bg-black/4 dark:bg-white/4 border-black/8 dark:border-white/8 text-black/50 dark:text-white/50 hover:border-primary/20"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <input placeholder="Description *" value={newEntry.description} onChange={(e) => { setNewEntry({ ...newEntry, description: e.target.value }); setEntryError(""); }} className={inputCls} />
                  <input placeholder="Amount (e.g. 234.50) *" value={newEntry.amount} onChange={(e) => { setNewEntry({ ...newEntry, amount: e.target.value }); setEntryError(""); }} type="number" min="0" step="0.01" className={inputCls} />
                  <select value={newEntry.category} onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })} className={inputCls}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {entryError && <p className="text-xs text-red-500">{entryError}</p>}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-black/50 dark:text-white/50 text-sm hover:text-black dark:hover:text-white transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={addTransaction} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(123,47,255,0.35)]">
                    <Check size={14} /> Add Entry
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* BUDGET MODAL */}
      <AnimatePresence>
        {showBudgetModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBudgetModal(false)} className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4"
            >
              <div className="glass-strong dark:glass border border-black/10 dark:border-white/12 rounded-2xl p-6 shadow-[0_32px_80px_rgba(0,0,0,0.25)]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">{editingBudget ? `Edit ${editingBudget.category} Budget` : "Set Budget"}</h3>
                  <button onClick={() => setShowBudgetModal(false)} className="text-black/35 dark:text-white/35 hover:text-black dark:hover:text-white transition-colors"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  {!editingBudget && (
                    <select value={budgetForm.category} onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })} className={inputCls}>
                      {BUDGET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  )}
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35 dark:text-white/35 text-sm">$</span>
                    <input placeholder="Monthly limit" value={budgetForm.total} onChange={(e) => setBudgetForm({ ...budgetForm, total: e.target.value })} type="number" min="0" step="1" className={`${inputCls} pl-8`} />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowBudgetModal(false)} className="flex-1 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-black/50 dark:text-white/50 text-sm hover:text-black dark:hover:text-white transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={saveBudget} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(123,47,255,0.35)]">
                    <Check size={14} /> Save Budget
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
