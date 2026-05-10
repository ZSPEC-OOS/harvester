import type { CandidateSource } from "@/types/research";

const authorText = (a: string[]) =>
  a.length === 0 ? "Unknown" :
  a.length === 1 ? a[0] :
  a.length === 2 ? `${a[0]} & ${a[1]}` :
  `${a[0]} et al.`;

const linkFor = (s: CandidateSource): string =>
  s.doi ? ` https://doi.org/${s.doi}` : s.url ? ` ${s.url}` : "";

export function formatApa(s: CandidateSource): string {
  const y = s.year ?? "n.d.";
  const j = s.journal ? ` ${s.journal}.` : "";
  const d = linkFor(s);
  return `${authorText(s.authors)} (${y}). ${s.title}.${j}${d}`.trim();
}

export function formatMla(s: CandidateSource): string {
  const y = s.year ? `, ${s.year}` : "";
  const j = s.journal ? `, ${s.journal}` : "";
  const d = s.doi ? `, https://doi.org/${s.doi}` : s.url ? `, ${s.url}` : "";
  return `${authorText(s.authors)}. "${s.title}."${j}${y}${d}.`;
}
