import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getProviderForUser } from "@/lib/ai/router";
import { logUsageEvent } from "@/lib/ai/usage";
import { estimateTokensFromChars } from "@/lib/ai/cost";
import { PLANNER_SYSTEM_PROMPT, PLANNER_USER_PROMPT_TEMPLATE } from "@/lib/prompts";

function applyTemplate(template: string, values: Record<string, string | number | undefined | null>) {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{{${key}}}`, String(value ?? "")), template);
}

export async function POST(_req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await prisma.researchSession.findUnique({ where: { id: sessionId } });
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const rateLimit = enforceRateLimit(session.userId, "steps");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: rateLimit.headers });
  }

  const systemPrompt = PLANNER_SYSTEM_PROMPT;
  const userPrompt = applyTemplate(PLANNER_USER_PROMPT_TEMPLATE, session as unknown as Record<string, string | number | undefined | null>);

  const provider = await getProviderForUser(session.userId);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let full = "";
      try {
        for await (const chunk of provider.streamText(userPrompt, systemPrompt)) {
          full += chunk;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
        }
        const parsed = JSON.parse(full);
        await prisma.researchSession.update({ where: { id: sessionId }, data: { plan: parsed, status: "searching" } });
        await logUsageEvent({
          userId: session.userId,
          sessionId,
          eventType: "planner_complete",
          provider: provider.provider,
          model: provider.model,
          promptTokens: estimateTokensFromChars(userPrompt.length + systemPrompt.length),
          completionTokens: estimateTokensFromChars(full.length),
        });
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, plan: parsed })}\n\n`));
      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Planner failed" })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
}
