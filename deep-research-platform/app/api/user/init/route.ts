import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: string };
  const userId = body.userId?.trim() || randomUUID();
  return NextResponse.json({ userId });
}
