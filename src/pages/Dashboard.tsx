import { useEffect, useMemo, useState } from 'react';
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

const initialSettings: Settings = {
  query: 'machine learning in genomics AND crispr cas9',
  startYear: 2018,
  endYear: 2025,
  searchDepth: 5,
  includePreprints: true,
  excludePatents: false,
  onlyOpenAccess: true,
  sources: { crossref: true, scholar: true, pubmed: false, semantic: true },
  outputDir: '/Users/research/papers/CRISPR_Genomics_2025',
  naming: 'author-year-title',
  bibtex: true,
  zotero: true,
};

const seedLines = [
  '[10:32:15] Querying Crossref... found 1,203 DOIs',
  '[10:32:28] Querying Google Scholar... found 847 unique papers',
  '[10:32:31] Resolving open-access PDF links',
  '[10:32:45] ✓ 127/847 downloaded (15%) – throttling requests',
];

export function Dashboard() {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('paper-harvester-settings');
    return saved ? { ...initialSettings, ...JSON.parse(saved) } : initialSettings;
  });
  const [progress, setProgress] = useState(15);
  const [lines, setLines] = useState(seedLines);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('paper-harvester-settings', JSON.stringify(settings));
  }, [settings]);

  const runHarvest = () => {
    const events = [
      'Checking Crossref API availability',
      'Running legal open-access verification',
      'Fetching metadata from Semantic Scholar',
      'Preparing safe download plan (open access only)',
      'Updating cache index',
    ];

    let i = 0;
    setProgress(0);
    setLines(seedLines);

    const timer = setInterval(() => {
      setProgress((p) => Math.min(100, p + 7));
      if (i < events.length) {
        const stamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        setLines((prev) => [...prev, `[${stamp}] ${events[i]}`]);
        i += 1;
      } else {
        clearInterval(timer);
      }
    }, 700);
  };

  const exportYaml = () => {
    const yaml = Object.entries(settings)
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('\n');
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

        <ErrorBox />
        <ActionCard onRun={runHarvest} onExportYaml={exportYaml} />
      </div>
    ),
    [settings],
  );

  return (
    <div className="min-h-screen bg-bg text-white">
      <TopBar />
      <Container>
        <div className="relative grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,800px)_340px] xl:items-start">
          {cards}
          <aside className="hidden xl:sticky xl:top-24 xl:block">
            <CacheStats />
          </aside>
        </div>

        <div className="mt-4 hidden xl:block">
          <ConsoleLog lines={lines} progress={progress} />
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/90 p-3 backdrop-blur xl:hidden">
          <button onClick={runHarvest} className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-3 font-semibold text-white">
            RUN HARVEST
          </button>
          <button onClick={() => setSheetOpen((v) => !v)} className="mt-2 w-full text-center text-sm text-slate-300">
            {sheetOpen ? 'Hide' : 'Show'} Cache + Console
          </button>
        </div>

        <div className={`fixed inset-x-0 bottom-20 z-30 max-h-[70vh] overflow-auto rounded-t-2xl border border-white/10 bg-slate-950/95 p-3 transition-transform xl:hidden ${sheetOpen ? 'translate-y-0' : 'translate-y-[110%]'}`}>
          <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-slate-600" />
          <div className="space-y-3">
            <CacheStats />
            <ConsoleLog lines={lines} progress={progress} mobile />
          </div>
        </div>
      </Container>
    </div>
  );
}
