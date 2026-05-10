import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = req.nextUrl.searchParams.get("userId");
  const { id } = await params;
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { _count: { select: { sessions: true } } },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...project, sessionCount: project._count.sessions });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = req.nextUrl.searchParams.get("userId");
  const { id } = await params;
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  await prisma.project.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
