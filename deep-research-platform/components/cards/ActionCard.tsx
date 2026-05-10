"use client";
import { Play, Square } from "lucide-react";
import { ExportMenu } from "../research/ExportMenu";
import { GlassCard } from "../ui/GlassCard";

export function ActionCard({ onRun, onStop, estimatedPapers, isRunning, disableRun, sessionId }:{onRun:()=>void;onStop:()=>void;estimatedPapers:number;isRunning:boolean;disableRun:boolean;sessionId:string|null;}){
  return <GlassCard className="p-4"><button onClick={isRunning?onStop:onRun} disabled={!isRunning&&disableRun} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 font-medium text-white shadow-glow disabled:opacity-50">{isRunning?<><Square size={14}/>Stop</>:<><Play size={14}/>Run DeepScholar</>}</button><ExportMenu sessionId={sessionId}/><p className="mt-2 text-center text-xs text-ds-muted">up to ~{estimatedPapers.toLocaleString()} references</p></GlassCard>;
}
