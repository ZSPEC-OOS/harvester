import { NextResponse } from "next/server";

export async function GET() {
  const ai = process.env.DEEPSEEK_API_KEY ? "ok" : "not configured";
  return NextResponse.json({ status: "healthy", checks: { database: "not configured", ai }, latencyMs: 0 });
}
