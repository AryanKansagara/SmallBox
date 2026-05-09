/**
 * POST /api/finance/analytics
 *
 * Runs business analytics over transaction history.
 *
 * IBM Service: IBM Cloud SQL Query (Data Engine)
 * Spec ref: §6.2 — "IBM Cloud SQL Query — runs analytics queries on transaction history"
 * IBM Stack Table: "Finance Analytics | IBM Cloud SQL Query | 30 GB/day scan"
 *
 * When IBM_SQL_QUERY_CRN + CLOUDANT_URL are configured this route submits
 * real SQL jobs to IBM Cloud SQL Query and returns results. Otherwise it
 * executes the same queries locally and labels them accordingly.
 *
 * Required env vars (optional — fallback active without them):
 *   IBM_SQL_QUERY_CRN  — Instance CRN from cloud.ibm.com → SQL Query service
 *   IBM_SQL_QUERY_URL  — (optional) defaults to us-south endpoint
 *   IBM_COS_BUCKET     — COS bucket that holds transactions.csv
 *   IBM_COS_ENDPOINT   — e.g. https://s3.us-south.cloud-object-storage.appdomain.cloud
 *   IBM_CLOUD_API_KEY  — shared IAM key (same one used for Cloudant + watsonx.ai)
 */

import { NextRequest, NextResponse } from "next/server";
import { getIamToken, isIbmConfigured } from "@/lib/ibm-iam";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Transaction = {
  description: string;
  category: string;
  amount: number;
  date: string;
  month: string;
  transactionType: "income" | "expense";
};

export type AnalyticResult = {
  label: string;
  value: string;
  detail?: string;
  sql: string;
};

export type AnalyticsResponse = {
  results: AnalyticResult[];
  source: "ibm-sql-query" | "local";
  powered_by: string;
};

// ── IBM SQL Query helpers ─────────────────────────────────────────────────────

function isSqlQueryConfigured(): boolean {
  return Boolean(
    process.env.IBM_SQL_QUERY_CRN &&
    process.env.IBM_COS_BUCKET &&
    process.env.IBM_COS_ENDPOINT &&
    isIbmConfigured(),
  );
}

const SQL_QUERY_URL =
  process.env.IBM_SQL_QUERY_URL?.replace(/\/+$/, "") ??
  "https://api.us-south.sql-query.cloud.ibm.com";

async function submitSqlJob(sql: string): Promise<string> {
  const token = await getIamToken();
  const crn = encodeURIComponent(process.env.IBM_SQL_QUERY_CRN!);
  const resultTarget = `cos://${process.env.IBM_COS_ENDPOINT!.replace(/^https?:\/\//, "")}/${process.env.IBM_COS_BUCKET!}/sql-results/`;

  const res = await fetch(`${SQL_QUERY_URL}/v3/sql_jobs?instance_crn=${crn}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ statement: sql, resultset_target: resultTarget }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`SQL Query submit failed: ${res.status}`);
  const data = (await res.json()) as { job_id: string };
  return data.job_id;
}

async function pollSqlJob(
  jobId: string,
  maxMs = 30_000,
): Promise<{ status: string; resultset_location?: string }> {
  const token = await getIamToken();
  const crn = encodeURIComponent(process.env.IBM_SQL_QUERY_CRN!);
  const deadline = Date.now() + maxMs;

  while (Date.now() < deadline) {
    const res = await fetch(
      `${SQL_QUERY_URL}/v3/sql_jobs/${jobId}?instance_crn=${crn}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      },
    );
    if (!res.ok) throw new Error(`SQL Query poll failed: ${res.status}`);
    const data = (await res.json()) as {
      status: string;
      resultset_location?: string;
    };
    if (data.status === "completed" || data.status === "failed") return data;
    await new Promise((r) => setTimeout(r, 1500));
  }

  throw new Error("SQL Query job timed out");
}

