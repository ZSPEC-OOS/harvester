import { NextRequest, NextResponse } from "next/server";

export async function DELETE(_req: NextRequest, _ctx: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true });
}
