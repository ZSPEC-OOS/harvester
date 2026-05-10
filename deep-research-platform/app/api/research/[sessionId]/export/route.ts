import { NextRequest, NextResponse } from "next/server";
import { sessionStore } from "@/lib/local-session-store";
import { buildMarkdownExport } from "@/server/export/markdown";
import { buildBibtexExport } from "@/server/export/bibtex";
import { buildJsonExport } from "@/server/export/json";
import { buildCsvExport } from "@/server/export/csv";
import { buildDocxExport } from "@/server/export/docx";
import { buildPdfPlaceholder } from "@/server/export/pdf";
import type { ExportFormat, ExportSession } from "@/server/export/types";
import { exportSchema } from "@/lib/validation";

function sanitizeFilename(topic: string): string {
  return topic.replace(/[^a-zA-Z0-9\s_-]/g, "").trim().replace(/\s+/g, "_").slice(0, 50) || "research";
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const body = await req.json();
  const parsed = exportSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  const { userId, format } = parsed.data as { userId: string; format: ExportFormat };

  const session = sessionStore.get(sessionId);
  if (!session || session.userId !== userId) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const exportableStatuses = new Set(["complete", "synthesizing", "verifying", "ranking"]);
  if (!exportableStatuses.has(session.status)) return NextResponse.json({ error: "Session is not ready for export" }, { status: 409 });

  const exportSession: ExportSession = {
    id: session.id,
    topic: session.topic,
    status: session.status,
    citationStyle: session.citationStyle,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    finalReport: session.finalReport ?? null,
    plan: session.plan,
    candidateSources: session.candidateSources,
    rankedSources: session.rankedSources,
    verifiedCitations: session.verifiedCitations,
  };

  const base = sanitizeFilename(session.topic);
  let data: string | Buffer;
  let mime = "text/plain";
  let suffix = "_report.txt";

  switch (format) {
    case "markdown": data = buildMarkdownExport(exportSession); mime = "text/markdown"; suffix = "_report.md"; break;
    case "bibtex": data = buildBibtexExport(exportSession); mime = "application/x-bibtex"; suffix = "_references.bib"; break;
    case "json": data = buildJsonExport(exportSession); mime = "application/json"; suffix = "_session.json"; break;
    case "csv": data = buildCsvExport(exportSession); mime = "text/csv"; suffix = "_evidence.csv"; break;
    case "docx": data = await buildDocxExport(exportSession); mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; suffix = "_report.docx"; break;
    case "pdf": data = buildPdfPlaceholder(exportSession); mime = "text/html"; suffix = "_report.html"; break;
    default: return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  }

  const responseBody = typeof data === "string" ? data : new Blob([Uint8Array.from(data)], { type: mime });
  return new NextResponse(responseBody, {
    headers: { "Content-Type": mime, "Content-Disposition": `attachment; filename="${base}${suffix}"` },
  });
}
