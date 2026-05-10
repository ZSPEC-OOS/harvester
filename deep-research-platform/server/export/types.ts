export type ExportFormat = "markdown" | "bibtex" | "json" | "csv" | "docx" | "pdf";

export interface RankedSource {
  title?: string;
  authors?: string[];
  year?: number | null;
  journal?: string;
  doi?: string | null;
  url?: string;
  sourceType?: string;
  provider?: string;
  rationale?: string;
  rank?: number;
  scores?: {
    relevance?: number;
    authority?: number;
    recency?: number;
    evidence?: number;
    final?: number;
  };
}

export interface ExportSession {
  id: string;
  topic: string;
  status: string;
  citationStyle: string;
  createdAt: Date;
  updatedAt: Date;
  finalReport: string | null;
  plan: unknown;
  candidateSources: unknown;
  rankedSources: unknown;
  verifiedCitations: unknown;
}
