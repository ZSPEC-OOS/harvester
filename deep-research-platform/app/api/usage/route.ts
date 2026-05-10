import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { subDays, startOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const days = Number(req.nextUrl.searchParams.get("days") ?? 30);
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const since = startOfDay(subDays(new Date(), Math.max(1, days) - 1));
  const events = await prisma.usageEvent.findMany({ where: { userId, createdAt: { gte: since } }, orderBy: { createdAt: "asc" } });

  const dailyMap = new Map<string, { date: string; costUsd: number; promptTokens: number; completionTokens: number; calls: number }>();
  const byType: Record<string, number> = {};
  const byModel: Record<string, number> = {};
  let totalCostUsd = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;

  for (const e of events) {
    const date = e.createdAt.toISOString().slice(0, 10);
    const cur = dailyMap.get(date) ?? { date, costUsd: 0, promptTokens: 0, completionTokens: 0, calls: 0 };
    cur.costUsd += e.costUsd ?? 0;
    cur.promptTokens += e.promptTokens;
    cur.completionTokens += e.completionTokens;
    cur.calls += 1;
    dailyMap.set(date, cur);

    totalCostUsd += e.costUsd ?? 0;
    totalPromptTokens += e.promptTokens;
    totalCompletionTokens += e.completionTokens;
    byType[e.eventType] = (byType[e.eventType] ?? 0) + 1;
    byModel[e.model ?? "unknown"] = (byModel[e.model ?? "unknown"] ?? 0) + 1;
  }

  return NextResponse.json({
    daily: Array.from(dailyMap.values()).map((d) => ({ ...d, costUsd: Number(d.costUsd.toFixed(6)) })),
    totals: {
      costUsd: Number(totalCostUsd.toFixed(6)),
      promptTokens: totalPromptTokens,
      completionTokens: totalCompletionTokens,
      totalTokens: totalPromptTokens + totalCompletionTokens,
      calls: events.length,
    },
    byType,
    byModel,
  });
}
