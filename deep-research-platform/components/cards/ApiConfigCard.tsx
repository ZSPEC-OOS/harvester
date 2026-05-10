"use client";
import { Eye, EyeOff, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import type { ApiConfig } from "@/types/research";
import { GlassCard } from "../ui/GlassCard";

const inputCls = "input-recessed w-full rounded-lg px-3 py-2 text-sm";
const labelCls = "mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ds-muted";

export function ApiConfigCard({ config, onChange }: { config: ApiConfig; onChange: (next: ApiConfig) => void }) {
  const [showKey, setShowKey] = useState(false); const [testing,setTesting]=useState(false); const [status,setStatus]=useState<string>(""); const [saved,setSaved]=useState<any[]>([]);
  const set=<K extends keyof ApiConfig>(key:K,val:ApiConfig[K])=>{onChange({...config,[key]:val}); setStatus("");};
  const userId = typeof window !== "undefined" ? localStorage.getItem("ds_user_id") : null;
  const isConfigured=Boolean(config.apiKey.trim());

  const refresh = async () => { if(!userId) return; const r = await fetch(`/api/settings/api-keys?userId=${userId}`); if(r.ok){ const d = await r.json(); setSaved(d.keys||[]);} };
  useEffect(()=>{ void refresh(); },[]);

  const testConnection=async()=>{ if(!isConfigured)return; setTesting(true); setStatus(""); try{ const r=await fetch('/api/settings/api-keys/test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({apiKey:config.apiKey,baseUrl:config.baseUrl,modelId:config.modelId})}); setStatus(r.ok?"Connected ✓":"Failed"); } finally{setTesting(false);} };
  const saveKey=async()=>{ if(!userId||!config.apiKey.trim()) return; const r = await fetch('/api/settings/api-keys',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId,provider:'deepseek',apiKey:config.apiKey,modelId:config.modelId||'deepseek-chat',isDefault:true})}); setStatus(r.ok?"Saved ✓":"Save failed"); if(r.ok){ onChange({...config,apiKey:""}); await refresh(); } };

  return <GlassCard className="p-4"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><Cpu size={14} className="text-ds-accent"/><h3 className="text-sm font-semibold">AI Provider</h3></div></div><div className="space-y-3"><div><label className={labelCls}>Base URL</label><input className={inputCls} value={config.baseUrl} onChange={(e)=>set("baseUrl",e.target.value)} placeholder="https://api.deepseek.com"/></div><div><label className={labelCls}>Model ID</label><input className={inputCls} value={config.modelId} onChange={(e)=>set("modelId",e.target.value)} placeholder="deepseek-chat"/></div><div><label className={labelCls}>API Key</label><div className="relative"><input className={`${inputCls} pr-8`} type={showKey?"text":"password"} value={config.apiKey} onChange={(e)=>set("apiKey",e.target.value)} /><button type="button" onClick={()=>setShowKey(!showKey)} className="absolute right-2 top-2 text-ds-muted">{showKey?<EyeOff size={14}/>:<Eye size={14}/>}</button></div></div><div className="flex items-center gap-3"><button type="button" disabled={!isConfigured||testing} onClick={testConnection} className="rounded-md border border-ds-primary/40 bg-ds-primary/20 px-3 py-1.5 text-xs disabled:opacity-50">{testing?"Testing…":"Test"}</button><button type="button" disabled={!isConfigured} onClick={saveKey} className="rounded-md border border-ds-primary/40 bg-ds-primary/20 px-3 py-1.5 text-xs disabled:opacity-50">Save Key</button>{status&&<span className="text-xs text-ds-muted">{status}</span>}</div>{saved.length>0&&<p className="text-xs text-ds-muted">Saved keys: {saved.length}</p>}</div></GlassCard>;
}
