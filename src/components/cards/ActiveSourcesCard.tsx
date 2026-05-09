import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

type Source = { id: string; label: string; desc: string; direct?: boolean };

const SOURCES: Source[] = [
  // Via WISP aggregator
  { id: 'openalex', label: 'OpenAlex', desc: '250M+ scholarly works across all disciplines' },
  { id: 'semantic', label: 'Semantic Scholar', desc: 'AI-powered scientific literature discovery' },
  { id: 'crossref', label: 'Crossref', desc: 'DOI authority — 140M+ records, all fields' },
  { id: 'arxiv', label: 'arXiv', desc: 'Preprints — CS, physics, math, quantitative biology' },
  { id: 'biorxiv', label: 'bioRxiv / medRxiv', desc: 'Biology and clinical medicine preprints' },
  { id: 'unpaywall', label: 'Unpaywall', desc: 'Open-access version finder by DOI' },
  // Direct API adapters
  { id: 'pubmed', label: 'PubMed / MEDLINE', desc: '35M+ biomedical and life science citations', direct: true },
  { id: 'europepmc', label: 'Europe PMC', desc: 'Life sciences open-access archive, 42M+ records', direct: true },
  { id: 'core', label: 'CORE', desc: 'Open-access aggregator, 200M+ full-text papers', direct: true },
  { id: 'eric', label: 'ERIC', desc: 'Education research — US Dept of Education index', direct: true },
];

type Props = {
  estimatedPapers: number;
};

export function ActiveSourcesCard({ estimatedPapers }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <GlassCard className="p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between"
      >
        <div className="text-left">
          <h3 className="text-sm font-semibold text-white">Reference Sources</h3>
          <p className="text-xs text-slate-400">
            {SOURCES.length} active · up to ~{estimatedPapers.toLocaleString()} refs
          </p>
        </div>
        {open ? (
          <ChevronUp size={14} className="shrink-0 text-slate-400" />
        ) : (
          <ChevronDown size={14} className="shrink-0 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="mb-2 flex gap-3 text-[10px] text-slate-600">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Via WISP</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Direct API</span>
          </div>
          <div className="space-y-1.5">
            {SOURCES.map((s) => (
              <div key={s.id} className="flex items-start gap-2">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${s.direct ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
                <span className="text-xs text-slate-200">{s.label}</span>
                <span className="text-xs text-slate-500">— {s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
