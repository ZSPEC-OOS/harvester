import type { CandidateSource } from "@/types/research";

export interface RawSearchResult {
  title?: string | null;
  authors?: string[];
  year?: number | null;
  journal?: string | null;
  doi?: string | null;
  url?: string | null;
  abstract?: string | null;
  sourceType?: CandidateSource["sourceType"];
}

export function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

export function deduplicateSources(sources: CandidateSource[]): CandidateSource[] {
  const byDoi = new Map<string, CandidateSource>();
  const byTitle = new Map<string, CandidateSource>();
  const unique: CandidateSource[] = [];

  for (const source of sources) {
    const doi = source.doi?.toLowerCase().trim();
    if (doi) {
      if (byDoi.has(doi)) continue;
      byDoi.set(doi, source);
    }

    const titleKey = normalizeTitle(source.title);
    if (titleKey) {
      if (byTitle.has(titleKey)) continue;
      byTitle.set(titleKey, source);
    }

    unique.push(source);
  }

  return unique;
}
