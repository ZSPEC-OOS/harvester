"use client";

import { useEffect, useState } from "react";
import type { SessionSummary } from "@/types/research";
import { SessionCard } from "./SessionCard";

export function SessionList({ userId, projectId, limit = 10 }: { userId: string; projectId?: string; limit?: number }) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ userId, limit: String(limit) });
    if (projectId) params.set("projectId", projectId);
    fetch(`/api/sessions?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setSessions(d))
      .finally(() => setLoading(false));
  }, [userId, projectId, limit]);

  if (loading) return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded bg-ds-border/50" />)}</div>;
  if (!sessions.length) return <p className="text-sm text-ds-muted">No sessions yet.</p>;

  return <div className="space-y-2">{sessions.map((s) => <SessionCard key={s.id} session={s} />)}</div>;
}
