import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

const SOURCES = [
  { id: 'openalex', label: 'OpenAlex', desc: '250M+ scholarly works, open graph' },
  { id: 'semantic', label: 'Semantic Scholar', desc: 'AI-powered literature discovery' },
  { id: 'arxiv', label: 'arXiv', desc: 'Preprints — CS, physics, math, biology' },
  { id: 'crossref', label: 'Crossref', desc: 'DOI registry and citation metadata' },
  { id: 'pubmed', label: 'PubMed / MEDLINE', desc: 'Biomedical and life sciences' },
  { id: 'europepmc', label: 'Europe PMC', desc: 'Life sciences open-access archive' },
  { id: 'biorxiv', label: 'bioRxiv / medRxiv', desc: 'Biology and medicine preprints' },
  { id: 'core', label: 'CORE', desc: 'Open-access aggregator, 200M+ papers' },
  { id: 'base', label: 'BASE', desc: 'Bielefeld Academic Search Engine' },
  { id: 'doaj', label: 'DOAJ', desc: 'Directory of Open Access Journals' },
  { id: 'ssrn', label: 'SSRN', desc: 'Social science and economics preprints' },
  { id: 'ieee', label: 'IEEE Xplore', desc: 'Engineering and technology' },
  { id: 'acm', label: 'ACM Digital Library', desc: 'Computing and information science' },
  { id: 'nasaads', label: 'NASA ADS', desc: 'Astrophysics and space sciences' },
  { id: 'scholar', label: 'Google Scholar', desc: 'Broad academic web coverage' },
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
            {SOURCES.length} active · ~{estimatedPapers.toLocaleString()} refs
          </p>
        </div>
        {open ? (
          <ChevronUp size={14} className="shrink-0 text-slate-400" />
        ) : (
          <ChevronDown size={14} className="shrink-0 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
          {SOURCES.map((s) => (
            <div key={s.id} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-200">{s.label}</span>
              <span className="text-xs text-slate-500">— {s.desc}</span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
