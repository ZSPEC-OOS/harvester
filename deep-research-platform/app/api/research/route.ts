import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.userId || !body.topic?.trim()) return NextResponse.json({ error: "Missing userId or topic" }, { status: 400 });

  const session = await prisma.researchSession.create({
    data: {
      userId: body.userId,
      topic: body.topic,
      audience: body.audience,
      depthLevel: body.depthLevel || "standard",
      citationStyle: body.citationStyle || "apa",
      sourceCount: body.sourceCount || 20,
      dateRangeStart: body.dateRangeStart,
      dateRangeEnd: body.dateRangeEnd,
      status: "planning",
      projectId: body.projectId || null,
      domainRestrictions: body.domainRestrictions || [],
      excludedSourceTypes: body.excludedSourceTypes || [],
    },
  });

  return NextResponse.json({ sessionId: session.id, status: session.status });
}
