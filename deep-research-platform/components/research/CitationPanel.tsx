"use client";

import type { VerifiedCitation } from "@/lib/ranking/types";
import { GlassCard } from "@/components/ui/GlassCard";

export function CitationPanel({ citations, citationStyle }: { citations: VerifiedCitation[]; citationStyle: "apa" | "mla" }) {
  return (
    <GlassCard className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Verified Bibliography</h3>
        <span className="rounded-full border border-ds-border px-2 py-0.5 text-xs text-ds-muted">{citations.length}</span>
      </div>
      <div className="space-y-3 text-xs">
        {citations.map((c, idx) => (
          <article key={c.sourceId} className="rounded-lg border border-ds-border/70 bg-black/20 p-3">
            <p><span className="font-semibold text-blue-300">[{idx + 1}]</span> {citationStyle === "mla" ? c.mla : c.apa}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded border border-ds-border px-1.5 py-0.5 text-[10px]">Confidence {Math.round(c.confidence * 100)}%</span>
              {c.doi ? <a href={`https://doi.org/${c.doi}`} target="_blank" rel="noreferrer" className="text-blue-300 underline">DOI</a> : <span className="text-yellow-300">⚠ No DOI</span>}
              {c.warnings.map((w) => <span key={w} className="text-yellow-300">⚠ {w}</span>)}
            </div>
          </article>
        ))}
      </div>
    </GlassCard>
  );
}
