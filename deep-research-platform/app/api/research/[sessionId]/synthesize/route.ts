import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProviderForUser } from "@/lib/ai/router";
import type { RankedSource, VerifiedCitation } from "@/lib/ranking/types";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { logUsageEvent } from "@/lib/ai/usage";
import { estimateTokensFromChars } from "@/lib/ai/cost";

function fillTemplate(t: string, vars: Record<string, string>) { return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v), t); }

export async function POST(_req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await prisma.researchSession.findUnique({ where: { id: sessionId } });
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const plan = (session.plan as Record<string, any> | null) ?? {};
  const ranked = (session.rankedSources as RankedSource[] | null) ?? [];
  const verified = (session.verifiedCitations as VerifiedCitation[] | null) ?? [];

  const [systemPrompt, userTemplate] = await Promise.all([
    readFile(join(process.cwd(), "prompts/synthesis.system.md"), "utf8"),
    readFile(join(process.cwd(), "prompts/synthesis.user.md"), "utf8"),
  ]);

  const sources = verified.map((v, i) => `[${i + 1}] ${(session.citationStyle === "mla" ? v.mla : v.apa)} | confidence=${Math.round(v.confidence * 100)}%`).join("\n");
  const questions = (plan.researchQuestions ?? []).map((q: string) => `- ${q}`).join("\n") || "- Explain core findings";
  const sections = (plan.expectedSections ?? ["Introduction", "Analysis", "Conclusion"]).map((s: string) => `- ${s}`).join("\n");

  const userPrompt = fillTemplate(userTemplate, {
    topic: session.topic,
    depthLevel: session.depthLevel,
    citationStyle: session.citationStyle,
    questions,
    sections,
    sources: `${sources}\n\nRanked source hints:\n${ranked.map((r, i) => `[${i + 1}] ${r.title}: ${r.abstract ?? ""}`).join("\n")}`,
  });

  const provider = await getProviderForUser(session.userId);
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      let report = "";
      try {
        for await (const token of provider.streamText(userPrompt, systemPrompt)) {
          report += token;
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "token", token })}\n\n`));
        }
        await prisma.researchSession.update({ where: { id: sessionId }, data: { finalReport: report, status: "complete" } });
        await logUsageEvent({
          userId: session.userId,
          sessionId,
          eventType: "synthesis_complete",
          provider: provider.provider,
          model: provider.model,
          promptTokens: estimateTokensFromChars(userPrompt.length + systemPrompt.length),
          completionTokens: estimateTokensFromChars(report.length),
        });
        await prisma.researchArtifact.create({ data: { sessionId, type: "final_report", format: "markdown", content: report } });
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "done", length: report.length })}\n\n`));
      } catch {
        await prisma.researchSession.update({ where: { id: sessionId }, data: { status: "failed" } });
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "error", error: "Synthesis failed" })}\n\n`));
      } finally { controller.close(); }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
}
