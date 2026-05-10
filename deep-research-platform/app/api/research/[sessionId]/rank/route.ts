import { NextResponse } from "next/server";
import { sessionStore } from "@/lib/local-session-store";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getProviderFromConfig } from "@/lib/ai/router";
import { scoreAuthority, scoreEvidence, scoreRecency } from "@/lib/ranking/heuristics";
import { DEFAULT_RANKING_CONFIG, RankedSource } from "@/lib/ranking/types";
import type { CandidateSource } from "@/types/research";
import { RANKER_SYSTEM_PROMPT } from "@/lib/prompts";

export async function POST(_req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = sessionStore.get(sessionId);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const rateLimit = enforceRateLimit(session.userId, "steps");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: rateLimit.headers });
  }

  const allSources = (session.candidateSources as CandidateSource[] | null) ?? [];
  const sources = allSources.slice(0, 100);
  const topic = session.topic;
  const provider = getProviderFromConfig(session.apiKey, session.baseUrl, session.modelId);
  const systemPrompt = RANKER_SYSTEM_PROMPT;

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const ranked: RankedSource[] = [];
      try {
        for (let i = 0; i < sources.length; i += 1) {
          const s = sources[i];
          const prompt = `Topic: ${topic}\nTitle: ${s.title}\nAbstract: ${s.abstract ?? ""}\nYear: ${s.year ?? "unknown"}\nVenue: ${s.journal}`;
          let relevance = 5;
          let rationale = "Moderate topical fit.";
          try {
            const modelOutput = await provider.generateText(prompt, systemPrompt);
            const parsed = JSON.parse(modelOutput) as { relevance?: number; rationale?: string };
            relevance = Math.max(0, Math.min(10, Number(parsed.relevance ?? 5)));
            rationale = parsed.rationale ?? rationale;
          } catch {}
          const authority = scoreAuthority(s);
          const recency = scoreRecency(s.year ?? null);
          const evidence = scoreEvidence(s);
          const final =
            relevance * DEFAULT_RANKING_CONFIG.weights.relevance +
            authority * DEFAULT_RANKING_CONFIG.weights.authority +
            recency * DEFAULT_RANKING_CONFIG.weights.recency +
            evidence * DEFAULT_RANKING_CONFIG.weights.evidence;
          ranked.push({ ...s, rationale, rank: 0, scores: { relevance, authority, recency, evidence, final } });
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "scored", index: i + 1, total: sources.length, source: s.title, score: Number(final.toFixed(2)) })}\n\n`));
        }
        ranked.sort((a, b) => b.scores.final - a.scores.final).forEach((r, idx) => { r.rank = idx + 1; });
        const top = ranked.slice(0, DEFAULT_RANKING_CONFIG.topN);
        sessionStore.update(sessionId, { rankedSources: top, status: "verifying" });
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "done", ranked: top })}\n\n`));
      } catch {
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "error", error: "Ranking failed" })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
}
