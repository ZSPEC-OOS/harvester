import { NextResponse } from "next/server";
import { z } from "zod";
import { sessionStore } from "@/lib/local-session-store";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getProviderFromConfig } from "@/lib/ai/router";
import { PLANNER_SYSTEM_PROMPT, PLANNER_USER_PROMPT_TEMPLATE } from "@/lib/prompts";

const planSchema = z.object({
  searchQueries: z.array(z.string()).min(1),
  rationale: z.string(),
  researchQuestions: z.array(z.string()),
  expectedSections: z.array(z.string()),
  sourceTypes: z.array(z.string()),
  inclusionCriteria: z.array(z.string()),
  exclusionCriteria: z.array(z.string()),
});

function applyTemplate(template: string, values: Record<string, string | number | undefined | null>) {
  return Object.entries(values).reduce(
    (acc, [key, value]) => acc.replaceAll(`{{${key}}}`, String(value ?? "")),
    template,
  );
}

export async function POST(_req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = sessionStore.get(sessionId);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const rateLimit = enforceRateLimit(session.userId, "steps");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: rateLimit.headers });
  }

  const userPrompt = applyTemplate(PLANNER_USER_PROMPT_TEMPLATE, {
    topic: session.topic,
    citationStyle: session.citationStyle,
    depthLevel: session.depthLevel,
    dateRangeStart: session.dateRangeStart,
    dateRangeEnd: session.dateRangeEnd,
    sourceCount: session.sourceCount,
  });

  const provider = getProviderFromConfig(session.apiKey, session.baseUrl, session.modelId);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const plan = await provider.generateObjectValidated(userPrompt, planSchema, PLANNER_SYSTEM_PROMPT);
        sessionStore.update(sessionId, { plan: plan as Record<string, unknown>, status: "searching" });
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, plan })}\n\n`));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Planner failed";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}
