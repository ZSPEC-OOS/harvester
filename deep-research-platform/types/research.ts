export type ExportFormat = "txt" | "bibtex" | "ris";

export type CitationStyle = "apa" | "mla" | "chicago" | "vancouver" | "doi-only";

export type ResearchStatus = "idle" | "running" | "done" | "error";

export interface SearchConfig {
  topic: string;
  citationStyle: CitationStyle;
  startYear: number;
  endYear: number;
  searchDepth: number;
  includePreprints: boolean;
  excludePatents: boolean;
  onlyOpenAccess: boolean;
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
