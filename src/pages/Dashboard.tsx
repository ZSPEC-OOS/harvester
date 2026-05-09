import { useEffect, useMemo, useRef, useState } from 'react';
import { ActionCard } from '../components/cards/ActionCard';
import { ApiConfigCard, type ApiConfig } from '../components/cards/ApiConfigCard';
import { ErrorBox } from '../components/cards/ErrorBox';
import { OutputCard } from '../components/cards/OutputCard';
import { ReferenceResultsCard } from '../components/cards/ReferenceResultsCard';
import { SearchConfigCard } from '../components/cards/SearchConfigCard';
import { ActiveSourcesCard } from '../components/cards/ActiveSourcesCard';
import { WispConfigCard, type WispConfig } from '../components/cards/WispConfigCard';
import { ConsoleLog } from '../components/console/ConsoleLog';
import { GlassCard } from '../components/ui/GlassCard';
import { Container } from '../components/layout/Container';
import { TopBar } from '../components/layout/TopBar';
import { CacheStats } from '../components/sidebar/CacheStats';

type Settings = {
  topic: string;
  referenceStyle: string;
  startYear: number;
  endYear: number;
  searchDepth: number;
  includePreprints: boolean;
  excludePatents: boolean;
  onlyOpenAccess: boolean;
  externalAiEnabled: boolean;
  apiConfig: ApiConfig;
  wispConfig: WispConfig;
};

type WispPaper = {
  title: string;
  doi: string | null;
  authors: string[];
  publication_year: number | null;
  url: string;
  oa_pdf_url: string | null;
  provider: string;
};

const CURRENT_YEAR = new Date().getFullYear();

const initialSettings: Settings = {
  topic: '',
  referenceStyle: 'apa',
  startYear: 2000,
  endYear: CURRENT_YEAR,
  searchDepth: 12,
  includePreprints: true,
  excludePatents: true,
  onlyOpenAccess: false,
  externalAiEnabled: false,
  apiConfig: { nickname: '', baseUrl: '', modelId: '', apiKey: '' },
  wispConfig: { baseUrl: '', apiKey: '' },
};

const seedLines = ['[10:32:15] DeepScholar ready', '[10:32:28] Waiting for user action'];

const deepResearchProcess = [
  'Clarify objective and constraints',
  'Decompose topic into focused sub-questions',
  'Run broad discovery across enabled sources',
  'Refine and cross-validate high-signal evidence',
  'Synthesize, format, and stream references',
];

