import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const projectId = req.nextUrl.searchParams.get("projectId");
  const limit = Number(req.nextUrl.searchParams.get("limit") || 20);
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const sessions = await prisma.researchSession.findMany({
    where: { userId, ...(projectId ? { projectId } : {}) },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { project: true },
  });

  return NextResponse.json(
    sessions.map((s: any) => ({
      id: s.id,
      topic: s.topic,
      status: s.status,
      createdAt: s.createdAt,
      sourceCount: Array.isArray(s.rankedSources) ? s.rankedSources.length : 0,
      projectName: s.project?.name ?? null,
    })),
  );
}
