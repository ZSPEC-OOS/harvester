import { NextRequest, NextResponse } from "next/server";
import { projectStore } from "@/lib/local-project-store";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  return NextResponse.json(projectStore.listByUser(userId).map((p) => ({ ...p, sessionCount: 0 })));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.userId || !body.name?.trim()) return NextResponse.json({ error: "Missing userId or name" }, { status: 400 });
  const project = projectStore.create({
    id: randomUUID(),
    userId: body.userId,
    name: body.name.trim(),
    description: body.description?.trim() || null,
  });
  return NextResponse.json({ ...project, sessionCount: 0 }, { status: 201 });
}
