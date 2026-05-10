"use client";
import { GlassCard } from "../ui/GlassCard";

export function OutputCard({ output, isLoading }:{output:string;isLoading:boolean}){return <GlassCard className="p-4"><div className="mb-3 flex items-center gap-2"><h3 className="text-sm font-semibold">Research Output</h3>{isLoading&&<span className="h-2 w-2 animate-pulse rounded-full bg-ds-accent"/>}</div>{output?<pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-ds-border/70 bg-black/20 p-3 text-xs">{output}</pre>:<p className="text-sm text-ds-muted">No output yet. Run DeepScholar to generate results.</p>}</GlassCard>;}
