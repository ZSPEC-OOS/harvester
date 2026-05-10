"use client";

import type { SearchConfig } from "@/types/research";
import { SlidersHorizontal } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

const inputCls = "input-recessed w-full rounded-lg px-3 py-2 text-sm";
const labelCls = "mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ds-muted";

export function SearchConfigCard({ config, onChange, onRun, projects = [] }: { config: SearchConfig; onChange: (next: SearchConfig) => void; onRun?: () => void; projects?: Array<{ id: string; name: string }> }) {
  const set = <K extends keyof SearchConfig>(key: K, value: SearchConfig[K]) => onChange({ ...config, [key]: value });
  return <GlassCard className="p-4"><div className="mb-4 flex items-center gap-2"><SlidersHorizontal size={14} className="text-ds-primary" /><h3 className="text-sm font-semibold">Search Configuration</h3></div><div className="space-y-3"><div><label className={labelCls}>Topic</label><input className={inputCls} value={config.topic} onChange={(e)=>set("topic",e.target.value)} onKeyDown={(e)=>{ if(e.key==="Enter" && (e.ctrlKey || e.metaKey)){ e.preventDefault(); onRun?.(); } }} /><p className="mt-1 text-[11px] text-ds-muted">Tip: Press Ctrl+Enter (or ⌘+Enter on Mac) to run instantly.</p></div><div><label className={labelCls}>Project</label><select className={inputCls} value={config.projectId ?? ""} onChange={(e)=>set("projectId",e.target.value || undefined)}><option value="">No project</option>{projects.map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div><div><label className={labelCls}>Citation Style</label><select className={inputCls} value={config.citationStyle} onChange={(e)=>set("citationStyle",e.target.value as SearchConfig["citationStyle"])}><option value="apa">APA</option><option value="mla">MLA</option><option value="chicago">Chicago</option><option value="vancouver">Vancouver</option><option value="doi-only">DOI-only</option></select></div></div></GlassCard>;
}
