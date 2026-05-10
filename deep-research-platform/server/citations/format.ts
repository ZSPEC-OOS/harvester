import type { CandidateSource } from "@/types/research";

const authorText=(a:string[])=>a.length===0?"Unknown":a.length===1?a[0]:a.length===2?`${a[0]} & ${a[1]}`:`${a[0]} et al.`;
export function formatApa(s: CandidateSource){const y=s.year??"n.d."; const j=s.journal?` ${s.journal}.`:""; const d=s.doi?` https://doi.org/${s.doi}`:""; return `${authorText(s.authors)} (${y}). ${s.title}.${j}${d}`.trim();}
export function formatMla(s: CandidateSource){const y=s.year?`, ${s.year}`:""; const j=s.journal?`, ${s.journal}`:""; const d=s.doi?`, https://doi.org/${s.doi}`:""; return `${authorText(s.authors)}. "${s.title}."${j}${y}${d}.`;}
