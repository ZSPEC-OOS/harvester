import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { deduplicateSources } from "@/lib/search/types";
import { searchCrossRef } from "@/server/search/crossref";
import { toCandidateSource } from "@/server/search/source-normalizer";
import { searchSerper } from "@/server/search/web-search";
import { logUsageEvent } from "@/lib/ai/usage";
import { SEARCH_COST_PER_QUERY_USD } from "@/lib/ai/cost";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(_req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await prisma.researchSession.findUnique({ where: { id: sessionId } });
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const rateLimit = enforceRateLimit(session.userId, "steps");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: rateLimit.headers });
  }

  const queries = ((session.plan as { searchQueries?: string[] } | null)?.searchQueries ?? []).filter(Boolean);
  if (queries.length === 0) return NextResponse.json({ error: "No search queries in plan" }, { status: 400 });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const all: ReturnType<typeof toCandidateSource>[] = [];
      const unique: Exclude<ReturnType<typeof toCandidateSource>, null>[] = [];

      try {
        for (let i = 0; i < queries.length; i += 1) {
          const query = queries[i];
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "log", message: `Query ${i + 1}/${queries.length}: ${query}` })}\n\n`));

          const [serper, crossref] = await Promise.all([searchSerper(query), searchCrossRef(query)]);
          await logUsageEvent({
            userId: session.userId,
            sessionId,
            eventType: "search_query",
            provider: "serper",
            model: "web-search",
            costUsd: SEARCH_COST_PER_QUERY_USD,
            metadata: { query },
          });
          const normalized = [...serper, ...crossref].map(toCandidateSource).filter(Boolean);
          all.push(...normalized);

          const deduped = deduplicateSources(all.filter(Boolean) as Exclude<ReturnType<typeof toCandidateSource>, null>[]);
          const seen = new Set(unique.map((s) => s.id));
          for (const source of deduped) {
            if (seen.has(source.id)) continue;
            if (!unique.find((u) => (u.doi && source.doi && u.doi.toLowerCase() === source.doi.toLowerCase()) || u.title.toLowerCase() === source.title.toLowerCase())) {
              unique.push(source);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "source", source, counts: summarize(unique) })}\n\n`));
            }
          }

          await sleep(500);
        }

        await prisma.researchSession.update({ where: { id: sessionId }, data: { candidateSources: unique, status: "ranking" } });
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done", total: unique.length, counts: summarize(unique) })}\n\n`));
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: "Search failed" })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
}

function summarize(sources: Exclude<ReturnType<typeof toCandidateSource>, null>[]) {
  return {
    total: sources.length,
    journal: sources.filter((s) => s.sourceType === "journal").length,
    preprint: sources.filter((s) => s.sourceType === "preprint").length,
    web: sources.filter((s) => s.sourceType === "web").length,
  };
}
