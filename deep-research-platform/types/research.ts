export type ExportFormat = "txt" | "bibtex" | "ris";

export type CitationStyle = "apa" | "mla" | "chicago" | "vancouver" | "doi-only";

export type ResearchStatus = "idle" | "running" | "done" | "error";

export interface SearchConfig {
  topic: string;
  projectId?: string;
  citationStyle: CitationStyle;
  startYear: number;
  endYear: number;
  searchDepth: number;
  includePreprints: boolean;
  excludePatents: boolean;
  onlyOpenAccess: boolean;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  sessionCount: number;
  createdAt: string;
}

export interface SessionSummary {
  id: string;
  topic: string;
  status: string;
  createdAt: string;
  sourceCount: number;
  projectName: string | null;
}

export interface ApiConfig {
  nickname: string;
  baseUrl: string;
  modelId: string;
  apiKey: string;
}

export interface CandidateSource {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  journal: string;
  doi: string | null;
  url: string;
  sourceType: "journal" | "preprint" | "web" | "book" | "report";
  abstract?: string | null;
  rank?: number;
  rationale?: string;
  scores?: { relevance: number; authority: number; recency: number; evidence: number; final: number };
}


export interface ResearchLogEntry {
  id: string;
  timestamp: string;
  phase: "init" | "search" | "synthesis" | "export" | "error";
  message: string;
}

export interface ResearchPlan {
  status: ResearchStatus;
  estimatedPapers: number;
  steps: string[];
}