const styleLabelMap: Record<string, string> = {
  apa: 'APA',
  mla: 'MLA',
  chicago: 'Chicago',
  vancouver: 'Vancouver',
  'doi-only': 'DOI only',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const expandTopicLocally = (topic: string) => {
  const clean = topic.trim();
  if (!clean) return '';
  return [
    `Primary objective: Build a comprehensive deep-research map for "${clean}" that captures foundational work, current methods, real-world outcomes, and known limitations.`,
    'Scope expansion: include adjacent terminology, canonical synonyms, benchmark datasets, dominant methodological families, dissenting findings, and practical deployment constraints.',
    'Evidence strategy: prioritize primary literature, rigorous evaluations, replication studies, and the strongest comparative analyses across multiple independent sources.',
    'Output intent: produce a references-ready narrative that links key claims to evidence tiers, highlights consensus vs uncertainty, and surfaces actionable follow-up questions.',
  ].join('\n\n');
};

const buildMockReferences = (settings: Settings, expandedTopic: string, targetCount: number) => {
  const count = Math.max(0, Math.min(targetCount, 2500));
  const style = styleLabelMap[settings.referenceStyle] ?? settings.referenceStyle;

  return Array.from({ length: count }, (_, i) => {
    const year = settings.startYear + (i % (settings.endYear - settings.startYear + 1));
    const topicLead = expandedTopic.split('\n')[0].replace('Primary objective: ', '');
    const title = `Comprehensive study #${i + 1} on ${topicLead}`;
    const journal = `Journal of DeepScholar Synthesis ${((i % 18) + 1).toString().padStart(2, '0')}`;
    const doi = `10.${1200 + (i % 700)}/deep.${year}.${(i + 1).toString().padStart(5, '0')}`;

    if (settings.referenceStyle === 'doi-only') return `${i + 1}. ${doi}`;
    return `${i + 1}. [${style}] Rivera, A., Noor, K., & Patel, J. (${year}). ${title}. ${journal}. https://doi.org/${doi}`;
  });
};

const formatPaperCitation = (paper: WispPaper, index: number, style: string): string => {
  const authorStr =
    paper.authors.length > 0
      ? paper.authors.slice(0, 3).join(', ') + (paper.authors.length > 3 ? ', et al.' : '')
      : 'Unknown Author';
  const year = paper.publication_year ?? 'n.d.';
  const link = paper.doi ? `https://doi.org/${paper.doi}` : paper.url;

  switch (style) {
    case 'apa':
      return `${index}. ${authorStr} (${year}). ${paper.title}. ${link}`;
    case 'mla':
      return `${index}. ${authorStr}. "${paper.title}." ${year}. ${link}`;
    case 'chicago':
      return `${index}. ${authorStr}. "${paper.title}." ${year}. ${link}`;
    case 'vancouver':
      return `${index}. ${authorStr}. ${paper.title}. ${year}. Available from: ${link}`;
    case 'doi-only':
      return `${index}. ${paper.doi ?? paper.url}`;
    default:
      return `${index}. ${authorStr} (${year}). ${paper.title}. ${link}`;
  }
};

const fetchWispPapers = async (query: string, wisp: WispConfig): Promise<WispPaper[]> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (wisp.apiKey.trim()) headers['X-API-Key'] = wisp.apiKey;

  const res = await fetch(`${wisp.baseUrl.replace(/\/$/, '')}/v1/academic`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt: query, question: '', max_papers: 10 }),
  });

  if (!res.ok) throw new Error(`WISP ${res.status}`);
  const data = await res.json();
  return (data.papers ?? []) as WispPaper[];
};

const generateSubQueries = (topic: string, expandedTopic: string, count: number): string[] => {
  const lines = expandedTopic
    .split('\n')
    .map((l) => l.replace(/^[^:]+:\s*/, '').trim())
    .filter((l) => l.length > 20 && l.length < 400);

  const queries: string[] = [topic];
  for (const line of lines) {
    if (queries.length >= count) break;
    const sub = line.split('.')[0].trim();
    if (sub) queries.push(sub);
  }
  while (queries.length < count) queries.push(topic);
  return queries.slice(0, count);
};

const getEstimate = (settings: Settings) => {
  const yearSpan = Math.max(1, settings.endYear - settings.startYear + 1);
  const topicWordCount = settings.topic.trim().split(/\s+/).filter(Boolean).length;

  let estimate = Math.round(5.0 * settings.searchDepth * yearSpan * Math.max(1, topicWordCount * 0.9));

  if (settings.onlyOpenAccess) estimate = Math.round(estimate * 0.58);
  if (!settings.includePreprints) estimate = Math.round(estimate * 0.9);
  if (settings.excludePatents) estimate = Math.round(estimate * 0.95);

  return Math.max(0, estimate);
};

