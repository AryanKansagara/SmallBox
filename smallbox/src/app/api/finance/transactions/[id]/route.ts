import { NextRequest, NextResponse } from "next/server";
import { dbDelete } from "@/lib/cloudant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  try {
    await dbDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/finance/transactions/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