async function fetchCsvResult(url: string): Promise<string[][]> {
  const token = await getIamToken();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`COS result fetch failed: ${res.status}`);
  const text = await res.text();
  return text
    .trim()
    .split("\n")
    .map((row) => row.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));
}

async function runSql(
  sql: string,
): Promise<string[][] | null> {
  try {
    const jobId = await submitSqlJob(sql);
    const job = await pollSqlJob(jobId);
    if (job.status !== "completed" || !job.resultset_location) return null;
    const rows = await fetchCsvResult(job.resultset_location);
    return rows.slice(1); // skip header
  } catch (err) {
    console.error("IBM SQL Query error:", err);
    return null;
  }
}

// ── Local analytics (used as fallback) ────────────────────────────────────────

function localAnalytics(transactions: Transaction[]): AnalyticResult[] {
  const expenses = transactions.filter((t) => t.transactionType === "expense");
  const income = transactions.filter((t) => t.transactionType === "income");

  // 1. Top spending category
  const catMap: Record<string, number> = {};
  for (const t of expenses) catMap[t.category] = (catMap[t.category] ?? 0) + t.amount;
  const topCat = Object.entries(catMap).sort(([, a], [, b]) => b - a)[0];

  // 2. Month-over-month net change
  const monthMap: Record<string, { inc: number; exp: number }> = {};
  for (const t of transactions) {
    const m = monthMap[t.month] ?? { inc: 0, exp: 0 };
    if (t.transactionType === "income") m.inc += t.amount;
    else m.exp += t.amount;
    monthMap[t.month] = m;
  }
  const months = Object.keys(monthMap).sort();
  let momLabel = "Only one month of data";
  if (months.length >= 2) {
    const prev = monthMap[months[months.length - 2]]!;
    const curr = monthMap[months[months.length - 1]]!;
    const prevNet = prev.inc - prev.exp;
    const currNet = curr.inc - curr.exp;
    const delta = currNet - prevNet;
    momLabel = `${delta >= 0 ? "+" : ""}$${delta.toFixed(2)} vs prior month`;
  }

  // 3. Biggest single expense
  const biggest = expenses.sort((a, b) => b.amount - a.amount)[0];

  // 4. Profit margin (current month)
  const currentMonth = months[months.length - 1] ?? "";
  const currData = monthMap[currentMonth] ?? { inc: 0, exp: 0 };
  const margin = currData.inc > 0
    ? Math.round(((currData.inc - currData.exp) / currData.inc) * 100)
    : 0;

  // 5. Transaction count
  const txnCount = transactions.length;

  return [
    {
      label: "Top expense category",
      value: topCat ? `${topCat[0]} — $${topCat[1].toFixed(2)}` : "No expenses yet",
      sql: `SELECT category, SUM(amount) AS total\nFROM COS://bucket/transactions.csv\nWHERE transaction_type = 'expense'\nGROUP BY category\nORDER BY total DESC\nLIMIT 1`,
    },
    {
      label: "Month-over-month net change",
      value: momLabel,
      sql: `SELECT month, SUM(CASE WHEN type='income' THEN amount ELSE -amount END) AS net\nFROM COS://bucket/transactions.csv\nGROUP BY month\nORDER BY month DESC\nLIMIT 2`,
    },
    {
      label: "Biggest single expense",
      value: biggest ? `${biggest.description} — $${biggest.amount.toFixed(2)}` : "No expenses yet",
      detail: biggest?.category,
      sql: `SELECT description, amount, category\nFROM COS://bucket/transactions.csv\nWHERE transaction_type = 'expense'\nORDER BY amount DESC\nLIMIT 1`,
    },
    {
      label: "Profit margin (this month)",
      value: currData.inc > 0 ? `${margin}%` : "No income recorded",
      detail: `Income $${currData.inc.toFixed(2)} · Expenses $${currData.exp.toFixed(2)}`,
      sql: `SELECT\n  SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS income,\n  SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expenses\nFROM COS://bucket/transactions.csv\nWHERE month = CURRENT_MONTH`,
    },
    {
      label: "Total transactions logged",
      value: `${txnCount} entries`,
      sql: `SELECT COUNT(*) AS total\nFROM COS://bucket/transactions.csv`,
    },
  ];
}

