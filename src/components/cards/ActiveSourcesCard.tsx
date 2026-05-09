import { useState } from 'react';
import { ChevronDown, ChevronUp, Database } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

type Source = { id: string; label: string; desc: string; direct?: boolean };

const SOURCES: Source[] = [
  { id: 'openalex',   label: 'OpenAlex',            desc: '250M+ scholarly works across all disciplines' },
  { id: 'semantic',   label: 'Semantic Scholar',     desc: 'AI-powered scientific literature discovery' },
  { id: 'crossref',   label: 'Crossref',             desc: 'DOI authority — 140M+ records, all fields' },
  { id: 'arxiv',      label: 'arXiv',                desc: 'Preprints — CS, physics, math, quantitative biology' },
  { id: 'biorxiv',    label: 'bioRxiv / medRxiv',    desc: 'Biology and clinical medicine preprints' },
  { id: 'unpaywall',  label: 'Unpaywall',            desc: 'Open-access version finder by DOI' },
  { id: 'pubmed',     label: 'PubMed / MEDLINE',     desc: '35M+ biomedical and life science citations', direct: true },
  { id: 'europepmc',  label: 'Europe PMC',           desc: 'Life sciences open-access archive, 42M+ records', direct: true },
  { id: 'core',       label: 'CORE',                 desc: 'Open-access aggregator, 200M+ full-text papers', direct: true },
  { id: 'eric',       label: 'ERIC',                 desc: 'Education research — US Dept of Education index', direct: true },
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
        <div className="flex items-center gap-2.5 text-left">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'rgba(33,85,214,0.14)', color: '#6B9EFF' }}
          >
            <Database size={13} />
          </span>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#F3F6FB' }}>
              Reference Sources
            </h3>
            <p className="text-[11px]" style={{ color: '#64748B' }}>
              {SOURCES.length} active · up to ~{estimatedPapers.toLocaleString()} refs
            </p>
          </div>
        </div>
        {open
          ? <ChevronUp size={13} className="shrink-0" style={{ color: '#64748B' }} />
          : <ChevronDown size={13} className="shrink-0" style={{ color: '#64748B' }} />
        }
      </button>

      {open && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(120,140,180,0.10)' }}>
          <div className="mb-2.5 flex gap-4 text-[10px]" style={{ color: '#3D5070' }}>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#6EE7B7' }} />
              Via WISP
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#93B4FF' }} />
              Direct API
            </span>
          </div>
          <div className="space-y-2">
            {SOURCES.map((s) => (
              <div key={s.id} className="flex items-start gap-2.5">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: s.direct ? '#6B9EFF' : '#6EE7B7' }}
                />
                <span className="text-xs font-medium" style={{ color: '#CBD5E1' }}>
                  {s.label}
                </span>
                <span className="text-[11px] leading-relaxed" style={{ color: '#475569' }}>
                  — {s.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
