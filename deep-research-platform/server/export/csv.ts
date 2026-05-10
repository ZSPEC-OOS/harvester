import { stringify } from "csv-stringify/sync";
import type { ExportSession, RankedSource } from "./types";

const HEADER = ["Rank","Title","Authors","Year","Journal","DOI","URL","Type","Provider","Relevance","Authority","Recency","Evidence","Final Score","Rationale"];

export function buildCsvExport(session: ExportSession): string {
  const sources = ((session.rankedSources as RankedSource[]) ?? []).map((s, i) => [
    s.rank ?? i + 1,
    s.title ?? "",
    (s.authors ?? []).join("; "),
    s.year ?? "",
    s.journal ?? "",
    s.doi ?? "",
    s.url ?? "",
    s.sourceType ?? "",
    s.provider ?? "",
    s.scores?.relevance ?? "",
    s.scores?.authority ?? "",
    s.scores?.recency ?? "",
    s.scores?.evidence ?? "",
    s.scores?.final ?? "",
    s.rationale ?? "",
  ]);

  return stringify([HEADER, ...sources]);
}
