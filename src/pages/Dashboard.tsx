import { useEffect, useMemo, useRef, useState } from 'react';
import { ActionCard } from '../components/cards/ActionCard';
import { ErrorBox } from '../components/cards/ErrorBox';
import { OutputCard } from '../components/cards/OutputCard';
import { SearchConfigCard } from '../components/cards/SearchConfigCard';
import { SourceSelectionCard } from '../components/cards/SourceSelectionCard';
import { ConsoleLog } from '../components/console/ConsoleLog';
import { Container } from '../components/layout/Container';
import { TopBar } from '../components/layout/TopBar';
import { CacheStats } from '../components/sidebar/CacheStats';

type Settings = {
  query: string;
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
  outputDir: string;
  naming: string;
  bibtex: boolean;
  zotero: boolean;
};

const CURRENT_YEAR = new Date().getFullYear();

const initialSettings: Settings = {
  query: 'machine learning in genomics AND crispr cas9',
  startYear: 2018,
  endYear: CURRENT_YEAR,
  searchDepth: 5,
  includePreprints: true,
  excludePatents: false,
  onlyOpenAccess: true,
  sources: { crossref: true, scholar: true, pubmed: false, semantic: true },
  outputDir: '/Users/research/papers/CRISPR_Genomics_2026',
  naming: 'author-year-title',
  bibtex: true,
  zotero: true,
};

const seedLines = [
  '[10:32:15] Ready to start harvest',
  '[10:32:28] Waiting for user action',
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

const getEstimate = (settings: Settings) => {
  const activeSources = Object.entries(settings.sources)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key as keyof Settings['sources']);

  const sourceScore = activeSources.reduce((sum, source) => sum + sourceWeights[source], 0);
  const yearSpan = Math.max(1, settings.endYear - settings.startYear + 1);
  const queryWordCount = settings.query.trim().split(/\s+/).filter(Boolean).length;

  let estimate = Math.round(sourceScore * settings.searchDepth * yearSpan * Math.max(1, queryWordCount * 1.2));

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
  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState(seedLines);
  const [sheetOpen, setSheetOpen] = useState(false);
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
    if (!settings.query.trim()) return 'Search query is empty.';
    if (settings.startYear > settings.endYear) return 'Start year is later than end year.';
    if (!settings.outputDir.trim()) return 'Output directory is required.';
    if (!Object.values(settings.sources).some(Boolean)) return 'At least one source must be enabled.';
    return null;
  }, [settings]);

  const runHarvest = () => {
    if (isRunning) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRunning(false);
      setLines((prev) => [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] Harvest cancelled by user`]);
      return;
    }

    if (validationError) {
      setLines((prev) => [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] Cannot run: ${validationError}`]);
      return;
    }

    const events = [
      `Running query: "${settings.query.trim()}"`,
      `Selecting sources: ${Object.entries(settings.sources).filter(([, v]) => v).map(([k]) => k).join(', ')}`,
      'Applying open-access filters',
      `Preparing ${estimatedPapers.toLocaleString()} records for download`,
      `Output directory confirmed: ${settings.outputDir}`,
      'Harvest completed successfully',
    ];

    let i = 0;
    setIsRunning(true);
    setProgress(0);
    setLines((prev) => [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] Starting harvest`]);

    timerRef.current = window.setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 17);
        if (next === 100) {
          setIsRunning(false);
          setCacheCount((count) => count + Math.round(estimatedPapers * 0.2));
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
    const yaml = toYaml(settings);
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paper-harvester-config.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const cards = useMemo(
    () => (
      <div className="space-y-4">
        <SearchConfigCard
          query={settings.query}
          setQuery={(query) => setSettings((s) => ({ ...s, query }))}
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
          outputDir={settings.outputDir}
          setOutputDir={(outputDir) => setSettings((s) => ({ ...s, outputDir }))}
          naming={settings.naming}
          setNaming={(naming) => setSettings((s) => ({ ...s, naming }))}
          bibtex={settings.bibtex}
          setBibtex={(bibtex) => setSettings((s) => ({ ...s, bibtex }))}
          zotero={settings.zotero}
          setZotero={(zotero) => setSettings((s) => ({ ...s, zotero }))}
        />

        {validationError && (
          <ErrorBox
            message={validationError}
            onFix={() => {
              if (!settings.query.trim()) {
                setSettings((s) => ({ ...s, query: initialSettings.query }));
                return;
              }
              if (settings.startYear > settings.endYear) {
                setSettings((s) => ({ ...s, endYear: s.startYear }));
                return;
              }
              if (!settings.outputDir.trim()) {
                setSettings((s) => ({ ...s, outputDir: initialSettings.outputDir }));
                return;
              }
              if (!Object.values(settings.sources).some(Boolean)) {
                setSettings((s) => ({ ...s, sources: { ...s.sources, crossref: true } }));
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
          onUseExampleQuery={() => setSettings((s) => ({ ...s, query: initialSettings.query }))}
        />
      </div>
    ),
    [estimatedPapers, isRunning, settings, validationError],
  );

  return (
    <div className="min-h-screen bg-bg text-white">
      <TopBar />
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

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/90 p-3 backdrop-blur xl:hidden">
          <button
            onClick={runHarvest}
            disabled={Boolean(validationError)}
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? 'STOP HARVEST' : 'RUN HARVEST'}
          </button>
          <button onClick={() => setSheetOpen((v) => !v)} className="mt-2 w-full text-center text-sm text-slate-300">
            {sheetOpen ? 'Hide' : 'Show'} Cache + Console
          </button>
        </div>

        <div
          className={`fixed inset-x-0 bottom-20 z-30 max-h-[70vh] overflow-auto rounded-t-2xl border border-white/10 bg-slate-950/95 p-3 transition-transform xl:hidden ${sheetOpen ? 'translate-y-0' : 'translate-y-[110%]'}`}
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
      </Container>
    </div>
  );
}
