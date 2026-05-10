import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSessionSchema } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";

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

  const session = await prisma.researchSession.create({
    data: {
      userId: parsed.data.userId,
      topic: parsed.data.topic,
      audience: parsed.data.audience,
      depthLevel: parsed.data.depthLevel || "standard",
      citationStyle: parsed.data.citationStyle || "apa",
      sourceCount: parsed.data.sourceCount || 20,
      dateRangeStart: parsed.data.dateRangeStart,
      dateRangeEnd: parsed.data.dateRangeEnd,
      status: "planning",
      projectId: parsed.data.projectId || null,
      domainRestrictions: parsed.data.domainRestrictions || [],
      excludedSourceTypes: parsed.data.excludedSourceTypes || [],
    },
  });

  return NextResponse.json({ sessionId: session.id, status: session.status }, { headers: rateLimit.headers });
}
