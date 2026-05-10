import type { CandidateSource } from "@/types/research";
import type { RankedSource, VerifiedCitation } from "@/lib/ranking/types";

export interface LocalSession {
  id: string;
  userId: string;
  topic: string;
  citationStyle: string;
  depthLevel: string;
  sourceCount: number;
  dateRangeStart?: number | null;
  dateRangeEnd?: number | null;
  projectId?: string | null;
  apiKey: string;
  baseUrl: string;
  modelId: string;
  status: string;
  plan?: Record<string, unknown>;
  candidateSources?: CandidateSource[];
  rankedSources?: RankedSource[];
  verifiedCitations?: VerifiedCitation[];
  finalReport?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const store = new Map<string, LocalSession>();

export const sessionStore = {
  create(input: Omit<LocalSession, "createdAt" | "updatedAt">): LocalSession {
    const now = new Date();
    const session: LocalSession = { ...input, createdAt: now, updatedAt: now };
    store.set(session.id, session);
    return session;
  },
  get(id: string): LocalSession | null {
    return store.get(id) ?? null;
  },
  update(id: string, patch: Partial<LocalSession>): LocalSession | null {
    const existing = store.get(id);
    if (!existing) return null;
    const updated: LocalSession = { ...existing, ...patch, updatedAt: new Date() };
    store.set(id, updated);
    return updated;
  },
  listByUser(userId: string, limit = 20): LocalSession[] {
    return Array.from(store.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },
};
