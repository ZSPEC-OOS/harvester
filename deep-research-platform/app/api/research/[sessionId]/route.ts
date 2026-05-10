import { NextResponse } from "next/server";
import { sessionStore } from "@/lib/local-session-store";

export async function GET(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const userId = req.headers.get("X-User-Id");

  const session = sessionStore.get(sessionId);
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (userId && session.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(session);
}
