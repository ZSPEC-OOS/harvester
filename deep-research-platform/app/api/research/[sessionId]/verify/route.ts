import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { RankedSource, VerifiedCitation } from "@/lib/ranking/types";
import { verifyCitation } from "@/server/citations/verify";
import { formatApa, formatMla } from "@/server/citations/format";

export async function POST(_req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await prisma.researchSession.findUnique({ where: { id: sessionId } });
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const rateLimit = enforceRateLimit(session.userId, "steps");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: rateLimit.headers });
  }
  const ranked = (session.rankedSources as RankedSource[] | null) ?? [];
  const stream = new ReadableStream({ async start(controller){ const enc=new TextEncoder(); const out:VerifiedCitation[]=[]; const seen=new Set<string>(); try {
    for(let i=0;i<ranked.length;i+=1){ const s=ranked[i]; const result=await verifyCitation(s, seen); const item:VerifiedCitation={ sourceId:s.id,title:s.title,doi:s.doi??null,apa:formatApa(s),mla:formatMla(s),confidence:result.confidence,warnings:result.warnings}; out.push(item); controller.enqueue(enc.encode(`data: ${JSON.stringify({type:"verified",index:i+1,total:ranked.length,item})}\n\n`)); }
    await prisma.researchSession.update({ where:{id:sessionId}, data:{ verifiedCitations: out, status:"synthesizing" } }); controller.enqueue(enc.encode(`data: ${JSON.stringify({type:"done",total:out.length})}\n\n`));
  } catch { controller.enqueue(enc.encode(`data: ${JSON.stringify({type:"error",error:"Verification failed"})}\n\n`)); } finally { controller.close(); } }});
  return new Response(stream,{headers:{"Content-Type":"text/event-stream","Cache-Control":"no-cache",Connection:"keep-alive"}});
}
