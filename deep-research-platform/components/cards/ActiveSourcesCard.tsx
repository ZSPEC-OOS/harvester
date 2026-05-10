"use client";
import { BookOpen, FileText, Globe, Newspaper } from "lucide-react";
import type { CandidateSource } from "@/types/research";
import { GlassCard } from "../ui/GlassCard";

export function ActiveSourcesCard({ sources }:{sources:CandidateSource[]}){const journals=sources.filter(s=>s.sourceType==="journal").length; const preprints=sources.filter(s=>s.sourceType==="preprint").length; const web=sources.filter(s=>s.sourceType==="web").length; const stats=[{label:"Total",value:sources.length,icon:BookOpen},{label:"Journals",value:journals,icon:FileText},{label:"Preprints",value:preprints,icon:Newspaper},{label:"Web",value:web,icon:Globe}]; return <GlassCard className="p-4"><h3 className="mb-3 text-sm font-semibold">Active Sources</h3><div className="grid grid-cols-2 gap-2">{stats.map(s=><div key={s.label} className="rounded-lg border border-ds-border/70 bg-black/20 p-2"><s.icon size={13} className="mb-1 text-ds-muted"/><p className="text-lg font-semibold">{s.value}</p><p className="text-xs text-ds-muted">{s.label}</p></div>)}</div></GlassCard>;}
