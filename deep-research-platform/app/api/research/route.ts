import { NextRequest, NextResponse } from "next/server";
import { sessionStore } from "@/lib/local-session-store";
import { createSessionSchema } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const rateLimit = enforceRateLimit(parsed.data.userId, "sessions");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: rateLimit.headers });
  }

  const session = sessionStore.create({
    id: randomUUID(),
    userId: parsed.data.userId,
    topic: parsed.data.topic,
    depthLevel: parsed.data.depthLevel || "standard",
    citationStyle: parsed.data.citationStyle || "apa",
    sourceCount: parsed.data.sourceCount || 20,
    dateRangeStart: parsed.data.dateRangeStart,
    dateRangeEnd: parsed.data.dateRangeEnd,
    projectId: parsed.data.projectId,
    apiKey: parsed.data.apiKey,
    baseUrl: parsed.data.baseUrl,
    modelId: parsed.data.modelId,
    status: "planning",
  });

  return NextResponse.json({ sessionId: session.id, status: session.status }, { headers: rateLimit.headers });
}
