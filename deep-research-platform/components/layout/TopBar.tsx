"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Eye, EyeOff, LayoutDashboard, FolderOpen } from "lucide-react";

const PROVIDERS = [
  { label: "DeepSeek", baseUrl: "https://api.deepseek.com", models: ["deepseek-chat", "deepseek-reasoner"] },
  { label: "OpenAI", baseUrl: "https://api.openai.com/v1", models: ["gpt-4o", "gpt-4o-mini", "o3-mini", "o4-mini"] },
  { label: "Groq", baseUrl: "https://api.groq.com/openai/v1", models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"] },
  { label: "Ollama (local)", baseUrl: "http://localhost:11434/v1", models: ["llama3.2", "mistral", "phi4", "qwen2.5"] },
  { label: "Custom", baseUrl: "", models: [] },
];

const LS_API = "ds_api_config";
const LS_PREFS = "ds_preferences";
const inputCls = "input-recessed w-full rounded-lg px-3 py-2 text-sm";
const labelCls = "mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ds-muted";

export function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [apiStatus, setApiStatus] = useState("");
  const [prefsStatus, setPrefsStatus] = useState("");
  const [testing, setTesting] = useState(false);

  const [apiConfig, setApiConfig] = useState({
    provider: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    modelId: "deepseek-chat",
    apiKey: "",
  });

  const [prefs, setPrefs] = useState({
    citationStyle: "apa",
    depth: "standard",
    sourceCount: 20,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_API);
      if (saved) setApiConfig(JSON.parse(saved));
    } catch {}
    try {
      const saved = localStorage.getItem(LS_PREFS);
      if (saved) setPrefs(JSON.parse(saved));
    } catch {}
  }, []);

  const handleProviderChange = (label: string) => {
    const p = PROVIDERS.find((x) => x.label === label);
    if (!p) return;
    setApiConfig((c) => ({
      ...c,
      provider: label,
      baseUrl: p.baseUrl || c.baseUrl,
      modelId: p.models[0] ?? c.modelId,
    }));
    setApiStatus("");
  };

  const saveApiConfig = () => {
    localStorage.setItem(LS_API, JSON.stringify(apiConfig));
    setApiStatus("Saved ✓");
    setTimeout(() => setApiStatus(""), 2000);
  };

  const testConnection = async () => {
    if (!apiConfig.apiKey) return;
    setTesting(true);
    setApiStatus("Testing…");
    try {
      const r = await fetch("/api/settings/api-keys/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiConfig.apiKey, baseUrl: apiConfig.baseUrl, modelId: apiConfig.modelId }),
      });
      setApiStatus(r.ok ? "Connected ✓" : "Connection failed ✗");
    } catch {
      setApiStatus("Connection failed ✗");
    } finally {
      setTesting(false);
    }
  };

  const savePrefs = () => {
    localStorage.setItem(LS_PREFS, JSON.stringify(prefs));
    setPrefsStatus("Saved ✓");
    setTimeout(() => setPrefsStatus(""), 2000);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const selectedProvider = PROVIDERS.find((p) => p.label === apiConfig.provider) ?? PROVIDERS[0];
  const hasKey = Boolean(apiConfig.apiKey);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-ds-border/60 bg-ds-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-1.5 text-ds-muted transition-colors hover:bg-white/5 hover:text-ds-text"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-primary shadow-glow" />
            <h1 className="text-base font-semibold text-ds-text">DeepScholar</h1>
          </div>
          <span className="text-sm text-ds-muted">
            {isActive("/dashboard") && "Research"}
            {isActive("/projects") && "Projects"}
          </span>
          {!hasKey && (
            <button
              onClick={() => setOpen(true)}
              className="ml-auto rounded-md border border-yellow-500/40 bg-yellow-500/10 px-2.5 py-1 text-xs text-yellow-300 hover:bg-yellow-500/20"
            >
              Configure API key →
            </button>
          )}
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      <div
        className={`fixed left-0 top-0 z-40 flex h-full w-80 flex-col border-r border-ds-border/60 bg-[#080f1e] transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-ds-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-primary" />
            <span className="font-semibold text-ds-text">DeepScholar</span>
          </div>
          <button onClick={() => setOpen(false)} className="rounded p-1 text-ds-muted hover:text-ds-text">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
          <section>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ds-muted">Navigation</p>
            <nav className="space-y-0.5">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${isActive("/dashboard") ? "bg-ds-primary/20 text-blue-200" : "text-ds-muted hover:bg-white/5 hover:text-ds-text"}`}
              >
                <LayoutDashboard size={14} />
                Research
              </Link>
              <Link
                href="/projects"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${isActive("/projects") ? "bg-ds-primary/20 text-blue-200" : "text-ds-muted hover:bg-white/5 hover:text-ds-text"}`}
              >
                <FolderOpen size={14} />
                Projects
              </Link>
            </nav>
          </section>

          <hr className="border-ds-border/40" />

          <section>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-ds-muted">AI Provider</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Provider</label>
                <select className={inputCls} value={apiConfig.provider} onChange={(e) => handleProviderChange(e.target.value)}>
                  {PROVIDERS.map((p) => (
                    <option key={p.label}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Base URL</label>
                <input
                  className={inputCls}
                  value={apiConfig.baseUrl}
                  onChange={(e) => setApiConfig((c) => ({ ...c, baseUrl: e.target.value }))}
                  placeholder="https://api.example.com/v1"
                />
              </div>

              <div>
                <label className={labelCls}>Model</label>
                {selectedProvider.models.length > 0 ? (
                  <select
                    className={inputCls}
                    value={apiConfig.modelId}
                    onChange={(e) => setApiConfig((c) => ({ ...c, modelId: e.target.value }))}
                  >
                    {selectedProvider.models.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={inputCls}
                    value={apiConfig.modelId}
                    onChange={(e) => setApiConfig((c) => ({ ...c, modelId: e.target.value }))}
                    placeholder="model-name"
                  />
                )}
              </div>

              <div>
                <label className={labelCls}>API Key</label>
                <div className="relative">
                  <input
                    className={`${inputCls} pr-8`}
                    type={showKey ? "text" : "password"}
                    value={apiConfig.apiKey}
                    onChange={(e) => setApiConfig((c) => ({ ...c, apiKey: e.target.value }))}
                    placeholder="sk-…"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-2 top-2.5 text-ds-muted hover:text-ds-text"
                  >
                    {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={!apiConfig.apiKey || testing}
                  onClick={testConnection}
                  className="flex-1 rounded-md border border-ds-border/60 px-3 py-1.5 text-xs text-ds-muted hover:border-ds-primary/40 hover:text-ds-text disabled:opacity-40"
                >
                  {testing ? "Testing…" : "Test"}
                </button>
                <button
                  onClick={saveApiConfig}
                  className="flex-1 rounded-md border border-ds-primary/40 bg-ds-primary/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-ds-primary/30"
                >
                  Save
                </button>
              </div>
              {apiStatus && (
                <p className={`text-xs ${apiStatus.includes("✓") ? "text-emerald-400" : "text-red-400"}`}>
                  {apiStatus}
                </p>
              )}
            </div>
          </section>

          <hr className="border-ds-border/40" />

          <section>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-ds-muted">Preferences</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Citation Style</label>
                <select
                  className={inputCls}
                  value={prefs.citationStyle}
                  onChange={(e) => setPrefs((p) => ({ ...p, citationStyle: e.target.value }))}
                >
                  <option value="apa">APA</option>
                  <option value="mla">MLA</option>
                  <option value="chicago">Chicago</option>
                  <option value="vancouver">Vancouver</option>
                  <option value="doi-only">DOI-only</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Research Depth</label>
                <select
                  className={inputCls}
                  value={prefs.depth}
                  onChange={(e) => setPrefs((p) => ({ ...p, depth: e.target.value }))}
                >
                  <option value="shallow">Shallow (fast)</option>
                  <option value="standard">Standard</option>
                  <option value="deep">Deep (thorough)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Source Count</label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  className={inputCls}
                  value={prefs.sourceCount}
                  onChange={(e) => setPrefs((p) => ({ ...p, sourceCount: Number(e.target.value) }))}
                />
              </div>
              <button
                onClick={savePrefs}
                className="w-full rounded-md border border-ds-primary/40 bg-ds-primary/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-ds-primary/30"
              >
                Save Preferences
              </button>
              {prefsStatus && <p className="text-xs text-emerald-400">{prefsStatus}</p>}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
