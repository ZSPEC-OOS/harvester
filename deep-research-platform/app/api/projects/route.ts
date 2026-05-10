import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sessions: true } } },
  });

  return NextResponse.json(projects.map((p: any) => ({ ...p, sessionCount: p._count.sessions })));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.userId || !body.name?.trim()) return NextResponse.json({ error: "Missing userId or name" }, { status: 400 });

  const project = await prisma.project.create({
    data: { userId: body.userId, name: body.name.trim(), description: body.description?.trim() || null },
    include: { _count: { select: { sessions: true } } },
  });

  return NextResponse.json({ ...project, sessionCount: project._count.sessions }, { status: 201 });
}
