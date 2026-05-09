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
    <GlassCard className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Reference Sources</h3>
        <span className="text-xs text-slate-400">
          {activeCount} active · ~{estimatedPapers.toLocaleString()} refs
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Toggle id="src-crossref" checked={sources.crossref} onChange={(v) => set('crossref', v)} label="Crossref" />
        <Toggle id="src-scholar" checked={sources.scholar} onChange={(v) => set('scholar', v)} label="Google Scholar" />
        <Toggle id="src-pubmed" checked={sources.pubmed} onChange={(v) => set('pubmed', v)} label="PubMed" />
        <Toggle id="src-semantic" checked={sources.semantic} onChange={(v) => set('semantic', v)} label="Semantic Scholar" />
      </div>
    </GlassCard>
  );
}
