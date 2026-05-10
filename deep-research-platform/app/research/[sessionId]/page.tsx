import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ReportViewer } from "@/components/research/ReportViewer";
import { CitationPanel } from "@/components/research/CitationPanel";
import { ReRunButton } from "@/components/workspace/ReRunButton";

export default async function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await prisma.researchSession.findUnique({ where: { id: sessionId } });
  if (!session) return notFound();
  const citations = (session.verifiedCitations as any[] | null) ?? [];

  return <main className="min-h-screen bg-ds-bg p-6 text-ds-text"><div className="mx-auto mb-4 max-w-6xl"><ReRunButton config={{ topic: session.topic, citationStyle: session.citationStyle, depthLevel: session.depthLevel, dateRangeStart: session.dateRangeStart, dateRangeEnd: session.dateRangeEnd, sourceCount: session.sourceCount, projectId: session.projectId }} /></div><div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3"><div className="lg:col-span-2"><ReportViewer report={session.finalReport ?? ""} /></div><CitationPanel citations={citations as any} citationStyle={(session.citationStyle as "apa" | "mla") ?? "apa"} /></div></main>;
}
