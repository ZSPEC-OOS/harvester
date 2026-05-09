import { useMemo, useState } from 'react';
import { GlassCard } from '../ui/GlassCard';

// Matches WispPaper in Dashboard.tsx
type WispPaper = {
  title: string;
  doi: string | null;
  authors: string[];
  publication_year: number | null;
  url: string;
  oa_pdf_url: string | null;
  provider: string;
};

type SortOrder = 'discovery' | 'year-desc' | 'year-asc';

const styleLabelMap: Record<string, string> = {
  apa: 'APA',
  mla: 'MLA',
  chicago: 'Chicago',
  vancouver: 'Vancouver',
  'doi-only': 'DOI only',
};

const formatCitation = (paper: WispPaper, index: number, style: string): string => {
  const authorStr =
    paper.authors.length > 0
      ? paper.authors.slice(0, 3).join(', ') + (paper.authors.length > 3 ? ', et al.' : '')
      : 'Unknown Author';
  const year = paper.publication_year ?? 'n.d.';
  const link = paper.doi ? `https://doi.org/${paper.doi}` : paper.url;

  switch (style) {
    case 'apa':
      return `${index}. ${authorStr} (${year}). ${paper.title}.`;
    case 'mla':
      return `${index}. ${authorStr}. "${paper.title}." ${year}.`;
    case 'chicago':
      return `${index}. ${authorStr}. "${paper.title}." ${year}.`;
    case 'vancouver':
      return `${index}. ${authorStr}. ${paper.title}. ${year}.`;
    case 'doi-only':
      return `${index}. ${paper.doi ?? link}`;
    default:
      return `${index}. ${authorStr} (${year}). ${paper.title}.`;
  }
};

type Props = {
  papers: WispPaper[];
  referenceStyle: string;
  isRunning?: boolean;
  isVerifying?: boolean;
};

export function ReferenceResultsCard({ papers, referenceStyle, isRunning = false, isVerifying = false }: Props) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('discovery');
  const style = styleLabelMap[referenceStyle] ?? referenceStyle;

  const sorted = useMemo(() => {
    if (sortOrder === 'year-desc')
      return [...papers].sort((a, b) => (b.publication_year ?? 0) - (a.publication_year ?? 0));
    if (sortOrder === 'year-asc')
      return [...papers].sort((a, b) => (a.publication_year ?? 9999) - (b.publication_year ?? 9999));
    return papers;
  }, [papers, sortOrder]);

  return (
    <GlassCard className="p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-[#F3F6FB]">References</h2>
          {(isRunning || isVerifying) && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          )}
          <span className="text-xs text-[#94A3B8]">
            {papers.length > 0 ? `${papers.length.toLocaleString()} · ${style}` : style}
          </span>
          {isVerifying && <span className="text-xs text-amber-400">Verifying…</span>}
        </div>

        {papers.length > 0 && (
          <div className="flex overflow-hidden rounded-md border border-white/10 text-[10px]">
            {(['discovery', 'year-desc', 'year-asc'] as const).map((o) => (
              <button
                key={o}
                onClick={() => setSortOrder(o)}
                className={`px-2 py-1 transition ${
                  sortOrder === o ? 'bg-white/15 text-[#F3F6FB]' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {o === 'discovery' ? 'Default' : o === 'year-desc' ? 'Year ↓' : 'Year ↑'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-h-[520px] overflow-auto rounded-lg border border-white/10 bg-black/20 p-3">
        {papers.length === 0 ? (
          <p className="text-sm text-slate-500">
            {isRunning ? 'Gathering references…' : 'Process Expansion to populate results here.'}
          </p>
        ) : (
          <div className="space-y-3">
            {sorted.map((paper, i) => (
              <div key={paper.doi ?? paper.url ?? i} className="border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                <p className="font-mono text-xs leading-relaxed text-slate-200 sm:text-sm">
                  {formatCitation(paper, i + 1, referenceStyle)}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {paper.doi && (
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-cyan-500 transition hover:text-cyan-300"
                    >
                      DOI ↗
                    </a>
                  )}
                  {!paper.doi && paper.url && (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-cyan-500 transition hover:text-cyan-300"
                    >
                      Link ↗
                    </a>
                  )}
                  {paper.oa_pdf_url && (
                    <a
                      href={paper.oa_pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-500 transition hover:text-emerald-300"
                    >
                      PDF ↗
                    </a>
                  )}
                  {paper.provider && (
                    <span className="text-[10px] text-slate-600">{paper.provider}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
