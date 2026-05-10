"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Container } from "@/components/layout/Container";
import { UsageChart } from "@/components/settings/UsageChart";

type Key = { id: string; provider: string; modelId?: string | null; isDefault: boolean };

export default function SettingsPage() {
  const [tab, setTab] = useState<"keys" | "usage" | "prefs">("keys");
  const [userId, setUserId] = useState("");
  const [keys, setKeys] = useState<Key[]>([]);
  const [usage, setUsage] = useState<any>(null);
  const [apiKey, setApiKey] = useState("");
  const [modelId, setModelId] = useState("deepseek-chat");
  const [prefs, setPrefs] = useState({ citationStyle: "apa", depth: "standard", sourceCount: 20 });

  const loadKeys = (uid: string) => fetch(`/api/settings/api-keys?userId=${uid}`).then((r) => r.json()).then((d) => setKeys(d.keys ?? []));
  const loadUsage = (uid: string) => fetch(`/api/usage?userId=${uid}&days=30`).then((r) => r.json()).then(setUsage);
  useEffect(() => { const uid = localStorage.getItem("ds_user_id") || ""; setUserId(uid); if (uid) { loadKeys(uid); loadUsage(uid); } const stored = localStorage.getItem("ds_preferences"); if (stored) setPrefs(JSON.parse(stored)); }, []);

  return <main className="min-h-screen bg-ds-bg text-ds-text"><TopBar /><Container><div className="space-y-4"><h2 className="text-xl font-semibold">Settings</h2><div className="flex gap-2 text-sm"><button onClick={() => setTab("keys")} className="rounded border px-3 py-1">API Keys</button><button onClick={() => setTab("usage")} className="rounded border px-3 py-1">Usage</button><button onClick={() => setTab("prefs")} className="rounded border px-3 py-1">Preferences</button></div>{tab === "keys" && <div className="space-y-3 rounded-xl border p-4"><h3 className="font-semibold">Saved Keys</h3>{keys.map((k) => <div key={k.id} className="flex items-center justify-between"><span>{k.provider} · {k.modelId || "default"}</span><button onClick={async () => { await fetch(`/api/settings/api-keys/${k.id}`, { method: "DELETE" }); loadKeys(userId); }} className="text-red-300">Delete</button></div>)}<input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="New API key" className="w-full rounded border bg-transparent p-2" /><select value={modelId} onChange={(e) => setModelId(e.target.value)} className="w-full rounded border bg-transparent p-2"><option>deepseek-chat</option><option>deepseek-reasoner</option></select><button onClick={async () => { await fetch('/api/settings/api-keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, apiKey, modelId, provider: 'deepseek', isDefault: true }) }); setApiKey(""); loadKeys(userId); }} className="rounded bg-ds-primary px-3 py-2">Add Key</button></div>}{tab === "usage" && usage && <div className="rounded-xl border p-4"><p className="mb-3 text-sm text-ds-muted">30-day totals: ${usage.totals.costUsd.toFixed(4)} · {usage.totals.totalTokens.toLocaleString()} tokens · {usage.totals.calls} calls</p><UsageChart daily={usage.daily} /></div>}{tab === "prefs" && <div className="space-y-3 rounded-xl border p-4"><label className="block">Citation Style<select value={prefs.citationStyle} onChange={(e) => setPrefs((p) => ({ ...p, citationStyle: e.target.value }))} className="mt-1 w-full rounded border bg-transparent p-2"><option value="apa">APA</option><option value="mla">MLA</option></select></label><label className="block">Default Depth<select value={prefs.depth} onChange={(e) => setPrefs((p) => ({ ...p, depth: e.target.value }))} className="mt-1 w-full rounded border bg-transparent p-2"><option value="standard">Standard</option><option value="deep">Deep</option></select></label><label className="block">Source Count<input type="number" value={prefs.sourceCount} onChange={(e) => setPrefs((p) => ({ ...p, sourceCount: Number(e.target.value) }))} className="mt-1 w-full rounded border bg-transparent p-2" /></label><button onClick={() => localStorage.setItem("ds_preferences", JSON.stringify(prefs))} className="rounded bg-ds-primary px-3 py-2">Save Preferences</button></div>}</div></Container></main>;
}
