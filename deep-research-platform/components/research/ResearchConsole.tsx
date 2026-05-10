"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SessionList } from "@/components/workspace/SessionList";
import { ActionCard } from "../cards/ActionCard";
import { ActiveSourcesCard } from "../cards/ActiveSourcesCard";
import { ErrorBox } from "../cards/ErrorBox";
import { OutputCard } from "../cards/OutputCard";
import { ReferenceResultsCard } from "../cards/ReferenceResultsCard";
import { CitationPanel } from "./CitationPanel";
import { ReportViewer } from "./ReportViewer";
import { SearchConfigCard } from "../cards/SearchConfigCard";
import { ConsoleLog } from "../console/ConsoleLog";
import type { CandidateSource, ResearchLogEntry, SearchConfig } from "@/types/research";
import type { VerifiedCitation } from "@/lib/ranking/types";
import type { SSEEvent } from "@/types/sse";

export function ResearchConsole() {
  const year = new Date().getFullYear();
  const [searchConfig, setSearchConfig] = useState<SearchConfig>({
    topic: "",
    projectId: undefined,
    citationStyle: "apa",
    startYear: 2000,
    endYear: year,
    searchDepth: 50,
    includePreprints: true,
    excludePatents: true,
    onlyOpenAccess: false,
  });
  const [userId, setUserId] = useState("");
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [logs, setLogs] = useState<ResearchLogEntry[]>([]);
  const [sources, setSources] = useState<CandidateSource[]>([]);
  const [counts, setCounts] = useState({ total: 0, journal: 0, preprint: 0, web: 0 });
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState("");
  const [citations, setCitations] = useState<VerifiedCitation[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [noApiKey, setNoApiKey] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem("ds_user_id") || "";
    setUserId(uid);
    if (uid) {
      fetch(`/api/projects?userId=${uid}`)
        .then((r) => r.json())
        .then((d) => setProjects(Array.isArray(d) ? d : []));
    }
    try {
      const cfg = localStorage.getItem("ds_api_config");
      setNoApiKey(!cfg || !JSON.parse(cfg).apiKey);
    } catch {
      setNoApiKey(true);
    }
  }, []);

  const log = (phase: ResearchLogEntry["phase"], message: string) =>
    setLogs((p) => [...p, { id: crypto.randomUUID(), timestamp: new Date().toLocaleTimeString(), phase, message }]);

  const streamSse = async (url: string, onData: (payload: SSEEvent) => Promise<void> | void) => {
    const res = await fetch(url, { method: "POST", signal: controllerRef.current?.signal });
    if (!res.body) throw new Error("No response stream");
    const r = res.body.getReader();
    const d = new TextDecoder();
    let b = "";
    while (true) {
      const { value, done } = await r.read();
      if (done) break;
      b += d.decode(value, { stream: true });
      const events = b.split("\n\n");
      b = events.pop() || "";
      for (const e of events) {
        if (!e.startsWith("data: ")) continue;
        await onData(JSON.parse(e.slice(6)) as SSEEvent);
      }
    }
  };

  const handleRun = async () => {
    if (!searchConfig.topic.trim()) return;

    let apiCfg = { apiKey: "", baseUrl: "https://api.deepseek.com", modelId: "deepseek-chat" };
    try {
      const stored = localStorage.getItem("ds_api_config");
      if (stored) apiCfg = { ...apiCfg, ...JSON.parse(stored) };
    } catch {}

    if (!apiCfg.apiKey) {
      setError("No API key configured. Open the ≡ menu to add your key.");
      return;
    }

    setError("");
    setOutput("");
    setReport("");
    setCitations([]);
    setSources([]);
    setCounts({ total: 0, journal: 0, preprint: 0, web: 0 });
    setIsRunning(true);
    controllerRef.current = new AbortController();

    try {
      if (!userId) throw new Error("User not initialized.");
      const createRes = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          topic: searchConfig.topic,
          citationStyle: searchConfig.citationStyle,
          depthLevel: searchConfig.searchDepth > 70 ? "deep" : "standard",
          dateRangeStart: searchConfig.startYear,
          dateRangeEnd: searchConfig.endYear,
          sourceCount: Math.max(10, Math.round(searchConfig.searchDepth / 5)),
          projectId: searchConfig.projectId,
          apiKey: apiCfg.apiKey,
          baseUrl: apiCfg.baseUrl || "https://api.deepseek.com",
          modelId: apiCfg.modelId || "deepseek-chat",
        }),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created.error);
      const sid = created.sessionId as string;
      setSessionId(sid);

      log("search", "Generating research plan...");
      await streamSse(`/api/research/${sid}/plan`, (p) => {
        if ("error" in p && p.error) throw new Error(p.error as string);
      });

      log("search", "Starting source retrieval...");
      await streamSse(`/api/research/${sid}/search`, (p) => {
        if (p.type === "log") log("search", p.message);
        if (p.type === "source") { setSources((prev) => [...prev, p.source as CandidateSource]); setCounts(p.counts); }
        if (p.type === "error") throw new Error(p.error);
      });

      log("synthesis", "Auto-ranking sources...");
      await streamSse(`/api/research/${sid}/rank`, (p) => {
        if (p.type === "done") setSources(p.ranked as CandidateSource[]);
        if (p.type === "error") throw new Error(p.error);
      });

      log("synthesis", "Verifying citations...");
      await streamSse(`/api/research/${sid}/verify`, (p) => {
        if (p.type === "verified") setCitations((prev) => [...prev, p.item as VerifiedCitation]);
        if (p.type === "error") throw new Error(p.error);
      });

      log("synthesis", "Generating research report...");
      await streamSse(`/api/research/${sid}/synthesize`, (p) => {
        if (p.type === "token") setReport((r) => r + p.token);
        if (p.type === "error") throw new Error(p.error);
      });

      toast.success("Research completed.");
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message);
        log("error", (e as Error).message);
        toast.error((e as Error).message);
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="space-y-4 lg:col-span-1">
        {noApiKey && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2.5 text-xs text-yellow-300">
            No API key — open the <strong>≡</strong> menu to configure your AI provider.
          </div>
        )}
        <SearchConfigCard config={searchConfig} onChange={setSearchConfig} onRun={handleRun} projects={projects} />
        <ActionCard
          onRun={handleRun}
          onStop={() => { if (confirm("Stop the current research?")) controllerRef.current?.abort(); }}
          sessionId={sessionId}
          estimatedPapers={Math.max(25, searchConfig.searchDepth * 2)}
          isRunning={isRunning}
          disableRun={!searchConfig.topic.trim() || noApiKey}
        />
        <ActiveSourcesCard counts={counts} />
      </div>
      <div className="space-y-4 lg:col-span-2">
        {error && <ErrorBox message={error} />}
        <ConsoleLog entries={logs} />
        <OutputCard output={output} isLoading={isRunning} />
        <ReportViewer report={report} isStreaming={isRunning} />
        <CitationPanel citations={citations} citationStyle={searchConfig.citationStyle as "apa" | "mla"} />
        <ReferenceResultsCard sources={sources} />
      </div>
      <div className="space-y-4 lg:col-span-1">
        <h3 className="text-sm font-semibold">Recent Sessions</h3>
        {userId ? (
          <SessionList userId={userId} limit={10} />
        ) : (
          <p className="text-sm text-ds-muted">Initializing…</p>
        )}
      </div>
    </div>
  );
}
