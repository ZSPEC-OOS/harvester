import { NextRequest, NextResponse } from "next/server";
import { projectStore } from "@/lib/local-project-store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const project = projectStore.get(id);
  if (!project || project.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...project, sessionCount: 0 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = req.nextUrl.searchParams.get("userId");
  const project = projectStore.get(id);
  if (!project || project.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  projectStore.delete(id);
  return NextResponse.json({ ok: true });
}
