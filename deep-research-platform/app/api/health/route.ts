import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const started = Date.now();
  let database = "ok";

  try { await prisma.$queryRaw`SELECT 1`; } catch { database = "error"; }

  const ai = process.env.DEEPSEEK_API_KEY ? "ok" : "missing";
  const latencyMs = Date.now() - started;
  const healthy = database === "ok" && ai === "ok";

  return NextResponse.json({ status: healthy ? "healthy" : "unhealthy", checks: { database, ai }, latencyMs }, { status: healthy ? 200 : 503 });
}