// ── IBM SQL Query analytics (runs when configured) ────────────────────────────

async function ibmSqlAnalytics(cosRef: string): Promise<AnalyticResult[] | null> {
  try {
    const results: AnalyticResult[] = [];

    // 1. Top category
    const topCatSql = `SELECT category, SUM(amount) AS total FROM ${cosRef} STORED AS CSV WHERE transaction_type = 'expense' GROUP BY category ORDER BY total DESC LIMIT 1`;
    const topRows = await runSql(topCatSql);
    results.push({
      label: "Top expense category",
      value: topRows?.[0] ? `${topRows[0][0]} — $${parseFloat(topRows[0][1] ?? "0").toFixed(2)}` : "No data",
      sql: topCatSql,
    });

    // 2. Month-over-month
    const momSql = `SELECT month, SUM(CASE WHEN transaction_type='income' THEN amount ELSE -amount END) AS net FROM ${cosRef} STORED AS CSV GROUP BY month ORDER BY month DESC LIMIT 2`;
    const momRows = await runSql(momSql);
    let momVal = "Only one month of data";
    if (momRows && momRows.length >= 2) {
      const delta = parseFloat(momRows[0]?.[1] ?? "0") - parseFloat(momRows[1]?.[1] ?? "0");
      momVal = `${delta >= 0 ? "+" : ""}$${delta.toFixed(2)} vs prior month`;
    }
    results.push({ label: "Month-over-month net change", value: momVal, sql: momSql });

    // 3. Biggest expense
    const bigSql = `SELECT description, amount, category FROM ${cosRef} STORED AS CSV WHERE transaction_type = 'expense' ORDER BY amount DESC LIMIT 1`;
    const bigRows = await runSql(bigSql);
    results.push({
      label: "Biggest single expense",
      value: bigRows?.[0] ? `${bigRows[0][0]} — $${parseFloat(bigRows[0][1] ?? "0").toFixed(2)}` : "No data",
      detail: bigRows?.[0]?.[2],
      sql: bigSql,
    });

    // 4. Total transactions
    const countSql = `SELECT COUNT(*) AS total FROM ${cosRef} STORED AS CSV`;
    const countRows = await runSql(countSql);
    results.push({
      label: "Total transactions logged",
      value: countRows?.[0]?.[0] ? `${countRows[0][0]} entries` : "—",
      sql: countSql,
    });

    return results;
  } catch (err) {
    console.error("IBM SQL Query analytics error:", err);
    return null;
  }
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { transactions?: Transaction[] };
  try {
    body = (await req.json()) as { transactions?: Transaction[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const transactions = body.transactions ?? [];

  // Attempt real IBM SQL Query when fully configured
  if (isSqlQueryConfigured()) {
    const cosRef = `cos://${process.env.IBM_COS_ENDPOINT!.replace(/^https?:\/\//, "")}/${process.env.IBM_COS_BUCKET!}/transactions`;
    const ibmResults = await ibmSqlAnalytics(cosRef);
    if (ibmResults) {
      return NextResponse.json({
        results: ibmResults,
        source: "ibm-sql-query",
        powered_by: "IBM Cloud SQL Query (Data Engine)",
      } satisfies AnalyticsResponse);
    }
  }

  // Local fallback — same queries, computed in-process
  return NextResponse.json({
    results: localAnalytics(transactions),
    source: "local",
    powered_by: isSqlQueryConfigured()
      ? "Local (IBM SQL Query unavailable)"
      : "Local computation — add IBM_SQL_QUERY_CRN + IBM_COS_BUCKET to use IBM Cloud SQL Query",
  } satisfies AnalyticsResponse);
}
