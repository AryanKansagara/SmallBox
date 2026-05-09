import { NextRequest, NextResponse } from "next/server";
import { dbDelete, dbList } from "@/lib/cloudant";

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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ category: string }> },
) {
  const { category } = await params;
  if (!category) {
    return NextResponse.json({ error: "category is required" }, { status: 400 });
  }

  const decodedCategory = decodeURIComponent(category);

  try {
    const budgets = await dbList<BudgetDoc>("budget");
    const target = budgets.find((b) => b.category === decodedCategory);
    if (!target) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }
    await dbDelete(target._id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/finance/budgets/[category] error:", err);
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 });
  }
}
