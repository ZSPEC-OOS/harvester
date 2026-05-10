import type { ExportSession } from "./types";

export function buildPdfPlaceholder(session: ExportSession): string {
  return `<!doctype html><html><head><meta charset=\"utf-8\"><title>${session.topic}</title></head><body><h1>${session.topic}</h1><p><em>PDF export placeholder (HTML output for post-MVP PDF rendering).</em></p><article>${(session.finalReport ?? "No report available.").replace(/\n/g, "<br/>")}</article></body></html>`;
}
