/**
 * POST /api/finance/report
 *
 * Generates an end-of-month business summary report using watsonx.ai.
 * Falls back to a rule-based summary when watsonx.ai is not configured.
 *
 * IBM Service: watsonx.ai (IBM Granite)
 * Spec ref: §6.2 Budgeting — "End-of-month summary report auto-generated"
 */

import { NextRequest, NextResponse } from "next/server";
import { generateText, isWatsonxConfigured } from "@/lib/watsonx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Transaction = {
  description: string;
  category: string;
  amount: number;
  transactionType: "income" | "expense";
};

type BudgetInput = {
  category: string;
  total: number;
};

type ReportRequest = {
  month: string; // "YYYY-MM"
  transactions: Transaction[];
  budgets: BudgetInput[];
};

function buildPrompt(req: ReportRequest, income: number, expenses: number, net: number): string {
  const month = new Date(`${req.month}-01`).toLocaleDateString("en-US", {
    month: "long", year: "numeric",
  });
  const margin = income > 0 ? Math.round((net / income) * 100) : 0;

  // Compact expense breakdown: top 5 only to keep prompt short
  const topExpenses = Object.entries(
    req.transactions
      .filter((t) => t.transactionType === "expense")
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + t.amount;
        return acc;
      }, {}),
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cat, amt]) => `${cat}:$${amt.toFixed(0)}`)
    .join(", ");

  const budgetStatus = req.budgets
    .map((b) => {
      const spent = req.transactions
        .filter((t) => t.transactionType === "expense" && t.category === b.category)
        .reduce((s, t) => s + t.amount, 0);
      const pct = Math.round((spent / b.total) * 100);
      return `${b.category}:${pct}%`;
    })
    .join(", ");

  return `Write a 3-sentence business monthly summary. Plain text only, no markdown, no lists.
${month} — Income:$${income.toFixed(0)} Expenses:$${expenses.toFixed(0)} Net:$${net.toFixed(0)} Margin:${margin}%
Top expenses: ${topExpenses || "none"}
Budgets: ${budgetStatus || "none set"}
One concern + one strength + one action tip:`;
}

function fallbackReport(income: number, expenses: number, net: number, month: string): string {
  const monthName = new Date(`${month}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const margin = income > 0 ? Math.round((net / income) * 100) : 0;

  if (income === 0 && expenses === 0) {
    return `No transactions were recorded for ${monthName}. Start by logging your income and expenses to see your financial summary here.`;
  }

  const tone = net >= 0 ? "positive" : "concerning";
  const netDescription = net >= 0
    ? `a net profit of $${net.toFixed(2)} (${margin}% margin)`
    : `a net loss of $${Math.abs(net).toFixed(2)}`;

  return `${monthName} closed with ${netDescription}. Total income came in at $${income.toFixed(2)} against $${expenses.toFixed(2)} in expenses. ${net >= 0 ? "This is a solid result — keep monitoring your top expense categories to protect the margin." : "Review your largest expense categories and look for areas to reduce costs next month."} ${tone === "positive" ? "Consider setting aside a portion of the profit as a reserve for slower months." : "Focus on increasing recurring revenue to stabilize your cash flow."}`;
}

export async function POST(req: NextRequest) {
  let body: ReportRequest;
  try {
    body = (await req.json()) as ReportRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { transactions = [], budgets = [], month } = body;
  if (!month) {
    return NextResponse.json({ error: "month is required (YYYY-MM)" }, { status: 400 });
  }

  const income = transactions.filter((t) => t.transactionType === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.transactionType === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expenses;

  if (!isWatsonxConfigured()) {
    return NextResponse.json({
      report: fallbackReport(income, expenses, net, month),
      source: "fallback",
    });
  }

  const prompt = buildPrompt(body, income, expenses, net);
  const result = await generateText(prompt, 160);

  const report = result.text || fallbackReport(income, expenses, net, month);

  return NextResponse.json({
    report,
    source: result.source,
    powered_by: "watsonx.ai — IBM Granite",
  });
}
