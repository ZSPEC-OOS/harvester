"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SessionList } from "@/components/workspace/SessionList";
import { ActionCard } from "../cards/ActionCard";
import { ActiveSourcesCard } from "../cards/ActiveSourcesCard";
import { ApiConfigCard } from "../cards/ApiConfigCard";
import { ErrorBox } from "../cards/ErrorBox";
import { OutputCard } from "../cards/OutputCard";
import { ReferenceResultsCard } from "../cards/ReferenceResultsCard";
import { CitationPanel } from "./CitationPanel";
import { ReportViewer } from "./ReportViewer";
import { SearchConfigCard } from "../cards/SearchConfigCard";
import { ConsoleLog } from "../console/ConsoleLog";
import { CostMeter } from "@/components/sidebar/CostMeter";
import type { ApiConfig, CandidateSource, ResearchLogEntry, SearchConfig } from "@/types/research";
import type { VerifiedCitation } from "@/lib/ranking/types";
import type { SSEEvent } from "@/types/sse";

export function ResearchConsole() {
  const year = new Date().getFullYear();
  const [searchConfig, setSearchConfig] = useState<SearchConfig>({ topic: "", projectId: undefined, citationStyle: "apa", startYear: 2000, endYear: year, searchDepth: 50, includePreprints: true, excludePatents: true, onlyOpenAccess: false });
  const [userId, setUserId] = useState("");
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({ nickname: "", baseUrl: "https://api.deepseek.com", modelId: "deepseek-chat", apiKey: "" });
  const [logs, setLogs] = useState<ResearchLogEntry[]>([]);
  const [sources, setSources] = useState<CandidateSource[]>([]);
  const [counts, setCounts] = useState({ total: 0, journal: 0, preprint: 0, web: 0 });
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState("");
  const [citations, setCitations] = useState<VerifiedCitation[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem("ds_user_id") || "";
    setUserId(uid);
    if (uid) fetch(`/api/projects?userId=${uid}`).then((r) => r.json()).then((d) => setProjects(d));
  }, []);

  const log = (phase: ResearchLogEntry["phase"], message: string) => setLogs((p) => [...p, { id: crypto.randomUUID(), timestamp: new Date().toLocaleTimeString(), phase, message }]);
  const streamSse = async (url: string, onData: (payload: SSEEvent) => Promise<void> | void) => { const res = await fetch(url, { method: "POST", signal: controllerRef.current?.signal }); if (!res.body) throw new Error("No response stream"); const r = res.body.getReader(); const d = new TextDecoder(); let b = ""; while (true) { const { value, done } = await r.read(); if (done) break; b += d.decode(value, { stream: true }); const events = b.split("\n\n"); b = events.pop() || ""; for (const e of events) { if (!e.startsWith("data: ")) continue; await onData(JSON.parse(e.slice(6)) as SSEEvent); } } };

  const handleRun = async () => {
    if (!searchConfig.topic.trim()) return;
    setError(""); setOutput(""); setReport(""); setCitations([]); setSources([]); setCounts({ total: 0, journal: 0, preprint: 0, web: 0 }); setIsRunning(true); controllerRef.current = new AbortController();
    try {
      if (!userId) throw new Error("User not initialized.");
      const createRes = await fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, topic: searchConfig.topic, citationStyle: searchConfig.citationStyle, depthLevel: searchConfig.searchDepth > 70 ? "deep" : "standard", dateRangeStart: searchConfig.startYear, dateRangeEnd: searchConfig.endYear, sourceCount: Math.max(10, Math.round(searchConfig.searchDepth / 5)), projectId: searchConfig.projectId }) });
      const created = await createRes.json(); if (!createRes.ok) throw new Error(created.error); const sid = created.sessionId as string; setSessionId(sid);
      log("search", "Generating research plan..."); await streamSse(`/api/research/${sid}/plan`, (p) => { if (p.chunk) setOutput((o) => o + p.chunk); if (p.error) throw new Error(p.error); });
      log("search", "Starting source retrieval..."); await streamSse(`/api/research/${sid}/search`, (p) => { if (p.type === "log") log("search", p.message); if (p.type === "source") { setSources((prev) => [...prev, p.source]); setCounts(p.counts); } if (p.type === "error") throw new Error(p.error); });
      log("synthesis", "Auto-ranking sources..."); await streamSse(`/api/research/${sid}/rank`, (p) => { if (p.type === "done") setSources(p.ranked); if (p.type === "error") throw new Error(p.error); });
      log("synthesis", "Verifying citations..."); await streamSse(`/api/research/${sid}/verify`, (p) => { if (p.type === "verified") setCitations((prev) => [...prev, p.item]); if (p.type === "error") throw new Error(p.error); });
      log("synthesis", "Generating research report..."); await streamSse(`/api/research/${sid}/synthesize`, (p) => { if (p.type === "token") setReport((r) => r + p.token); if (p.type === "error") throw new Error(p.error); });
    toast.success("Research completed.");
    } catch (e) { if ((e as Error).name !== "AbortError") { setError((e as Error).message); log("error", (e as Error).message); toast.error((e as Error).message); } } finally { setIsRunning(false); }
  };

  return <div className="grid gap-6 lg:grid-cols-4"><div className="space-y-4 lg:col-span-1"><SearchConfigCard config={searchConfig} onChange={setSearchConfig} onRun={handleRun} projects={projects} /><ApiConfigCard config={apiConfig} onChange={setApiConfig} /><ActionCard onRun={handleRun} onStop={() => { if (confirm("Stop the current research?")) controllerRef.current?.abort(); }} sessionId={sessionId} estimatedPapers={Math.max(25, searchConfig.searchDepth * 2)} isRunning={isRunning} disableRun={!searchConfig.topic.trim()} /><ActiveSourcesCard counts={counts} /></div><div className="space-y-4 lg:col-span-2">{error && <ErrorBox message={error} />}<ConsoleLog entries={logs} /><OutputCard output={output} isLoading={isRunning} /><ReportViewer report={report} isStreaming={isRunning} /><CitationPanel citations={citations} citationStyle={searchConfig.citationStyle as "apa" | "mla"} /><ReferenceResultsCard sources={sources} /></div><div className="lg:col-span-1 space-y-4">{userId && <CostMeter userId={userId} />}<div><h3 className="mb-2 text-sm font-semibold">Recent Sessions</h3>{userId ? <SessionList userId={userId} limit={10} /> : <p className="text-sm text-ds-muted">Initializing user...</p>}</div></div></div>;
}
