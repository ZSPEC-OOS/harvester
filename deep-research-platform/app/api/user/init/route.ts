import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { userId?: string };
    const existingId = body.userId;

    if (existingId) {
      const existing = await prisma.user.findUnique({
        where: { id: existingId },
      });

      if (existing) {
        return NextResponse.json({ userId: existing.id });
      }
    }

    const user = await prisma.user.create({
      data: {},
    });

    return NextResponse.json({ userId: user.id });
  } catch (error) {
    console.error("User init error:", error);
    return NextResponse.json({ error: "Failed to initialize user" }, { status: 500 });
  }
}
