"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHeader } from "@/components/DashboardHeader";
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
  Sparkles,
  Loader2,
  CloudOff,
  Cloud,
  FileText,
  BarChart2,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ScanLine,
  Camera,
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
import type { AnalyticResult } from "@/app/api/finance/analytics/route";
import type { Insight } from "@/app/api/finance/insights/route";
import ReceiptScanner, { type ScannedTransaction } from "@/components/ReceiptScanner";

// ── Types ──────────────────────────────────────────────────────────────────

type TransactionType = "income" | "expense";

interface Transaction {
  id: string;
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

interface ReviewRow {
  description: string;
  amount: number;
  date: string;
  category: string;
  type: TransactionType;
  categorizing: boolean;
  source: "watsonx" | "fallback" | "pending";
}

// ── Constants ──────────────────────────────────────────────────────────────

const CATEGORIES = ["Sales", "Supplies", "Marketing", "Utilities", "Rent", "Payroll", "Insurance", "Equipment", "Other"];
const BUDGET_CATEGORIES = ["Supplies", "Marketing", "Utilities", "Rent", "Payroll", "Insurance", "Equipment", "Other"];

const CAT_COLORS: Record<string, string> = {
  Supplies: "#0062ff", Marketing: "#10b981", Utilities: "#f59e0b",
  Rent: "#8b5cf6", Payroll: "#ec4899", Insurance: "#14b8a6",
  Equipment: "#f97316", Other: "#38bdf8", Sales: "#22d3ee",
};

// ── CSV helpers ────────────────────────────────────────────────────────────

function parseCsvRows(text: string): Array<{ description: string; amount: number; date: string }> {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const cols = lines[0].toLowerCase().split(",").map((c) => c.trim().replace(/"/g, ""));
  const descIdx = cols.findIndex((c) => c.includes("description") || c.includes("memo") || c.includes("details") || c.includes("narration"));
  const amtIdx = cols.findIndex((c) => c.includes("amount") || c.includes("debit") || c.includes("credit"));
  const dateIdx = cols.findIndex((c) => c.includes("date"));
  if (descIdx === -1 || amtIdx === -1) return [];
  return lines.slice(1)
    .map((line) => {
      const cells = line.split(",").map((c) => c.trim().replace(/"/g, ""));
      const description = cells[descIdx] ?? "";
      const amount = Math.abs(parseFloat((cells[amtIdx] ?? "0").replace(/[^0-9.\-]/g, "")) || 0);
      const date = dateIdx >= 0 ? (cells[dateIdx] ?? todayLabel()) : todayLabel();
      return { description, amount, date };
    })
    .filter((r) => r.description && r.amount > 0);
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function monthLabel(key: string): string {
  const m = parseInt(key.split("-")[1] ?? "1");
  return ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m] ?? key;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [persisted, setPersisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "budgets" | "analytics">("overview");

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ type: "expense" as TransactionType, description: "", category: "Supplies", amount: "" });
  const [entryError, setEntryError] = useState("");
  const [addingTxn, setAddingTxn] = useState(false);
  const [aiCategorizing, setAiCategorizing] = useState(false);
  const [aiSource, setAiSource] = useState<"watsonx" | "fallback" | null>(null);

  // Budget modal
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetForm, setBudgetForm] = useState({ category: "Supplies", total: "" });
  const [savingBudget, setSavingBudget] = useState(false);

  // Upload review modal (spec: "User reviews, confirms, or edits categorizations before saving")
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reviewRows, setReviewRows] = useState<ReviewRow[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [importingRows, setImportingRows] = useState(false);
  const [importDone, setImportDone] = useState(false);

  // Receipt scanner
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);

  // Month-end report (spec: "End-of-month summary report auto-generated")
  const [report, setReport] = useState<string | null>(null);
  const [reportSource, setReportSource] = useState<string>("");
  const [reportLoading, setReportLoading] = useState(false);

  // Budget insights (spec: "watsonx.ai — suggests budget insights")
  const [insights, setInsights] = useState<Insight[]>([]);
  const [insightsSource, setInsightsSource] = useState<string>("");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  // Analytics (spec: IBM Cloud SQL Query)
  const [analytics, setAnalytics] = useState<AnalyticResult[]>([]);
  const [analyticsSource, setAnalyticsSource] = useState<string>("");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [expandedSql, setExpandedSql] = useState<number | null>(null);

  // Filter
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  // ── Load ───────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [txnRes, budgetRes] = await Promise.all([
        fetch("/api/finance/transactions"),
        fetch("/api/finance/budgets"),
      ]);
      if (txnRes.ok) {
        const data = (await txnRes.json()) as {
          transactions: Array<{ _id: string; description: string; category: string; amount: number; date: string; month: string; transactionType: TransactionType }>;
          persisted: boolean;
        };
        setTransactions(data.transactions.map((t) => ({
          id: t._id, description: t.description, category: t.category,
          amount: t.amount, date: t.date, month: t.month, type: t.transactionType,
        })));
        setPersisted(data.persisted);
      }
      if (budgetRes.ok) {
        const data = (await budgetRes.json()) as { budgets: Budget[] };
        setBudgets(data.budgets);
      }
    } catch (err) {
      console.error("Load finance data error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const currentMonth = currentMonthKey();
  const currentMonthDisplay = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const thisMonthTxns = useMemo(() => transactions.filter((t) => t.month === currentMonth), [transactions, currentMonth]);
  const totalIncome = useMemo(() => thisMonthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0), [thisMonthTxns]);
  const totalExpenses = useMemo(() => thisMonthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0), [thisMonthTxns]);
  const netProfit = totalIncome - totalExpenses;

  const allMonths = useMemo(() => {
    const set = new Set(transactions.map((t) => t.month));
    set.add(currentMonth);
    return Array.from(set).sort();
  }, [transactions, currentMonth]);

  const monthlyData = useMemo(() => allMonths.map((m) => {
    const txns = transactions.filter((t) => t.month === m);
    return {
      month: monthLabel(m),
      income: Math.round(txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)),
      expenses: Math.round(txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)),
    };
  }), [transactions, allMonths]);

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthTxns.filter((t) => t.type === "expense").forEach((t) => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value), color: CAT_COLORS[name] ?? "#38bdf8" })).sort((a, b) => b.value - a.value);
  }, [thisMonthTxns]);

  const budgetUsed = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthTxns.filter((t) => t.type === "expense").forEach((t) => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return map;
  }, [thisMonthTxns]);

  const filteredTxns = useMemo(() =>
    filterType === "all" ? transactions : transactions.filter((t) => t.type === filterType),
    [transactions, filterType]
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  const aiCategorize = async (description: string, amount?: number) => {
    setAiCategorizing(true);
    setAiSource(null);
    try {
      const res = await fetch("/api/finance/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount: parseFloat(newEntry.amount) || amount }),
      });
      if (res.ok) {
        const data = (await res.json()) as { category: string; transactionType: TransactionType; source: "watsonx" | "fallback" };
        setNewEntry((prev) => ({ ...prev, category: data.category, type: data.transactionType }));
        setAiSource(data.source);
      }
    } finally {
      setAiCategorizing(false);
    }
  };

  const addTransaction = async () => {
    const amt = parseFloat(newEntry.amount);
    if (!newEntry.description.trim()) { setEntryError("Description is required."); return; }
    if (isNaN(amt) || amt <= 0) { setEntryError("Enter a valid amount greater than 0."); return; }
    setEntryError("");
    setAddingTxn(true);
    try {
      const res = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: newEntry.description.trim(), category: newEntry.category, amount: amt, transactionType: newEntry.type, month: currentMonth }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { transaction: { _id: string; description: string; category: string; amount: number; date: string; month: string; transactionType: TransactionType } };
      const t = data.transaction;
      setTransactions((prev) => [{ id: t._id, description: t.description, category: t.category, amount: t.amount, date: t.date, month: t.month, type: t.transactionType }, ...prev]);
      setNewEntry({ type: "expense", description: "", category: "Supplies", amount: "" });
      setAiSource(null);
      setShowAddModal(false);
    } catch {
      setEntryError("Failed to save. Please try again.");
    } finally {
      setAddingTxn(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/finance/transactions/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => loadData());
  };

  const handleReceiptConfirm = async (scanned: ScannedTransaction) => {
    setShowReceiptScanner(false);
    try {
      const res = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: scanned.description,
          category: scanned.category,
          amount: scanned.amount,
          transactionType: scanned.transactionType,
          date: scanned.date,
          month: currentMonth,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          transaction: { _id: string; description: string; category: string; amount: number; date: string; month: string; transactionType: TransactionType };
        };
        const t = data.transaction;
        setTransactions((prev) => [
          { id: t._id, description: t.description, category: t.category, amount: t.amount, date: t.date, month: t.month, type: t.transactionType },
          ...prev,
        ]);
      }
    } catch {
      // silently fail — user still sees their data in the list if it saved
    }
  };

  const saveBudget = async () => {
    const total = parseFloat(budgetForm.total);
    if (isNaN(total) || total <= 0) return;
    setSavingBudget(true);
    try {
      const res = await fetch("/api/finance/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: budgetForm.category, total, color: CAT_COLORS[budgetForm.category] }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { budget: Budget };
      setBudgets((prev) => [...prev.filter((b) => b.category !== data.budget.category), data.budget].sort((a, b) => a.category.localeCompare(b.category)));
      setShowBudgetModal(false);
      setBudgetForm({ category: "Supplies", total: "" });
      setEditingBudget(null);
    } finally {
      setSavingBudget(false);
    }
  };

  const deleteBudget = async (category: string) => {
    setBudgets((prev) => prev.filter((b) => b.category !== category));
    await fetch(`/api/finance/budgets/${encodeURIComponent(category)}`, { method: "DELETE" }).catch(() => loadData());
  };

  const exportCsv = () => {
    const header = "Date,Description,Category,Type,Amount\n";
    const rows = filteredTxns.map((t) => `${t.date},"${t.description}",${t.category},${t.type},${t.amount.toFixed(2)}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smallbox-finance-${currentMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Upload review flow ─────────────────────────────────────────────────────
  // Spec: "User reviews, confirms, or edits categorizations before saving"

  const handleFileUpload = async (file: File) => {
    const text = await file.text();
    const parsed = parseCsvRows(text);
    if (parsed.length === 0) return;

    // Initialise rows with "pending" state
    const initial: ReviewRow[] = parsed.map((r) => ({
      ...r, category: "Other", type: "expense", categorizing: true, source: "pending",
    }));
    setReviewRows(initial);
    setShowReviewModal(true);
    setImportDone(false);

    // Single batch call for all rows — saves N-1 watsonx.ai credits on free tier
    try {
      const res = await fetch("/api/finance/categorize-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parsed.map((r) => ({ description: r.description, amount: r.amount })) }),
      });
      if (res.ok) {
        const data = (await res.json()) as { results: Array<{ category: string; transactionType: TransactionType; source: "watsonx" | "fallback" }> };
        setReviewRows(
          parsed.map((r, i) => ({
            ...r,
            category: data.results[i]?.category ?? "Other",
            type: data.results[i]?.transactionType ?? "expense",
            categorizing: false,
            source: data.results[i]?.source ?? "fallback",
          })),
        );
      } else {
        setReviewRows((prev) => prev.map((row) => ({ ...row, categorizing: false, source: "fallback" })));
      }
    } catch {
      setReviewRows((prev) => prev.map((row) => ({ ...row, categorizing: false, source: "fallback" })));
    }
  };

  const confirmImport = async () => {
    setImportingRows(true);
    for (const row of reviewRows) {
      try {
        const res = await fetch("/api/finance/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: row.description, category: row.category, amount: row.amount, transactionType: row.type, date: row.date, month: currentMonth }),
        });
        if (res.ok) {
          const data = (await res.json()) as { transaction: { _id: string; description: string; category: string; amount: number; date: string; month: string; transactionType: TransactionType } };
          const t = data.transaction;
          setTransactions((prev) => [{ id: t._id, description: t.description, category: t.category, amount: t.amount, date: t.date, month: t.month, type: t.transactionType }, ...prev]);
        }
      } catch {
        // continue importing remaining rows
      }
    }
    setImportingRows(false);
    setImportDone(true);
  };

  // ── Report (spec: end-of-month summary auto-generated) ────────────────────

  const generateReport = async () => {
    setReportLoading(true);
    setReport(null);
    try {
      const res = await fetch("/api/finance/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: currentMonth,
          transactions: transactions.map((t) => ({ description: t.description, category: t.category, amount: t.amount, transactionType: t.type })),
          budgets: budgets.map((b) => ({ category: b.category, total: b.total })),
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { report: string; source: string; powered_by?: string };
        setReport(data.report);
        setReportSource(data.powered_by ?? data.source);
      }
    } finally {
      setReportLoading(false);
    }
  };

  // ── Budget insights ────────────────────────────────────────────────────────

  const fetchInsights = async () => {
    setInsightsLoading(true);
    setInsights([]);
    setShowInsights(true);
    try {
      const res = await fetch("/api/finance/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: currentMonth,
          transactions: transactions.map((t) => ({ category: t.category, amount: t.amount, transactionType: t.type })),
          budgets: budgets.map((b) => ({ category: b.category, total: b.total })),
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { insights: Insight[]; source: string; powered_by?: string };
        setInsights(data.insights);
        setInsightsSource(data.powered_by ?? data.source);
      }
    } finally {
      setInsightsLoading(false);
    }
  };

  // ── Analytics (IBM SQL Query) ─────────────────────────────────────────────

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalytics([]);
    try {
      const res = await fetch("/api/finance/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: transactions.map((t) => ({ description: t.description, category: t.category, amount: t.amount, date: t.date, month: t.month, transactionType: t.type })),
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { results: AnalyticResult[]; source: string; powered_by: string };
        setAnalytics(data.results);
        setAnalyticsSource(data.powered_by);
      }
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "analytics" && analytics.length === 0 && !analyticsLoading) {
      void fetchAnalytics();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader title="Finance & Budgeting" subtitle="Track income, expenses & budgets — stored in IBM Cloudant, analysed by IBM SQL Query" />

      <main className="flex-1 p-6 space-y-6">
        {/* Storage badge */}
        <div className="flex items-center gap-2 text-xs">
          {persisted
            ? <><Cloud size={13} className="text-[#10b981]" /><span className="text-[#10b981]">Syncing to IBM Cloudant</span></>
            : <><CloudOff size={13} className="text-[#f59e0b]" /><span className="text-[#f59e0b]">In-memory — add CLOUDANT_URL to persist</span></>}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#4b5e7a]">
            <Loader2 size={24} className="animate-spin mr-3" />
            <span className="text-sm">Loading your financial data…</span>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Income", value: `$${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-[#10b981]", bg: "bg-[#10b981]/10", border: "border-[#10b981]/20" },
                { label: "Total Expenses", value: `$${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingDown, color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", border: "border-[#ef4444]/20" },
                { label: "Net Profit", value: `$${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: netProfit >= 0 ? ArrowUpRight : ArrowDownRight, color: netProfit >= 0 ? "text-[#0062ff]" : "text-[#ef4444]", bg: netProfit >= 0 ? "bg-[#0062ff]/10" : "bg-[#ef4444]/10", border: netProfit >= 0 ? "border-[#0062ff]/20" : "border-[#ef4444]/20" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }} className={`rounded-2xl border ${s.border} bg-[#111827] p-5`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                      <s.icon size={18} className={s.color} />
                    </div>
                    <span className={`text-xs font-medium ${s.color}`}>{currentMonthDisplay}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-[#4b5e7a] mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#111827] rounded-xl border border-[#2a3a55] w-fit flex-wrap">
              {(["overview", "transactions", "budgets", "analytics"] as const).map((tab) => (
                <motion.button key={tab} whileTap={{ scale: 0.96 }} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-[#0062ff] text-white" : "text-[#8b9cb6] hover:text-white"}`}>
                  {tab === "analytics" ? "📊 Analytics" : tab}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ── OVERVIEW ── */}
              {activeTab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 rounded-2xl border border-[#2a3a55] bg-[#111827] p-6">
                      <h3 className="font-semibold text-white mb-1">Income vs Expenses</h3>
                      <p className="text-xs text-[#4b5e7a] mb-5">Monthly totals — updates as you add transactions</p>
                      {monthlyData.length === 0 ? (
                        <div className="flex items-center justify-center h-60 text-[#4b5e7a] text-sm">Add transactions to see the trend</div>
                      ) : (
                        <ResponsiveContainer width="100%" height={240}>
                          <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                            <defs>
                              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a3a55" />
                            <XAxis dataKey="month" tick={{ fill: "#4b5e7a", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#4b5e7a", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: "#1a2235", border: "1px solid #2a3a55", borderRadius: "12px", color: "#fff" }} />
                            <Legend wrapperStyle={{ color: "#8b9cb6", fontSize: 12 }} />
                            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
                            <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[#2a3a55] bg-[#111827] p-6">
                      <h3 className="font-semibold text-white mb-1">Expense Breakdown</h3>
                      <p className="text-xs text-[#4b5e7a] mb-4">By category · {currentMonthDisplay}</p>
                      {expenseByCategory.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-[#4b5e7a] text-sm">No expenses yet</div>
                      ) : (
                        <>
                          <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                              <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={48} outerRadius={75} dataKey="value" paddingAngle={3}>
                                {expenseByCategory.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                              </Pie>
                              <Tooltip contentStyle={{ background: "#1a2235", border: "1px solid #2a3a55", borderRadius: "12px", color: "#fff" }} formatter={(v) => [`$${Number(v).toFixed(2)}`, ""]} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="space-y-2 mt-2">
                            {expenseByCategory.map((c) => (
                              <div key={c.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                                  <span className="text-[#8b9cb6]">{c.name}</span>
                                </div>
                                <span className="text-white font-medium">${c.value.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Month-end report (spec: "End-of-month summary report auto-generated") */}
                  <div className="rounded-2xl border border-[#2a3a55] bg-[#111827] p-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          <FileText size={16} className="text-[#0062ff]" />
                          Monthly Summary Report
                        </h3>
                        <p className="text-xs text-[#4b5e7a] mt-0.5">AI-generated business summary · Powered by watsonx.ai</p>
                      </div>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={generateReport} disabled={reportLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0062ff] text-white text-xs font-semibold disabled:opacity-60">
                        {reportLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        {reportLoading ? "Generating…" : "Generate Report"}
                      </motion.button>
                    </div>
                    {report ? (
                      <div className="mt-4 rounded-xl bg-[#1a2235] border border-[#2a3a55] p-4">
                        <p className="text-sm text-[#c8d8f0] leading-relaxed">{report}</p>
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#4b5e7a]">
                          <Sparkles size={9} className="text-[#0062ff]" />
                          {reportSource}
                        </div>
                      </div>
                    ) : !reportLoading ? (
                      <p className="text-xs text-[#4b5e7a] mt-4">Click "Generate Report" to get a plain-language AI summary of this month's performance.</p>
                    ) : null}
                  </div>
                </motion.div>
              )}

              {/* ── TRANSACTIONS ── */}
              {activeTab === "transactions" && (
                <motion.div key="transactions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="rounded-2xl border border-[#2a3a55] bg-[#111827] overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-[#2a3a55] flex-wrap gap-3">
                    <h3 className="font-semibold text-white">All Transactions ({filteredTxns.length})</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 p-0.5 bg-[#1a2235] rounded-lg border border-[#2a3a55]">
                        {(["all", "income", "expense"] as const).map((f) => (
                          <button key={f} onClick={() => setFilterType(f)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all ${filterType === f ? "bg-[#0062ff] text-white" : "text-[#8b9cb6] hover:text-white"}`}>
                            {f}
                          </button>
                        ))}
                      </div>
                      <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a3a55] text-xs text-[#8b9cb6] hover:text-white hover:border-[#0062ff]/30 transition-all">
                        <Download size={12} /> Export CSV
                      </button>
                      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0062ff] text-white text-xs font-semibold">
                        <Plus size={12} /> Add Entry
                      </motion.button>
                    </div>
                  </div>
                  {filteredTxns.length === 0 ? (
                    <div className="py-16 text-center text-[#4b5e7a] text-sm">No transactions yet. Add one or upload a bank statement below.</div>
                  ) : (
                    <div className="divide-y divide-[#2a3a55]/50 max-h-[480px] overflow-y-auto">
                      {filteredTxns.map((t, i) => (
                        <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 15) * 0.03 }}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-[#1a2235] transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === "income" ? "bg-[#10b981]/10" : "bg-[#ef4444]/10"}`}>
                              {t.type === "income" ? <ArrowUpRight size={14} className="text-[#10b981]" /> : <ArrowDownRight size={14} className="text-[#ef4444]" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{t.description}</p>
                              <p className="text-xs text-[#4b5e7a]">{t.category} · {t.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className={`text-sm font-semibold ${t.type === "income" ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                              {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                            </p>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => deleteTransaction(t.id)}
                              className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-[#ef4444]/10 flex items-center justify-center text-[#4b5e7a] hover:text-[#ef4444] transition-all">
                              <X size={12} />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── BUDGETS ── */}
              {activeTab === "budgets" && (
                <motion.div key="budgets" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-[#2a3a55] bg-[#111827] p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="font-semibold text-white">{currentMonthDisplay} Budget</h3>
                          <p className="text-xs text-[#4b5e7a] mt-0.5">Click pencil to edit a limit</p>
                        </div>
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          onClick={() => { setEditingBudget(null); setBudgetForm({ category: "Supplies", total: "" }); setShowBudgetModal(true); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0062ff] text-white text-xs font-semibold">
                          <Plus size={12} /> Add Budget
                        </motion.button>
                      </div>
                      {budgets.length === 0 ? (
                        <p className="text-center text-[#4b5e7a] text-sm py-10">No budgets set yet. Add one above.</p>
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
                                    <span className="text-sm font-medium text-white">{b.category}</span>
                                    <button onClick={() => { setEditingBudget(b); setBudgetForm({ category: b.category, total: String(b.total) }); setShowBudgetModal(true); }} className="w-5 h-5 rounded flex items-center justify-center text-[#4b5e7a] hover:text-[#0062ff] transition-colors"><Pencil size={11} /></button>
                                    <button onClick={() => deleteBudget(b.category)} className="w-5 h-5 rounded flex items-center justify-center text-[#4b5e7a] hover:text-[#ef4444] transition-colors"><X size={11} /></button>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-semibold text-white">${used.toFixed(2)}</span>
                                    <span className="text-xs text-[#4b5e7a]"> / ${b.total.toLocaleString()}</span>
                                  </div>
                                </div>
                                <div className="h-2.5 bg-[#2a3a55] rounded-full overflow-hidden">
                                  <motion.div key={`${b.category}-${used}`} initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full" style={{ background: barColor }} />
                                </div>
                                <div className="flex justify-between mt-1">
                                  <span className="text-[10px] text-[#4b5e7a]">{pct}% used</span>
                                  {pct >= 100 && <span className="text-[10px] text-[#ef4444] font-medium">Budget exceeded!</span>}
                                  {pct >= 80 && pct < 100 && <span className="text-[10px] text-[#f59e0b] font-medium">Approaching limit</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[#2a3a55] bg-[#111827] p-6">
                      <h3 className="font-semibold text-white mb-1">Spending by Category</h3>
                      <p className="text-xs text-[#4b5e7a] mb-5">{currentMonthDisplay} · live from your transactions</p>
                      {expenseByCategory.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-[#4b5e7a] text-sm">No expense data yet</div>
                      ) : (
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={expenseByCategory} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a3a55" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: "#4b5e7a", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#4b5e7a", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: "#1a2235", border: "1px solid #2a3a55", borderRadius: "12px", color: "#fff" }} formatter={(v) => [`$${Number(v).toFixed(2)}`, "Spent"]} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Amount">
                              {expenseByCategory.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Budget insights (spec: watsonx.ai budget insights) */}
                  <div className="rounded-2xl border border-[#2a3a55] bg-[#111827] p-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          <Lightbulb size={16} className="text-[#f59e0b]" />
                          AI Budget Insights
                        </h3>
                        <p className="text-xs text-[#4b5e7a] mt-0.5">Actionable recommendations · Powered by watsonx.ai</p>
                      </div>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={fetchInsights} disabled={insightsLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] text-xs font-semibold disabled:opacity-60">
                        {insightsLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        {insightsLoading ? "Thinking…" : "Get Insights"}
                      </motion.button>
                    </div>

                    {showInsights && (
                      <div className="mt-4 space-y-3">
                        {insightsLoading ? (
                          <div className="py-6 flex items-center justify-center gap-2 text-[#4b5e7a] text-sm">
                            <Loader2 size={16} className="animate-spin" /> Analysing your budget…
                          </div>
                        ) : insights.length === 0 ? (
                          <p className="text-sm text-[#4b5e7a]">No insights could be generated — try adding budgets and transactions first.</p>
                        ) : (
                          <>
                            {insights.map((ins, i) => (
                              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                className={`rounded-xl p-3 flex gap-3 ${ins.type === "warning" ? "bg-[#ef4444]/10 border border-[#ef4444]/20" : ins.type === "positive" ? "bg-[#10b981]/10 border border-[#10b981]/20" : "bg-[#0062ff]/10 border border-[#0062ff]/20"}`}>
                                <div className="mt-0.5">
                                  {ins.type === "warning" ? <AlertTriangle size={14} className="text-[#ef4444]" /> : ins.type === "positive" ? <TrendingUp size={14} className="text-[#10b981]" /> : <Lightbulb size={14} className="text-[#0062ff]" />}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white">{ins.title}</p>
                                  <p className="text-xs text-[#8b9cb6] mt-0.5 leading-relaxed">{ins.body}</p>
                                </div>
                              </motion.div>
                            ))}
                            <div className="flex items-center gap-1.5 text-[10px] text-[#4b5e7a] pt-1">
                              <Sparkles size={9} className="text-[#0062ff]" />
                              {insightsSource}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── ANALYTICS (IBM SQL Query) ── */}
              {activeTab === "analytics" && (
                <motion.div key="analytics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <BarChart2 size={16} className="text-[#0062ff]" /> Business Analytics
                      </h3>
                      <p className="text-xs text-[#4b5e7a] mt-0.5">Powered by IBM Cloud SQL Query · each card shows the underlying SQL</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={fetchAnalytics} disabled={analyticsLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a3a55] text-xs text-[#8b9cb6] hover:text-white hover:border-[#0062ff]/30 transition-all disabled:opacity-50">
                      {analyticsLoading ? <Loader2 size={12} className="animate-spin" /> : <BarChart2 size={12} />}
                      Refresh
                    </motion.button>
                  </div>

                  {analyticsLoading ? (
                    <div className="py-16 flex items-center justify-center gap-2 text-[#4b5e7a] text-sm">
                      <Loader2 size={20} className="animate-spin" /> Running analytics queries…
                    </div>
                  ) : analytics.length === 0 ? (
                    <div className="py-16 text-center text-[#4b5e7a] text-sm">No data yet — add some transactions to see analytics.</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {analytics.map((a, i) => (
                          <div key={i} className="rounded-2xl border border-[#2a3a55] bg-[#111827] p-5">
                            <p className="text-xs text-[#4b5e7a] uppercase tracking-wide mb-1">{a.label}</p>
                            <p className="text-lg font-bold text-white">{a.value}</p>
                            {a.detail && <p className="text-xs text-[#8b9cb6] mt-0.5">{a.detail}</p>}
                            <button onClick={() => setExpandedSql(expandedSql === i ? null : i)}
                              className="mt-3 flex items-center gap-1 text-[10px] text-[#4b5e7a] hover:text-[#0062ff] transition-colors">
                              {expandedSql === i ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                              {expandedSql === i ? "Hide" : "Show"} SQL
                            </button>
                            <AnimatePresence>
                              {expandedSql === i && (
                                <motion.pre initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                  className="mt-2 overflow-hidden text-[10px] text-[#4b5e7a] bg-[#1a2235] rounded-lg p-3 font-mono leading-relaxed whitespace-pre-wrap">
                                  {a.sql}
                                </motion.pre>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border border-[#2a3a55]/60 p-3 flex items-start gap-2 text-xs text-[#4b5e7a]">
                        <BarChart2 size={12} className="text-[#0062ff] mt-0.5 shrink-0" />
                        <span><span className="text-[#8b9cb6] font-medium">{analyticsSource}</span> — Add <code className="text-[#0062ff]">IBM_SQL_QUERY_CRN</code> + <code className="text-[#0062ff]">IBM_COS_BUCKET</code> env vars to run these queries against IBM Cloud SQL Query.</span>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Upload / Scan strip */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* CSV upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border-2 border-dashed border-[#2a3a55] hover:border-[#0062ff]/40 transition-colors p-6 text-center group cursor-pointer">
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFileUpload(f); e.target.value = ""; }} />
            <Upload size={24} className="text-[#4b5e7a] group-hover:text-[#0062ff] mx-auto mb-2 transition-colors" />
            <p className="font-medium text-[#8b9cb6] group-hover:text-white transition-colors text-sm">Upload Bank Statement CSV</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Sparkles size={10} className="text-[#0062ff]" />
              <p className="text-xs text-[#4b5e7a]">AI categorizes each row — review before importing</p>
            </div>
          </div>

          {/* Receipt scanner */}
          <div
            onClick={() => setShowReceiptScanner(true)}
            className="rounded-2xl border-2 border-dashed border-[#2a3a55] hover:border-[#0062ff]/40 transition-colors p-6 text-center group cursor-pointer">
            <Camera size={24} className="text-[#4b5e7a] group-hover:text-[#0062ff] mx-auto mb-2 transition-colors" />
            <p className="font-medium text-[#8b9cb6] group-hover:text-white transition-colors text-sm">Scan Receipt</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <ScanLine size={10} className="text-[#0062ff]" />
              <p className="text-xs text-[#4b5e7a]">Camera or photo — OCR runs on-device</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── UPLOAD REVIEW MODAL (spec: "User reviews, confirms, or edits categorizations") ── */}
      <AnimatePresence>
        {showReviewModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { if (!importingRows) { setShowReviewModal(false); setReviewRows([]); } }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl max-h-[85vh] flex flex-col">
              <div className="bg-[#111827] border border-[#2a3a55] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a55]">
                  <div>
                    <h3 className="text-base font-semibold text-white">Review & confirm import</h3>
                    <p className="text-xs text-[#4b5e7a] mt-0.5 flex items-center gap-1">
                      <Sparkles size={10} className="text-[#0062ff]" />
                      watsonx.ai categorized each transaction — edit any row before importing
                    </p>
                  </div>
                  <button onClick={() => { if (!importingRows) { setShowReviewModal(false); setReviewRows([]); } }} className="text-[#4b5e7a] hover:text-white transition-colors"><X size={18} /></button>
                </div>

                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[#0f1623] border-b border-[#2a3a55]">
                      <tr>
                        <th className="text-left px-4 py-2.5 text-xs text-[#4b5e7a] font-medium">Description</th>
                        <th className="text-left px-4 py-2.5 text-xs text-[#4b5e7a] font-medium">Category</th>
                        <th className="text-left px-4 py-2.5 text-xs text-[#4b5e7a] font-medium">Type</th>
                        <th className="text-right px-4 py-2.5 text-xs text-[#4b5e7a] font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a3a55]/50">
                      {reviewRows.map((row, i) => (
                        <tr key={i} className="hover:bg-[#1a2235]/60 transition-colors">
                          <td className="px-4 py-2.5 text-white max-w-[220px] truncate">{row.description}</td>
                          <td className="px-4 py-2.5">
                            {row.categorizing ? (
                              <div className="flex items-center gap-1.5 text-[#4b5e7a] text-xs">
                                <Loader2 size={11} className="animate-spin" /> Asking AI…
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <select value={row.category} onChange={(e) => setReviewRows((prev) => prev.map((r, idx) => idx === i ? { ...r, category: e.target.value } : r))}
                                  className="bg-[#1a2235] border border-[#2a3a55] rounded-lg px-2 py-1 text-white text-xs outline-none focus:border-[#0062ff]/50 w-full max-w-[140px]">
                                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                                {row.source !== "pending" && (
                                  <span title={`Categorized by ${row.source === "watsonx" ? "watsonx.ai" : "local classifier"}`}>
                                    <Sparkles size={10} className={row.source === "watsonx" ? "text-[#0062ff]" : "text-[#4b5e7a]"} />
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex gap-1">
                              {(["expense", "income"] as const).map((t) => (
                                <button key={t} onClick={() => setReviewRows((prev) => prev.map((r, idx) => idx === i ? { ...r, type: t } : r))}
                                  className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize border transition-all ${row.type === t ? (t === "income" ? "bg-[#10b981]/15 border-[#10b981]/40 text-[#10b981]" : "bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ef4444]") : "bg-[#1a2235] border-[#2a3a55] text-[#4b5e7a]"}`}>
                                  {t}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold text-white">${row.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 border-t border-[#2a3a55] flex items-center justify-between gap-3">
                  {importDone ? (
                    <div className="flex items-center gap-2 text-[#10b981] text-sm font-medium">
                      <Check size={16} /> {reviewRows.length} transactions imported successfully
                    </div>
                  ) : (
                    <p className="text-xs text-[#4b5e7a]">{reviewRows.filter((r) => !r.categorizing).length}/{reviewRows.length} categorized</p>
                  )}
                  <div className="flex gap-3">
                    <button onClick={() => { setShowReviewModal(false); setReviewRows([]); }} disabled={importingRows}
                      className="px-4 py-2 rounded-xl border border-[#2a3a55] text-[#8b9cb6] text-sm hover:text-white transition-colors disabled:opacity-50">
                      {importDone ? "Close" : "Cancel"}
                    </button>
                    {!importDone && (
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={confirmImport} disabled={importingRows || reviewRows.some((r) => r.categorizing)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0062ff] text-white text-sm font-semibold disabled:opacity-60">
                        {importingRows ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        {importingRows ? "Importing…" : `Import ${reviewRows.length} transactions`}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── ADD MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
              <div className="bg-[#111827] border border-[#2a3a55] rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-white">Add Transaction</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-[#4b5e7a] hover:text-white transition-colors"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {(["income", "expense"] as const).map((t) => (
                      <button key={t} onClick={() => setNewEntry({ ...newEntry, type: t })}
                        className={`py-2 rounded-xl text-sm font-medium capitalize border transition-all ${newEntry.type === t ? (t === "income" ? "bg-[#10b981]/15 border-[#10b981]/40 text-[#10b981]" : "bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ef4444]") : "bg-[#1a2235] border-[#2a3a55] text-[#8b9cb6] hover:border-[#0062ff]/20"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <div>
                    <div className="relative">
                      <input placeholder="Description *" value={newEntry.description}
                        onChange={(e) => { setNewEntry({ ...newEntry, description: e.target.value }); setEntryError(""); setAiSource(null); }}
                        className="w-full bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-[#4b5e7a] outline-none pr-20" />
                      <button type="button" onClick={() => aiCategorize(newEntry.description)} disabled={aiCategorizing || !newEntry.description.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0062ff]/10 hover:bg-[#0062ff]/20 text-[#0062ff] text-[10px] font-semibold transition-colors disabled:opacity-40">
                        {aiCategorizing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} AI
                      </button>
                    </div>
                    {aiSource && (
                      <p className="text-[10px] text-[#4b5e7a] mt-1 flex items-center gap-1">
                        <Sparkles size={9} className="text-[#0062ff]" />
                        Categorized by {aiSource === "watsonx" ? "watsonx.ai · IBM Granite" : "local classifier"}
                      </p>
                    )}
                  </div>
                  <input placeholder="Amount *" value={newEntry.amount} onChange={(e) => { setNewEntry({ ...newEntry, amount: e.target.value }); setEntryError(""); }}
                    type="number" min="0" step="0.01" className="w-full bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-[#4b5e7a] outline-none" />
                  <select value={newEntry.category} onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                    className="w-full bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {entryError && <p className="text-xs text-[#ef4444]">{entryError}</p>}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-[#2a3a55] text-[#8b9cb6] text-sm hover:text-white transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={addTransaction} disabled={addingTxn}
                    className="flex-1 py-2.5 rounded-xl bg-[#0062ff] text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60">
                    {addingTxn ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {addingTxn ? "Saving…" : "Add Entry"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── BUDGET MODAL ── */}
      <AnimatePresence>
        {showBudgetModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBudgetModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm">
              <div className="bg-[#111827] border border-[#2a3a55] rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-white">{editingBudget ? `Edit ${editingBudget.category}` : "Set Budget"}</h3>
                  <button onClick={() => setShowBudgetModal(false)} className="text-[#4b5e7a] hover:text-white transition-colors"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  {!editingBudget && (
                    <select value={budgetForm.category} onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                      className="w-full bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none">
                      {BUDGET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  )}
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5e7a] text-sm">$</span>
                    <input placeholder="Monthly limit" value={budgetForm.total} onChange={(e) => setBudgetForm({ ...budgetForm, total: e.target.value })}
                      type="number" min="0" step="1" className="w-full bg-[#1a2235] border border-[#2a3a55] focus:border-[#0062ff]/50 rounded-xl pl-8 pr-4 py-2.5 text-white text-sm outline-none" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowBudgetModal(false)} className="flex-1 py-2.5 rounded-xl border border-[#2a3a55] text-[#8b9cb6] text-sm hover:text-white transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={saveBudget} disabled={savingBudget}
                    className="flex-1 py-2.5 rounded-xl bg-[#0062ff] text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60">
                    {savingBudget ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {savingBudget ? "Saving…" : "Save Budget"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── RECEIPT SCANNER ── */}
      {showReceiptScanner && (
        <ReceiptScanner
          onClose={() => setShowReceiptScanner(false)}
          onConfirm={handleReceiptConfirm}
        />
      )}
    </div>
  );
}
