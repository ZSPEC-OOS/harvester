"use client";
import { Eye, EyeOff, Cpu } from "lucide-react";
import { useState } from "react";
import type { ApiConfig } from "@/types/research";
import { GlassCard } from "../ui/GlassCard";

const inputCls = "input-recessed w-full rounded-lg px-3 py-2 text-sm";
const labelCls = "mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ds-muted";

export function ApiConfigCard({ config, onChange }: { config: ApiConfig; onChange: (next: ApiConfig) => void }) {
  const [showKey, setShowKey] = useState(false); const [testing,setTesting]=useState(false); const [status,setStatus]=useState<"ok"|"fail"|null>(null);
  const set=<K extends keyof ApiConfig>(key:K,val:ApiConfig[K])=>{onChange({...config,[key]:val}); setStatus(null);};
  const isConfigured=Boolean(config.baseUrl.trim()&&config.apiKey.trim());
  const testConnection=async()=>{ if(!isConfigured)return; setTesting(true); setStatus(null); try{ const r=await fetch(`${config.baseUrl.replace(/\/$/,"")}/models`,{headers:{Authorization:`Bearer ${config.apiKey}`}}); setStatus(r.ok?"ok":"fail"); }catch{ setStatus("fail"); } finally{setTesting(false);} };
  return <GlassCard className="p-4"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><Cpu size={14} className="text-ds-accent"/><h3 className="text-sm font-semibold">AI Provider</h3></div>{isConfigured&&<span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">Ready</span>}</div><div className="space-y-3"><div><label className={labelCls}>Nickname</label><input className={inputCls} value={config.nickname} onChange={(e)=>set("nickname",e.target.value)} /></div><div><label className={labelCls}>Base URL</label><input className={inputCls} value={config.baseUrl} onChange={(e)=>set("baseUrl",e.target.value)} /></div><div><label className={labelCls}>Model ID</label><input className={inputCls} value={config.modelId} onChange={(e)=>set("modelId",e.target.value)} /></div><div><label className={labelCls}>API Key</label><div className="relative"><input className={`${inputCls} pr-8`} type={showKey?"text":"password"} value={config.apiKey} onChange={(e)=>set("apiKey",e.target.value)} /><button type="button" onClick={()=>setShowKey(!showKey)} className="absolute right-2 top-2 text-ds-muted">{showKey?<EyeOff size={14}/>:<Eye size={14}/>}</button></div></div><div className="flex items-center gap-3"><button type="button" disabled={!isConfigured||testing} onClick={testConnection} className="rounded-md border border-ds-primary/40 bg-ds-primary/20 px-3 py-1.5 text-xs disabled:opacity-50">{testing?"Testing…":"Test Connection"}</button>{status==="ok"&&<span className="text-xs text-emerald-300">Connected ✓</span>}{status==="fail"&&<span className="text-xs text-rose-300">Failed</span>}</div></div></GlassCard>;
}
