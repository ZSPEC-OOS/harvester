import { RawSearchResult } from "@/lib/search/types";
import type { CandidateSource } from "@/types/research";

export function toCandidateSource(raw: RawSearchResult): CandidateSource | null {
  const title = raw.title?.trim();
  const url = raw.url?.trim();
  if (!title || !url) return null;

  return {
    id: crypto.randomUUID(),
    title,
    authors: (raw.authors ?? []).map((a) => a.trim()).filter(Boolean).slice(0, 20),
    year: raw.year ?? null,
    journal: raw.journal?.trim() ?? "",
    doi: raw.doi?.trim().replace(/^https?:\/\/doi.org\//i, "") ?? null,
    url,
    sourceType: raw.sourceType ?? "web",
  };
}
