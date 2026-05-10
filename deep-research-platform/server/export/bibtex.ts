import type { ExportSession, RankedSource } from "./types";

function esc(value: string): string {
  return value.replace(/[{}\\]/g, "\\$&").replace(/&/g, "\\&");
}

function keyFor(source: RankedSource, i: number): string {
  const author = source.authors?.[0]?.split(" ").pop() ?? "source";
  const year = source.year ?? "nd";
  return `${author}${year}${i + 1}`.replace(/[^a-zA-Z0-9]/g, "");
}

function entryType(source: RankedSource): string {
  if (source.sourceType === "book") return "book";
  if (source.sourceType === "report") return "techreport";
  if (source.sourceType === "preprint") return "unpublished";
  if (source.sourceType === "journal") return "article";
  return "misc";
}

export function buildBibtexExport(session: ExportSession): string {
  const sources = (session.rankedSources as RankedSource[]) ?? [];
  return sources.map((s, i) => {
    const fields = [
      `  title = {${esc(s.title ?? "Untitled")}}`,
      s.authors?.length ? `  author = {${s.authors.map(esc).join(" and ")}}` : null,
      s.year ? `  year = {${s.year}}` : null,
      s.journal ? `  journal = {${esc(s.journal)}}` : null,
      s.doi ? `  doi = {${esc(s.doi)}}` : null,
      s.url ? `  url = {${esc(s.url)}}` : null,
    ].filter(Boolean);
    return `@${entryType(s)}{${keyFor(s, i)},\n${fields.join(",\n")}\n}`;
  }).join("\n\n");
}
