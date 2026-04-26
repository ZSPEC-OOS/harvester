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
  topic: 'machine learning in genomics and CRISPR-Cas9 editing outcomes',
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
  'Clarify the objective and define hard constraints (scope, years, source quality, and output style).',
  'Decompose the prompt into sub-questions and map each one to best-fit sources.',
  'Run broad discovery first, then refine with targeted follow-up search passes.',
  'Triangulate facts across independent sources and prioritize primary evidence.',
  'Synthesize findings, track confidence, then export references and audit trail.',
];

const deepResearchTactics = [
  'Use query ladders: broad terms → domain synonyms → exact entities.',
  'Pivot search terms from high-signal papers (authors, datasets, methods, benchmarks).',
  'Apply contrastive queries (supporting vs contradictory evidence) to reduce bias.',
  'Use time-windowed passes to separate foundational work from the newest updates.',
  'Score and rerank by source authority, citation velocity, reproducibility signals, and recency.',
];

const sourceWeights = {
  crossref: 1.25,
  scholar: 1.4,
  pubmed: 1.15,
  semantic: 1.2,
} as const;

const yamlIndent = (depth: number) => '  '.repeat(depth);

const toYaml = (value: unknown, depth = 0): string => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => `${yamlIndent(depth)}- ${typeof entry === 'object' ? `\n${toYaml(entry, depth + 1)}` : String(entry)}`)
      .join('\n');
  }

  if (value && typeof value === 'object') {
    return Object.entries(value)
      .map(([key, entry]) => {
        if (entry && typeof entry === 'object') {
          return `${yamlIndent(depth)}${key}:\n${toYaml(entry, depth + 1)}`;
        }

        return `${yamlIndent(depth)}${key}: ${String(entry)}`;
      })
      .join('\n');
  }

  return `${yamlIndent(depth)}${String(value)}`;
};

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
    `${clean} ; related terms: systematic review, meta-analysis, benchmark, survey`,
    `subdomains: methods, datasets, evaluation protocols, translational studies`,
    `synonyms: foundational models, representation learning, multimodal inference`,
    `inclusion strategy: core papers, replications, negative results, preprints, and seminal historical work`,
  ].join(' | ');
};