// ── Component ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('paper-harvester-settings');
    if (!saved) return initialSettings;
    const parsed = JSON.parse(saved);
    return {
      ...initialSettings,
      ...parsed,
      topic: '',
      apiConfig: { ...initialSettings.apiConfig, ...parsed.apiConfig },
      wispConfig: { ...initialSettings.wispConfig, ...parsed.wispConfig },
    };
  });

  const [expandedTopic, setExpandedTopic] = useState('');
  const [expandedTopicDraft, setExpandedTopicDraft] = useState('');
  const [expansionAccepted, setExpansionAccepted] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [references, setReferences] = useState<string[]>([]);
  const [lines, setLines] = useState(seedLines);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const timerRef = useRef<number | null>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('paper-harvester-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const stamp = () => new Date().toLocaleTimeString('en-US', { hour12: false });

  const wispConfigured = Boolean(settings.wispConfig.baseUrl.trim());
  const apiConfigured = Boolean(settings.apiConfig.baseUrl.trim() && settings.apiConfig.apiKey.trim());

  // Realistic estimate when WISP is active: ~7 unique papers per pass after dedup
  const wispEstimate = useMemo(
    () => (wispConfigured ? Math.min(settings.searchDepth * 7, 140) : null),
    [wispConfigured, settings.searchDepth],
  );
  const mockEstimate = useMemo(() => getEstimate(settings), [settings]);
  const displayEstimate = wispEstimate ?? mockEstimate;

  const validationError = useMemo(() => {
    if (!settings.topic.trim()) return 'Search Focus Topic is required.';
    if (!expandedTopic.trim() || !expansionAccepted) return 'Please process expansion and click Accept before running.';
    if (settings.startYear > settings.endYear) return 'Start year is later than end year.';
    if (settings.startYear < 1900 || settings.endYear > CURRENT_YEAR) return `Year range must be between 1900 and ${CURRENT_YEAR}.`;
    if (settings.externalAiEnabled && !apiConfigured && !wispConfigured)
      return 'External AI is enabled but no AI provider or WISP backend is configured.';
    return null;
  }, [expandedTopic, expansionAccepted, settings, apiConfigured, wispConfigured]);

  // ── Topic expansion ──────────────────────────────────────────────────────

  const processExpansion = async () => {
    if (!settings.topic.trim()) return;
    setIsExpanding(true);

    // 1. Try WISP /v1/research first
    if (wispConfigured) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (settings.wispConfig.apiKey.trim()) headers['X-API-Key'] = settings.wispConfig.apiKey;
      setLines((prev) => [...prev, `[${stamp()}] Calling WISP for topic expansion…`]);
      try {
        const res = await fetch(`${settings.wispConfig.baseUrl.replace(/\/$/, '')}/v1/research`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query: settings.topic.trim(),
            mode: 'concise',
            max_sources: 6,
            synthesis_mode: 'auto',
          }),
        });
        if (!res.ok) throw new Error(`WISP ${res.status}`);
        const data = await res.json();
        const content: string = data.detailed_report || data.final_answer || data.executive_summary || '';
        if (!content) throw new Error('Empty WISP response');
        setExpandedTopic(content);
        setExpandedTopicDraft(content);
        setExpansionAccepted(false);
        setLines((prev) => [
          ...prev,
          `[${stamp()}] Expansion received from WISP (${data.sources?.length ?? 0} sources, confidence ${((data.confidence_score ?? 0) * 100).toFixed(0)}%)`,
        ]);
        setIsExpanding(false);
        return;
      } catch (err) {
        setLines((prev) => [...prev, `[${stamp()}] WISP expansion failed: ${String(err)} — trying next option`]);
      }
    }

    // 2. Try configured OpenAI-compatible API
    if (settings.externalAiEnabled && apiConfigured) {
      const { baseUrl, apiKey, modelId, nickname } = settings.apiConfig;
      setLines((prev) => [...prev, `[${stamp()}] Calling ${nickname || 'AI API'} for topic expansion…`]);
      try {
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: modelId || 'gpt-4o',
            messages: [
              {
                role: 'system',
                content:
                  'You are a research assistant. Expand the given research topic into a comprehensive deep-research scope covering foundational work, current methods, adjacent terminology, dissenting findings, and actionable follow-up questions. Be concise and structured.',
              },
              { role: 'user', content: `Expand this research topic: "${settings.topic.trim()}"` },
            ],
            max_tokens: 600,
          }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        const content: string = data.choices?.[0]?.message?.content ?? '';
        if (!content) throw new Error('Empty response');
        setExpandedTopic(content);
        setExpandedTopicDraft(content);
        setExpansionAccepted(false);
        setLines((prev) => [...prev, `[${stamp()}] Expansion received from ${nickname || 'AI API'}`]);
        setIsExpanding(false);
        return;
      } catch (err) {
        setLines((prev) => [...prev, `[${stamp()}] AI API error: ${String(err)} — falling back to local expansion`]);
      }
    }

    // 3. Local mock expansion
    const next = expandTopicLocally(settings.topic);
    setExpandedTopic(next);
    setExpandedTopicDraft(next);
    setExpansionAccepted(false);
    setLines((prev) => [...prev, `[${stamp()}] Expansion generated locally`]);
    setIsExpanding(false);
  };

  // ── Harvest ──────────────────────────────────────────────────────────────

  const runHarvest = async () => {
    // Stop if already running
    if (isRunning) {
      cancelRef.current = true;
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRunning(false);
      setLines((prev) => [...prev, `[${stamp()}] Run cancelled by user`]);
      return;
    }

    if (validationError) {
      setLines((prev) => [...prev, `[${stamp()}] Cannot run: ${validationError}`]);
      return;
    }

    const finalTopic = expandedTopicDraft.trim() || expandedTopic;
    setExpandedTopic(finalTopic);
    setReferences([]);
    setActiveStep(0);
    cancelRef.current = false;
    setIsRunning(true);

    if (wispConfigured) {
      // ── Real WISP academic search ────────────────────────────────────────
      const passes = Math.min(settings.searchDepth, 20);
      const queries = generateSubQueries(settings.topic, finalTopic, passes);
      const seenDois = new Set<string>();
      let totalCount = 0;

      setLines((prev) => [...prev, `[${stamp()}] Starting WISP academic search — ${passes} passes across OpenAlex, arXiv, Semantic Scholar`]);

      for (let i = 0; i < queries.length; i++) {
        if (cancelRef.current) break;

        setActiveStep(Math.min(deepResearchProcess.length - 1, Math.floor((i / queries.length) * deepResearchProcess.length)));

        try {
          const papers = await fetchWispPapers(queries[i], settings.wispConfig);

          const newPapers = papers.filter((p) => {
            if (!p.doi) return true; // no DOI to dedup on, keep it
            if (seenDois.has(p.doi)) return false;
            seenDois.add(p.doi);
            return true;
          });

          if (newPapers.length > 0) {
            const formatted = newPapers.map((p, j) =>
              formatPaperCitation(p, totalCount + j + 1, settings.referenceStyle),
            );
            totalCount += newPapers.length;
            setReferences((prev) => [...prev, ...formatted]);

            const providers = [...new Set(newPapers.map((p) => p.provider))].join(', ');
            setLines((prev) => [
              ...prev,
              `[${stamp()}] Pass ${i + 1}/${passes}: +${newPapers.length} papers (${providers})`,
            ]);
          }
        } catch (err) {
          setLines((prev) => [...prev, `[${stamp()}] Pass ${i + 1} error: ${String(err)}`]);
        }
      }

      setActiveStep(deepResearchProcess.length - 1);
      setIsRunning(false);
      setLines((prev) => [
        ...prev,
        `[${stamp()}] ${cancelRef.current ? 'Stopped' : 'Complete'}: ${totalCount} unique papers`,
      ]);
    } else {
      // ── Mock generation (streaming via setInterval) ──────────────────────
      const events = [
        'Running deep research flow',
        `Expanded focus accepted for: "${settings.topic.trim()}"`,
        `Using style: ${styleLabelMap[settings.referenceStyle] ?? settings.referenceStyle}`,
        `Streaming references for year range ${settings.startYear}-${settings.endYear}`,
      ];

      const generated = buildMockReferences(settings, finalTopic, mockEstimate);
      let idx = 0;
      let eventIdx = 0;

      setLines((prev) => [...prev, `[${stamp()}] Starting DeepScholar run (mock mode — configure WISP for real results)`]);

      timerRef.current = window.setInterval(() => {
        const chunk = generated.slice(idx, idx + 12);
        if (chunk.length > 0) {
          setReferences((prev) => [...prev, ...chunk]);
          idx += chunk.length;
        }

        setActiveStep(
          Math.min(deepResearchProcess.length - 1, Math.floor((idx / Math.max(generated.length, 1)) * deepResearchProcess.length)),
        );

        if (eventIdx < events.length) {
          setLines((prev) => [...prev, `[${stamp()}] ${events[eventIdx]}`]);
          eventIdx += 1;
        }

        if (idx >= generated.length) {
          setIsRunning(false);
          setActiveStep(deepResearchProcess.length - 1);
          setLines((prev) => [
            ...prev,
            `[${stamp()}] Completed list with ${generated.length.toLocaleString()} mock references`,
          ]);
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      }, 350);
    }
  };

  // ── Export ───────────────────────────────────────────────────────────────

  const exportText = () => {
    const payload = [
      `Topic: ${settings.topic}`,
      '',
      'Expanded Topic:',
      expandedTopicDraft || expandedTopic,
      '',
      `Reference style: ${settings.referenceStyle}`,
      `Generated references: ${references.length}`,
      '',
      ...references,
    ].join('\n');

    const blob = new Blob([payload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deepscholar-export.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Main cards ────────────────────────────────────────────────────────────

  const cards = useMemo(
    () => (
      <div className="space-y-4">
        <GlassCard className="p-5">
          <h2 className="mb-3 text-base font-semibold text-white">Research Topic</h2>
          <input
            id="main-topic"
            value={settings.topic}
            onChange={(e) => {
              const topic = e.target.value;
              setSettings((s) => ({ ...s, topic }));
              setExpandedTopic('');
              setExpandedTopicDraft('');
              setExpansionAccepted(false);
            }}
            className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/40 focus:outline-none"
            placeholder="e.g. foundation models for protein design"
          />
          <button
            type="button"
            onClick={processExpansion}
            disabled={!settings.topic.trim() || isExpanding}
            className="mt-3 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isExpanding ? 'Processing…' : 'Process Expansion'}
          </button>

          {expandedTopic && (
            <div className="mt-4 space-y-3">
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-400">Expanded Scope</p>
                <textarea
                  value={expandedTopic}
                  readOnly
                  className="min-h-[110px] w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-xs leading-relaxed text-slate-300"
                />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-400">Refine (optional)</p>
                <textarea
                  value={expandedTopicDraft}
                  onChange={(e) => {
                    setExpandedTopicDraft(e.target.value);
                    setExpansionAccepted(false);
                  }}
                  className="min-h-[110px] w-full rounded-lg border border-white/15 bg-slate-900/60 px-4 py-3 text-xs leading-relaxed text-slate-100 focus:border-cyan-500/40 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setExpandedTopic(expandedTopicDraft.trim() || expandedTopic);
                  setExpansionAccepted(true);
                }}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  expansionAccepted
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                }`}
              >
                {expansionAccepted ? 'Accepted ✓' : 'Accept & Confirm'}
              </button>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="mb-3 text-base font-semibold text-white">Research Steps</h2>
          <div className="space-y-1.5">
            {deepResearchProcess.map((item, i) => {
              const isActive = isRunning && i === activeStep;
              const isDone = !isRunning && references.length > 0 && i <= activeStep;
              return (
                <div
                  key={item}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive ? 'bg-cyan-500/10 text-white' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      isActive ? 'animate-pulse bg-cyan-400' : isDone ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                  {item}
                </div>
              );
            })}
          </div>
        </GlassCard>

        <ReferenceResultsCard references={references} referenceStyle={settings.referenceStyle} isRunning={isRunning} />

        {validationError && (
          <ErrorBox
            message={validationError}
            onFix={() => {
              if (!settings.topic.trim()) return;
              if (!expandedTopic.trim()) { processExpansion(); return; }
              if (!expansionAccepted) { setExpansionAccepted(true); return; }
              if (settings.startYear > settings.endYear) { setSettings((s) => ({ ...s, endYear: s.startYear })); return; }
              if (settings.startYear < 1900 || settings.endYear > CURRENT_YEAR) {
                setSettings((s) => ({ ...s, startYear: initialSettings.startYear, endYear: initialSettings.endYear }));
                return;
              }
              if (settings.externalAiEnabled && !apiConfigured && !wispConfigured) {
                setSettingsMenuOpen(true);
              }
            }}
          />
        )}

        <ActionCard
          onRun={runHarvest}
          onExportText={exportText}
          estimatedPapers={displayEstimate}
          disableRun={Boolean(validationError)}
          isRunning={isRunning}
        />
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeStep, apiConfigured, displayEstimate, expandedTopic, expandedTopicDraft, expansionAccepted, isExpanding, isRunning, references, settings, validationError, wispConfigured],
  );

  return (
    <div className="min-h-screen bg-transparent text-white">
      <TopBar onMenuClick={() => setSettingsMenuOpen(true)} isRunning={isRunning} wispConfigured={wispConfigured} />
      <Container>
        <div className="relative grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,800px)_340px] xl:items-start">
          {cards}
          <aside className="hidden xl:sticky xl:top-24 xl:block">
            <CacheStats gatheredCount={references.length} targetCount={displayEstimate} />
          </aside>
        </div>

        <div className="mt-4 hidden xl:block">
          <ConsoleLog lines={lines} />
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#060913]/90 p-3 backdrop-blur-xl xl:hidden">
          <button
            onClick={runHarvest}
            disabled={Boolean(validationError)}
            className="w-full rounded-xl border border-violet-300/40 bg-gradient-to-r from-violet-500/80 to-indigo-500/80 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? 'Stop DeepScholar' : 'Run DeepScholar'}
          </button>
          <button onClick={() => setSheetOpen((v) => !v)} className="mt-2 w-full text-center text-sm text-slate-300">
            {sheetOpen ? 'Hide' : 'Show'} Progress + Log
          </button>
        </div>

        <div
          className={`fixed inset-x-0 bottom-20 z-30 max-h-[70vh] overflow-auto rounded-t-2xl border border-white/10 bg-[#060913]/95 p-3 transition-transform xl:hidden ${sheetOpen ? 'translate-y-0' : 'translate-y-[110%]'}`}
        >
          <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-slate-600" />
          <div className="space-y-3">
            <CacheStats gatheredCount={references.length} targetCount={displayEstimate} />
            <ConsoleLog lines={lines} />
          </div>
        </div>

        {settingsMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setSettingsMenuOpen(false)}>
            <div
              className="absolute left-0 top-0 h-full w-full max-w-sm overflow-y-auto border-r border-white/10 bg-[#060913] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#060913]/95 px-4 py-3 backdrop-blur">
                <h2 className="text-sm font-semibold text-white">Settings</h2>
                <button
                  type="button"
                  onClick={() => setSettingsMenuOpen(false)}
                  className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 p-4 pb-10">
                {/* Backends */}
                <p className="px-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Backends</p>
                <WispConfigCard
                  config={settings.wispConfig}
                  onChange={(wispConfig) => setSettings((s) => ({ ...s, wispConfig }))}
                />
                <ApiConfigCard
                  config={settings.apiConfig}
                  onChange={(apiConfig) => setSettings((s) => ({ ...s, apiConfig }))}
                />

                {/* Search */}
                <p className="px-0.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Search</p>
                <SearchConfigCard
                  topic={settings.topic}
                  setTopic={(topic) => setSettings((s) => ({ ...s, topic }))}
                  referenceStyle={settings.referenceStyle}
                  setReferenceStyle={(referenceStyle) => setSettings((s) => ({ ...s, referenceStyle }))}
                  startYear={settings.startYear}
                  setStartYear={(startYear) => setSettings((s) => ({ ...s, startYear }))}
                  endYear={settings.endYear}
                  setEndYear={(endYear) => setSettings((s) => ({ ...s, endYear }))}
                  searchDepth={settings.searchDepth}
                  setSearchDepth={(searchDepth) => setSettings((s) => ({ ...s, searchDepth }))}
                  includePreprints={settings.includePreprints}
                  setIncludePreprints={(includePreprints) => setSettings((s) => ({ ...s, includePreprints }))}
                  excludePatents={settings.excludePatents}
                  setExcludePatents={(excludePatents) => setSettings((s) => ({ ...s, excludePatents }))}
                  onlyOpenAccess={settings.onlyOpenAccess}
                  setOnlyOpenAccess={(onlyOpenAccess) => setSettings((s) => ({ ...s, onlyOpenAccess }))}
                />
                <ActiveSourcesCard estimatedPapers={displayEstimate} />

                {/* Output */}
                <p className="px-0.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Output</p>
                <OutputCard
                  expandedTopic={expandedTopic}
                  externalAiEnabled={settings.externalAiEnabled}
                  setExternalAiEnabled={(externalAiEnabled) => setSettings((s) => ({ ...s, externalAiEnabled }))}
                  apiConfigured={apiConfigured}
                  apiNickname={settings.apiConfig.nickname}
                />
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
