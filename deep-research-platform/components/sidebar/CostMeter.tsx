"use client";

import { useEffect, useState } from "react";

const BUDGET_USD = 5;

export function CostMeter({ userId }: { userId: string }) {
  const [stats, setStats] = useState<{ costUsd: number; totalTokens: number; calls: number } | null>(null);

  useEffect(() => {
    fetch(`/api/usage?userId=${userId}&days=30`).then((r) => r.json()).then((d) => setStats(d.totals));
  }, [userId]);

  if (!stats) return <div className="rounded-xl border border-ds-border p-4 text-sm text-ds-muted">Loading usage...</div>;
  const pct = Math.min(100, (stats.costUsd / BUDGET_USD) * 100);
  const color = pct < 60 ? "bg-emerald-500" : pct < 85 ? "bg-yellow-500" : "bg-red-500";

  return <div className="rounded-xl border border-ds-border p-4"><h3 className="text-sm font-semibold">30-Day Cost Meter</h3><p className="mt-2 text-2xl font-bold">${stats.costUsd.toFixed(2)}</p><p className="text-xs text-ds-muted">{stats.totalTokens.toLocaleString()} tokens • {stats.calls} calls</p><div className="mt-3 h-2 w-full rounded bg-ds-border"><div className={`h-2 rounded ${color}`} style={{ width: `${pct}%` }} /></div><p className="mt-1 text-xs text-ds-muted">Budget ${BUDGET_USD.toFixed(2)} · {pct.toFixed(0)}%</p></div>;
}
