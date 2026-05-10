"use client";

import { GlassCard } from "@/components/ui/GlassCard";

function renderInline(text: string) {
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((p, i) => /\[\d+\]/.test(p) ? <span key={i} className="text-blue-300 font-medium">{p}</span> : <span key={i}>{p}</span>);
}

export function ReportViewer({ report, isStreaming }: { report: string; isStreaming?: boolean }) {
  const lines = report.split("\n");
  return (
    <GlassCard className="p-4">
      <div className="mb-3 flex items-center gap-2"><h3 className="text-sm font-semibold">Research Report</h3>{isStreaming && <span className="h-2 w-2 animate-pulse rounded-full bg-ds-accent" />}</div>
      {!report ? <p className="text-sm text-ds-muted">No report yet.</p> : (
        <div className="space-y-2 text-sm leading-6">
          {lines.map((line, i) => {
            if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold">{renderInline(line.replace("### ", ""))}</h3>;
            if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold">{renderInline(line.replace("## ", ""))}</h2>;
            if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold">{renderInline(line.replace("# ", ""))}</h1>;
            if (!line.trim()) return <div key={i} className="h-2" />;
            return <p key={i}>{renderInline(line)}</p>;
          })}
        </div>
      )}
    </GlassCard>
  );
}
