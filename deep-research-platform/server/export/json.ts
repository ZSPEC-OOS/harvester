import type { ExportSession } from "./types";

export function buildJsonExport(session: ExportSession): string {
  return JSON.stringify(session, null, 2);
}
