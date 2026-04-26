import { useEffect, useMemo, useRef, useState } from 'react';
import { ActionCard } from '../components/cards/ActionCard';
import { ErrorBox } from '../components/cards/ErrorBox';
import { OutputCard } from '../components/cards/OutputCard';
import { ReferenceResultsCard } from '../components/cards/ReferenceResultsCard';
import { SearchConfigCard } from '../components/cards/SearchConfigCard';
import { SourceSelectionCard } from '../components/cards/SourceSelectionCard';
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
  sources: {
    crossref: boolean;
    scholar: boolean;
    pubmed: boolean;
    semantic: boolean;
  };
  externalAiEnabled: boolean;
  externalApiUrl: string;
  externalApiAttachment: string;
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
  sources: { crossref: true, scholar: true, pubmed: true, semantic: true },
  externalAiEnabled: false,
  externalApiUrl: '',
  externalApiAttachment: '',
};

const seedLines = ['[10:32:15] DeepScholar ready', '[10:32:28] Waiting for user action'];

const deepResearchProcess = [
  'Clarify objective and constraints',
  'Decompose topic into focused sub-questions',
  'Run broad discovery across enabled sources',
  'Refine and cross-validate high-signal evidence',
  'Synthesize, format, and stream references',
];

const sourceWeights = {
  crossref: 1.25,
  scholar: 1.4,
  pubmed: 1.15,
  semantic: 1.2,
} as const;

const styleLabelMap: Record<string, string> = {
  apa: 'APA',
  mla: 'MLA',
  chicago: 'Chicago',
  vancouver: 'Vancouver',
  'doi-only': 'DOI only',
};

const expandTopic = (topic: string) => {
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

    if (settings.referenceStyle === 'doi-only') {
      return `${i + 1}. ${doi}`;
    }

    return `${i + 1}. [${style}] Rivera, A., Noor, K., & Patel, J. (${year}). ${title}. ${journal}. https://doi.org/${doi}`;
  });
};

const getEstimate = (settings: Settings) => {
  const activeSources = Object.entries(settings.sources)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key as keyof Settings['sources']);

  const sourceScore = activeSources.reduce((sum, source) => sum + sourceWeights[source], 0);
  const yearSpan = Math.max(1, settings.endYear - settings.startYear + 1);
  const topicWordCount = settings.topic.trim().split(/\s+/).filter(Boolean).length;

  let estimate = Math.round(sourceScore * settings.searchDepth * yearSpan * Math.max(1, topicWordCount * 0.9));

  if (settings.onlyOpenAccess) estimate = Math.round(estimate * 0.58);
  if (!settings.includePreprints) estimate = Math.round(estimate * 0.9);
  if (settings.excludePatents) estimate = Math.round(estimate * 0.95);

  return Math.max(0, estimate);
};

