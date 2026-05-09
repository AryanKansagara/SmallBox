import { NextRequest, NextResponse } from "next/server";
import { dbList, dbPut, makeId, isCloudantConfigured } from "@/lib/cloudant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TransactionDoc = {
  _id: string;
  _rev?: string;
  type: "transaction";
  description: string;
  category: string;
  amount: number;
  date: string;
  month: string;
  transactionType: "income" | "expense";
  createdAt: string;
};

export async function GET() {
  try {
    const docs = await dbList<TransactionDoc>("transaction");
    docs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return NextResponse.json({
      transactions: docs,
      persisted: isCloudantConfigured(),
    });
  } catch (err) {
    console.error("GET /api/finance/transactions error:", err);
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: Partial<TransactionDoc>;
  try {
    body = (await req.json()) as Partial<TransactionDoc>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!body.description?.trim()) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
  }

  const transactionType =
    body.transactionType === "income" ? "income" : "expense";

  const now = new Date();
  const month = body.month ?? now.toISOString().slice(0, 7);
  const date =
    body.date ??
    now.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const doc: TransactionDoc = {
    _id: makeId("txn"),
    type: "transaction",
    description: body.description.trim(),
    category: (body.category ?? "Other").toString().slice(0, 40),
    amount,
    date,
    month,
    transactionType,
    createdAt: now.toISOString(),
  };

  try {
    const saved = await dbPut(doc);
    return NextResponse.json({ transaction: saved });
  } catch (err) {
    console.error("POST /api/finance/transactions error:", err);
    return NextResponse.json({ error: "Failed to save transaction" }, { status: 500 });
  }
}
