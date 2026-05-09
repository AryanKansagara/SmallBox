import { NextRequest, NextResponse } from "next/server";
import { dbList, dbPut, isCloudantConfigured } from "@/lib/cloudant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BudgetDoc = {
  _id: string;
  _rev?: string;
  type: "budget";
  category: string;
  total: number;
  color: string;
};

const COLORS: Record<string, string> = {
  Supplies: "#0062ff",
  Marketing: "#10b981",
  Utilities: "#f59e0b",
  Rent: "#8b5cf6",
  Payroll: "#ec4899",
  Insurance: "#14b8a6",
  Equipment: "#f97316",
  Other: "#38bdf8",
};

export async function GET() {
  try {
    const docs = await dbList<BudgetDoc>("budget");
    docs.sort((a, b) => a.category.localeCompare(b.category));
    return NextResponse.json({
      budgets: docs,
      persisted: isCloudantConfigured(),
    });
  } catch (err) {
    console.error("GET /api/finance/budgets error:", err);
    return NextResponse.json({ error: "Failed to load budgets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: Partial<BudgetDoc>;
  try {
    body = (await req.json()) as Partial<BudgetDoc>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const total = Number(body.total);
  if (!body.category?.trim()) {
    return NextResponse.json({ error: "category is required" }, { status: 400 });
  }
  if (!Number.isFinite(total) || total <= 0) {
    return NextResponse.json({ error: "total must be a positive number" }, { status: 400 });
  }

  // Upsert — use the category as the stable ID so editing works
  const existing = (await dbList<BudgetDoc>("budget")).find(
    (b) => b.category === body.category,
  );

  const doc: BudgetDoc = {
    _id: existing?._id ?? `budget_${body.category!.toLowerCase().replace(/\s+/g, "_")}`,
    _rev: existing?._rev,
    type: "budget",
    category: body.category,
    total,
    color: body.color ?? COLORS[body.category] ?? "#38bdf8",
  };

  try {
    const saved = await dbPut(doc);
    return NextResponse.json({ budget: saved });
  } catch (err) {
    console.error("POST /api/finance/budgets error:", err);
    return NextResponse.json({ error: "Failed to save budget" }, { status: 500 });
  }
}