export function Dashboard() {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('paper-harvester-settings');
    return saved ? { ...initialSettings, ...JSON.parse(saved), topic: '' } : initialSettings;
  });
  const [expandedTopic, setExpandedTopic] = useState('');
  const [expandedTopicDraft, setExpandedTopicDraft] = useState('');
  const [expansionAccepted, setExpansionAccepted] = useState(false);
  const [references, setReferences] = useState<string[]>([]);
  const [lines, setLines] = useState(seedLines);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('paper-harvester-settings', JSON.stringify(settings));
  }, [settings]);

  const estimatedPapers = useMemo(() => getEstimate(settings), [settings]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const validationError = useMemo(() => {
    if (!settings.topic.trim()) return 'Search Focus Topic is required.';
    if (!expandedTopic.trim() || !expansionAccepted) return 'Please process expansion and click Accept before running.';
    if (settings.startYear > settings.endYear) return 'Start year is later than end year.';
    if (settings.startYear < 1900 || settings.endYear > CURRENT_YEAR) return `Year range must be between 1900 and ${CURRENT_YEAR}.`;
    if (!Object.values(settings.sources).some(Boolean)) return 'At least one source must be enabled.';
    if (settings.externalAiEnabled && !settings.externalApiUrl.trim()) return 'External AI API URL is required when attachment mode is enabled.';
    return null;
  }, [expandedTopic, expansionAccepted, settings]);

  const processExpansion = () => {
    const next = expandTopic(settings.topic);
    setExpandedTopic(next);
    setExpandedTopicDraft(next);
    setExpansionAccepted(false);
    setLines((prev) => [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] Expansion generated for search focus topic`]);
  };

  const runHarvest = () => {
    if (isRunning) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRunning(false);
      setLines((prev) => [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] Run cancelled by user`]);
      return;
    }

    if (validationError) {
      setLines((prev) => [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] Cannot run: ${validationError}`]);
      return;
    }

    const finalExpandedTopic = expandedTopicDraft.trim() || expandedTopic;
    setExpandedTopic(finalExpandedTopic);
    setReferences([]);
    setActiveStep(0);

    const events = [
      'Running deep research flow',
      `Expanded focus accepted for: "${settings.topic.trim()}"`,
      `Using style: ${styleLabelMap[settings.referenceStyle] ?? settings.referenceStyle}`,
      `Selecting sources: ${Object.entries(settings.sources)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(', ')}`,
      `Streaming references for year range ${settings.startYear}-${settings.endYear}`,
    ];

    const generated = buildMockReferences(settings, finalExpandedTopic, estimatedPapers);
    let idx = 0;
    let eventIdx = 0;

    setIsRunning(true);
    setLines((prev) => [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] Starting DeepScholar run`]);

    timerRef.current = window.setInterval(() => {
      const chunkSize = 12;
      const chunk = generated.slice(idx, idx + chunkSize);
      if (chunk.length > 0) {
        setReferences((prev) => [...prev, ...chunk]);
        idx += chunk.length;
      }

      const step = Math.min(deepResearchProcess.length - 1, Math.floor((idx / Math.max(generated.length, 1)) * deepResearchProcess.length));
      setActiveStep(step);

      if (eventIdx < events.length) {
        const stamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        setLines((prev) => [...prev, `[${stamp}] ${events[eventIdx]}`]);
        eventIdx += 1;
      }

      if (idx >= generated.length) {
        setIsRunning(false);
        setActiveStep(deepResearchProcess.length - 1);
        setLines((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] Completed list with ${generated.length.toLocaleString()} references`,
        ]);
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 350);
  };

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

  const cards = useMemo(
    () => (
      <div className="space-y-4">
        <GlassCard className="p-5">
          <h2 className="mb-3 text-lg font-semibold text-white">Search Focus</h2>
          <label className="mb-2 block text-sm text-slate-300" htmlFor="main-topic">
            Search Focus Topic
          </label>
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
            className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-3 text-sm text-white"
            placeholder="Enter your topic"
          />
          <button
            type="button"
            onClick={processExpansion}
            disabled={!settings.topic.trim()}
            className="mt-3 rounded-lg border border-cyan-300/50 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Process Expansion
          </button>

          {expandedTopic && (
            <div className="mt-4 space-y-3">
              <label className="block text-sm text-slate-300">Expanded Topic</label>
              <textarea
                value={expandedTopic}
                readOnly
                className="min-h-[130px] w-full rounded-lg border border-white/20 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
              />
              <label className="block text-sm text-slate-300">Refinement</label>
              <textarea
                value={expandedTopicDraft}
                onChange={(e) => {
                  setExpandedTopicDraft(e.target.value);
                  setExpansionAccepted(false);
                }}
                className="min-h-[130px] w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-3 text-sm text-slate-100"
              />
              <button
                type="button"
                onClick={() => {
                  setExpandedTopic(expandedTopicDraft.trim() || expandedTopic);
                  setExpansionAccepted(true);
                }}
                className="rounded-lg border border-emerald-300/50 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200"
              >
                Accept
              </button>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="mb-3 text-lg font-semibold text-white">Deep Research Process</h2>
          <div className="space-y-2">
            {deepResearchProcess.map((item, i) => {
              const isActive = isRunning && i === activeStep;
              const isDone = !isRunning && references.length > 0 && i <= activeStep;
              return (
                <div
                  key={item}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${isActive ? 'border-cyan-300/60 bg-cyan-500/10' : 'border-white/10 bg-white/5'}`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${isActive ? 'animate-pulse bg-cyan-300' : isDone ? 'bg-emerald-300' : 'bg-slate-500'}`}
                  />
                  <span className="text-slate-100">{item}</span>
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
              if (!expandedTopic.trim()) {
                processExpansion();
                return;
              }
              if (!expansionAccepted) {
                setExpansionAccepted(true);
                return;
              }
              if (settings.startYear > settings.endYear) {
                setSettings((s) => ({ ...s, endYear: s.startYear }));
                return;
              }
              if (settings.startYear < 1900 || settings.endYear > CURRENT_YEAR) {
                setSettings((s) => ({ ...s, startYear: initialSettings.startYear, endYear: initialSettings.endYear }));
                return;
              }
              if (!Object.values(settings.sources).some(Boolean)) {
                setSettings((s) => ({ ...s, sources: { ...s.sources, crossref: true } }));
                return;
              }
              if (settings.externalAiEnabled && !settings.externalApiUrl.trim()) {
                setSettings((s) => ({ ...s, externalApiUrl: 'https://api.example.com/v1/references' }));
              }
            }}
          />
        )}
        <ActionCard
          onRun={runHarvest}
          onExportText={exportText}
          estimatedPapers={estimatedPapers}
          disableRun={Boolean(validationError)}
          isRunning={isRunning}
        />
      </div>
    ),
    [estimatedPapers, expandedTopic, expandedTopicDraft, expansionAccepted, isRunning, references, settings, validationError],
  );

  return (
    <div className="min-h-screen bg-transparent text-white">
      <TopBar onMenuClick={() => setSettingsMenuOpen(true)} />
      <Container>
        <div className="relative grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,800px)_340px] xl:items-start">
          {cards}
          <aside className="hidden xl:sticky xl:top-24 xl:block">
            <CacheStats gatheredCount={references.length} targetCount={estimatedPapers} />
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
            <CacheStats gatheredCount={references.length} targetCount={estimatedPapers} />
            <ConsoleLog lines={lines} />
          </div>
        </div>

        {settingsMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
            <div className="absolute left-0 top-0 h-full w-full max-w-xl overflow-y-auto border-r border-white/10 bg-[#060913] p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Settings</h2>
                <button
                  type="button"
                  onClick={() => setSettingsMenuOpen(false)}
                  className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-sm text-white"
                >
                  Close
                </button>
              </div>
              <div className="space-y-4 pb-8">
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
                <SourceSelectionCard
                  sources={settings.sources}
                  setSources={(sources) => setSettings((s) => ({ ...s, sources }))}
                  estimatedPapers={estimatedPapers}
                />
                <OutputCard
                  expandedTopic={expandedTopic}
                  externalAiEnabled={settings.externalAiEnabled}
                  setExternalAiEnabled={(externalAiEnabled) => setSettings((s) => ({ ...s, externalAiEnabled }))}
                  externalApiUrl={settings.externalApiUrl}
                  setExternalApiUrl={(externalApiUrl) => setSettings((s) => ({ ...s, externalApiUrl }))}
                  externalApiAttachment={settings.externalApiAttachment}
                  setExternalApiAttachment={(externalApiAttachment) => setSettings((s) => ({ ...s, externalApiAttachment }))}
                />
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
