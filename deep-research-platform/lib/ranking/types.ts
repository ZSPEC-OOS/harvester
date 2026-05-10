import type { CandidateSource } from "@/types/research";
export interface SourceScores { relevance:number; authority:number; recency:number; evidence:number; final:number; }
export interface RankedSource extends CandidateSource { rank:number; rationale:string; scores:SourceScores; }
export interface VerifiedCitation { sourceId:string; title:string; doi:string|null; apa:string; mla:string; confidence:number; warnings:string[]; }
export interface RankingConfig { weights:{ relevance:number; authority:number; recency:number; evidence:number; }; topN:number; }
export const DEFAULT_RANKING_CONFIG: RankingConfig = { weights:{ relevance:0.4, authority:0.25, recency:0.15, evidence:0.2 }, topN:20 };
