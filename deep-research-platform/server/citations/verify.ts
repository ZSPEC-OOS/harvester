import { searchCrossRef } from "@/server/search/crossref";
import type { CandidateSource } from "@/types/research";

const DOI_RE=/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
const normalize=(s:string)=>s.toLowerCase().replace(/[^a-z0-9 ]/g,"").replace(/\s+/g," ").trim();

export async function verifyCitation(source: CandidateSource, seenDois:Set<string>) {
  const warnings:string[]=[]; let confidence=0.3;
  const doi = source.doi?.trim() ?? null;
  if (!doi) { warnings.push("No DOI provided"); confidence=0.5; }
  else if (!DOI_RE.test(doi)) warnings.push("Invalid DOI format");
  else {
    if (seenDois.has(doi.toLowerCase())) warnings.push("Duplicate DOI in session");
    seenDois.add(doi.toLowerCase());
    const hits = await searchCrossRef(`${source.title} ${doi}`);
    const m = hits[0];
    if (m) {
      const titleMatch = normalize(m.title ?? "")===normalize(source.title);
      const yearMatch = !!(m.year && source.year && Math.abs(m.year-source.year)<=1);
      const authorMatch = !!(m.authors?.[0] && source.authors.some((a)=>normalize(a).includes(normalize(m.authors![0]))));
      if (!titleMatch) warnings.push("Title mismatch vs CrossRef");
      if (!yearMatch) warnings.push("Year mismatch vs CrossRef");
      if (!authorMatch) warnings.push("Author mismatch vs CrossRef");
      confidence = titleMatch && yearMatch && authorMatch ? 1 : warnings.length ? 0.7 : 0.9;
    }
  }
  return { confidence, warnings };
}
