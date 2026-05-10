import type { CandidateSource } from "@/types/research";

const clamp = (v: number) => Math.max(0, Math.min(10, v));

export function scoreAuthority(source: CandidateSource): number {
  let s = 2;
  if (source.sourceType === "journal") s += 4;
  else if (source.sourceType === "preprint") s += 2.5;
  else if (source.sourceType === "report") s += 2;
  else if (source.sourceType === "book") s += 1.5;
  if (source.doi) s += 2;
  s += Math.min(2, (source.authors?.length ?? 0) * 0.25);
  return clamp(s);
}

export function scoreRecency(year: number | null, currentYear = new Date().getFullYear()): number {
  if (!year) return 3;
  const age = Math.max(0, currentYear - year);
  return clamp(10 * Math.exp(-0.055 * age));
}

export function scoreEvidence(source: CandidateSource): number {
  let s = 1.5;
  const n = source.abstract?.length ?? 0;
  if (n > 400) s += 4;
  else if (n > 150) s += 3;
  else if (n > 40) s += 1.5;
  if (source.doi) s += 2;
  if ((source.authors?.length ?? 0) >= 3) s += 1.5;
  return clamp(s);
}
