"use client";
import type { ResearchLogEntry } from "@/types/research";
import { GlassCard } from "../ui/GlassCard";
import { ScrollArea } from "../ui/scroll-area";

export function ConsoleLog({ entries }:{entries:ResearchLogEntry[]}){return <GlassCard className="p-4"><h3 className="mb-3 text-sm font-semibold">Console</h3><ScrollArea className="h-48 overflow-auto rounded-lg border border-ds-border/70 bg-black/25 p-3">{entries.length===0?<p className="text-sm text-ds-muted">Waiting to start research…</p>:<div className="space-y-2">{entries.map((e)=><div key={e.id} className="text-xs"><span className="mr-2 text-ds-muted">[{e.timestamp}]</span><span className="mr-2 rounded border border-ds-border px-1 py-0.5 uppercase text-[10px]">{e.phase}</span><span>{e.message}</span></div>)}</div>}</ScrollArea></GlassCard>;}
