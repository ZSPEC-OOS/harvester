import { GlassCard } from '../ui/GlassCard';
import { Toggle } from '../ui/Toggle';

type Sources = {
  crossref: boolean;
  scholar: boolean;
  pubmed: boolean;
  semantic: boolean;
};

type Props = {
  sources: Sources;
  setSources: (sources: Sources) => void;
  estimatedPapers: number;
};

export function SourceSelectionCard({ sources, setSources, estimatedPapers }: Props) {
  const set = (key: keyof Sources, value: boolean) => setSources({ ...sources, [key]: value });

  const activeCount = Object.values(sources).filter(Boolean).length;

  return (
    <GlassCard className="p-4 sm:p-6">
      <h2 className="mb-4 text-2xl font-semibold text-white sm:text-3xl">STEP 2: SOURCE SELECTION</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Toggle id="src-crossref" checked={sources.crossref} onChange={(v) => set('crossref', v)} label="Crossref API" />
        <Toggle id="src-scholar" checked={sources.scholar} onChange={(v) => set('scholar', v)} label="Google Scholar" />
        <Toggle id="src-pubmed" checked={sources.pubmed} onChange={(v) => set('pubmed', v)} label="PubMed" />
        <Toggle id="src-semantic" checked={sources.semantic} onChange={(v) => set('semantic', v)} label="Semantic Scholar" />
      </div>
      <p className="mt-4 text-lg text-slate-400">
        Using {activeCount} source{activeCount === 1 ? '' : 's'} — estimated {estimatedPapers.toLocaleString()} papers
      </p>
    </GlassCard>
  );
}
