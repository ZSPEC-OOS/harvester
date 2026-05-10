import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  return NextResponse.json({
    daily: [],
    totals: { costUsd: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0, calls: 0 },
    byType: {},
    byModel: {},
  });
}
