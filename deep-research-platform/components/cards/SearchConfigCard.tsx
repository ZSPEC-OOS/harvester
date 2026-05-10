"use client";

import type { SearchConfig } from "@/types/research";
import { SlidersHorizontal } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

const inputCls = "input-recessed w-full rounded-lg px-3 py-2 text-sm";
const labelCls = "mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ds-muted";

export function SearchConfigCard({ config, onChange }: { config: SearchConfig; onChange: (next: SearchConfig) => void }) {
  const set = <K extends keyof SearchConfig>(key: K, value: SearchConfig[K]) => onChange({ ...config, [key]: value });
  return <GlassCard className="p-4"><div className="mb-4 flex items-center gap-2"><SlidersHorizontal size={14} className="text-ds-primary" /><h3 className="text-sm font-semibold">Search Configuration</h3></div><div className="space-y-3"><div><label className={labelCls}>Topic</label><input className={inputCls} value={config.topic} onChange={(e)=>set("topic",e.target.value)} /></div><div><label className={labelCls}>Citation Style</label><select className={inputCls} value={config.citationStyle} onChange={(e)=>set("citationStyle",e.target.value as SearchConfig["citationStyle"])}><option value="apa">APA</option><option value="mla">MLA</option><option value="chicago">Chicago</option><option value="vancouver">Vancouver</option><option value="doi-only">DOI-only</option></select></div><div className="grid grid-cols-2 gap-2"><div><label className={labelCls}>Start Year</label><input type="number" className={inputCls} value={config.startYear} onChange={(e)=>set("startYear",Number(e.target.value))} /></div><div><label className={labelCls}>End Year</label><input type="number" className={inputCls} value={config.endYear} onChange={(e)=>set("endYear",Number(e.target.value))} /></div></div><div><div className="mb-1 flex items-center justify-between"><label className={labelCls}>Search Breadth</label><span className="text-xs text-ds-muted">{config.searchDepth} passes</span></div><input type="range" min={1} max={500} className="w-full" value={config.searchDepth} onChange={(e)=>set("searchDepth",Number(e.target.value))} /></div><div className="grid grid-cols-3 gap-2 text-xs"><label><input type="checkbox" checked={config.includePreprints} onChange={(e)=>set("includePreprints",e.target.checked)} /> Preprints</label><label><input type="checkbox" checked={config.excludePatents} onChange={(e)=>set("excludePatents",e.target.checked)} /> No patents</label><label><input type="checkbox" checked={config.onlyOpenAccess} onChange={(e)=>set("onlyOpenAccess",e.target.checked)} /> Open access</label></div></div></GlassCard>;
}