const buildMockReferences = (settings: Settings, expandedTopic: string, targetCount: number) => {
  const count = Math.max(0, Math.min(targetCount, 2500));
  const style = styleLabelMap[settings.referenceStyle] ?? settings.referenceStyle;

  return Array.from({ length: count }, (_, i) => {
    const year = settings.startYear + (i % (settings.endYear - settings.startYear + 1));
    const title = `Comprehensive study #${i + 1} on ${expandedTopic.split('|')[0].trim()}`;
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
    return saved ? { ...initialSettings, ...JSON.parse(saved) } : initialSettings;
  });
  const [expandedTopic, setExpandedTopic] = useState('');
  const [references, setReferences] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState(seedLines);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [cacheCount, setCacheCount] = useState(1847);
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
    if (!settings.topic.trim()) return 'Topic is empty.';
    if (settings.startYear > settings.endYear) return 'Start year is later than end year.';
    if (settings.startYear < 1900 || settings.endYear > CURRENT_YEAR) return `Year range must be between 1900 and ${CURRENT_YEAR}.`;
    if (!Object.values(settings.sources).some(Boolean)) return 'At least one source must be enabled.';
    if (settings.externalAiEnabled && !settings.externalApiUrl.trim()) return 'External AI API URL is required when attachment mode is enabled.';
    return null;
  }, [settings]);

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

    const expanded = expandTopic(settings.topic);
    setExpandedTopic(expanded);
    setReferences([]);

    const events = [
      'Running Deep Research process: objective → decomposition → broad pass → targeted pass → synthesis',
      `Expanding topic: "${settings.topic.trim()}"`,
      'Applying search tactics: query ladders, synonym pivots, contrastive evidence checks',
      `Using style: ${styleLabelMap[settings.referenceStyle] ?? settings.referenceStyle}`,
      `Selecting sources: ${Object.entries(settings.sources)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(', ')}`,
      'Cross-validating high-impact claims across multiple source indexes',
      settings.externalAiEnabled
        ? `Calling external AI attachment at ${settings.externalApiUrl}`
        : 'Using built-in DeepScholar expansion engine',
      `Generating extensive list for year range ${settings.startYear}-${settings.endYear}`,
      `Completed list with ${Math.min(estimatedPapers, 2500).toLocaleString()} references`,
    ];

    let i = 0;
    setIsRunning(true);
    setProgress(0);
    setLines((prev) => [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] Starting DeepScholar run`]);

    timerRef.current = window.setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 17);
        if (next === 100) {
          setIsRunning(false);
          const generated = buildMockReferences(settings, expanded, estimatedPapers);
          setReferences(generated);
          setCacheCount((count) => count + Math.round(generated.length * 0.2));
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
        return next;
      });

      if (i < events.length) {
        const stamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        setLines((prev) => [...prev, `[${stamp}] ${events[i]}`]);
        i += 1;
      }
    }, 700);
  };

  const exportYaml = () => {
    const yaml = toYaml({ ...settings, expandedTopic, generatedReferenceCount: references.length });
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deepscholar-config.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const cards = useMemo(
    () => (
      <div className="space-y-4">
        <GlassCard className="p-4 sm:p-6">
          <h2 className="mb-3 text-xl font-semibold text-white sm:text-2xl">Search focus</h2>
          <label className="mb-2 block text-sm text-slate-300" htmlFor="main-topic">
            Topic
          </label>
          <input
            id="main-topic"
            value={settings.topic}
            onChange={(e) => setSettings((s) => ({ ...s, topic: e.target.value }))}
            className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-3 text-white"
            placeholder="e.g. foundation models for protein design"
          />
          <p className="mt-3 text-sm text-slate-400">
            Keeping the interface focused: all advanced options moved into the top-left settings menu.
          </p>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <h2 className="mb-3 text-xl font-semibold text-white sm:text-2xl">Deep Research process + tactics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-violet-300">Process</p>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-200">
                {deepResearchProcess.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-300">Search tactics</p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-200">
                {deepResearchTactics.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </GlassCard>

        <ReferenceResultsCard references={references} referenceStyle={settings.referenceStyle} />

        {validationError && (
          <ErrorBox
            message={validationError}
            onFix={() => {
              if (!settings.topic.trim()) {
                setSettings((s) => ({ ...s, topic: initialSettings.topic }));
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
          onExportYaml={exportYaml}
          estimatedPapers={estimatedPapers}
          disableRun={Boolean(validationError)}
          isRunning={isRunning}
          onUseExampleQuery={() => setSettings((s) => ({ ...s, topic: initialSettings.topic }))}
        />
      </div>
    ),
    [estimatedPapers, expandedTopic, isRunning, references, settings, validationError],
  );

  return (
    <div className="min-h-screen bg-transparent text-white">
      <TopBar onMenuClick={() => setSettingsMenuOpen(true)} />
      <Container>
        <div className="relative grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,800px)_340px] xl:items-start">
          {cards}
          <aside className="hidden xl:sticky xl:top-24 xl:block">
            <CacheStats
              cachedCount={cacheCount}
              pendingCount={estimatedPapers}
              onCleanOldCache={() => setCacheCount((count) => Math.max(0, count - 300))}
            />
          </aside>
        </div>

        <div className="mt-4 hidden xl:block">
          <ConsoleLog lines={lines} progress={progress} />
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#060913]/90 p-3 backdrop-blur-xl xl:hidden">
          <button
            onClick={runHarvest}
            disabled={Boolean(validationError)}
            className="w-full rounded-xl border border-violet-300/40 bg-gradient-to-r from-violet-500/80 to-indigo-500/80 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? 'STOP DEEPSCHOLAR' : 'RUN DEEPSCHOLAR'}
          </button>
          <button onClick={() => setSheetOpen((v) => !v)} className="mt-2 w-full text-center text-sm text-slate-300">
            {sheetOpen ? 'Hide' : 'Show'} Cache + Console
          </button>
        </div>

        <div
          className={`fixed inset-x-0 bottom-20 z-30 max-h-[70vh] overflow-auto rounded-t-2xl border border-white/10 bg-[#060913]/95 p-3 transition-transform xl:hidden ${sheetOpen ? 'translate-y-0' : 'translate-y-[110%]'}`}
        >
          <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-slate-600" />
          <div className="space-y-3">
            <CacheStats
              cachedCount={cacheCount}
              pendingCount={estimatedPapers}
              onCleanOldCache={() => setCacheCount((count) => Math.max(0, count - 300))}
            />
            <ConsoleLog lines={lines} progress={progress} mobile />
          </div>
        </div>

        {settingsMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
            <div className="absolute left-0 top-0 h-full w-full max-w-xl overflow-y-auto border-r border-white/10 bg-[#060913] p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Settings</h2>
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
