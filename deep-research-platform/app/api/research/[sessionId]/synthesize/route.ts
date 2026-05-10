import { NextResponse } from "next/server";
import { sessionStore } from "@/lib/local-session-store";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getProviderFromConfig } from "@/lib/ai/router";
import type { RankedSource, VerifiedCitation } from "@/lib/ranking/types";
import { SYNTHESIS_SYSTEM_PROMPT, SYNTHESIS_USER_PROMPT_TEMPLATE } from "@/lib/prompts";

function fillTemplate(t: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v), t);
}

export async function POST(_req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = sessionStore.get(sessionId);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const rateLimit = enforceRateLimit(session.userId, "steps");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: rateLimit.headers });
  }

  const plan = (session.plan as Record<string, any> | null) ?? {};
  const ranked = (session.rankedSources as RankedSource[] | null) ?? [];
  const verified = (session.verifiedCitations as VerifiedCitation[] | null) ?? [];

  const sources = verified
    .map((v, i) => `[${i + 1}] ${session.citationStyle === "mla" ? v.mla : v.apa} | confidence=${Math.round(v.confidence * 100)}%`)
    .join("\n");
  const questions = (plan.researchQuestions ?? []).map((q: string) => `- ${q}`).join("\n") || "- Explain core findings";
  const sections = (plan.expectedSections ?? ["Introduction", "Analysis", "Conclusion"]).map((s: string) => `- ${s}`).join("\n");

  const userPrompt = fillTemplate(SYNTHESIS_USER_PROMPT_TEMPLATE, {
    topic: session.topic,
    depthLevel: session.depthLevel,
    citationStyle: session.citationStyle,
    questions,
    sections,
    sources: `${sources}\n\nRanked source hints:\n${ranked.map((r, i) => `[${i + 1}] ${r.title}: ${r.abstract ?? ""}`).join("\n")}`,
  });

  const provider = getProviderFromConfig(session.apiKey, session.baseUrl, session.modelId);

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      let report = "";
      try {
        for await (const token of provider.streamText(userPrompt, SYNTHESIS_SYSTEM_PROMPT)) {
          report += token;
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "token", token })}\n\n`));
        }
        sessionStore.update(sessionId, { finalReport: report, status: "complete" });
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "done", length: report.length })}\n\n`));
      } catch {
        sessionStore.update(sessionId, { status: "failed" });
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "error", error: "Synthesis failed" })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
}
