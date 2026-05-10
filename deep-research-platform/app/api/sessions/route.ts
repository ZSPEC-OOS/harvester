import { NextRequest, NextResponse } from "next/server";
import { sessionStore } from "@/lib/local-session-store";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const projectId = req.nextUrl.searchParams.get("projectId");
  const limit = Number(req.nextUrl.searchParams.get("limit") || 20);
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  let sessions = sessionStore.listByUser(userId, limit);
  if (projectId) sessions = sessions.filter((s) => s.projectId === projectId);

  return NextResponse.json(
    sessions.map((s) => ({
      id: s.id,
      topic: s.topic,
      status: s.status,
      createdAt: s.createdAt,
      sourceCount: Array.isArray(s.rankedSources) ? s.rankedSources.length : 0,
      projectName: null,
    })),
  );
}
