import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  return NextResponse.json({ keys: [] });
}

export async function POST(_req: NextRequest) {
  return NextResponse.json({ ok: true });
}
