import { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

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
  apa:        'APA',
  mla:        'MLA',
  chicago:    'Chicago',
  vancouver:  'Vancouver',
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
    case 'apa':       return `${index}. ${authorStr} (${year}). ${paper.title}.`;
    case 'mla':       return `${index}. ${authorStr}. "${paper.title}." ${year}.`;
    case 'chicago':   return `${index}. ${authorStr}. "${paper.title}." ${year}.`;
    case 'vancouver': return `${index}. ${authorStr}. ${paper.title}. ${year}.`;
    case 'doi-only':  return `${index}. ${paper.doi ?? link}`;
    default:          return `${index}. ${authorStr} (${year}). ${paper.title}.`;
  }
};

type Props = {
  papers: WispPaper[];
  referenceStyle: string;
  isRunning?: boolean;
  isVerifying?: boolean;
};

export function ReferenceResultsCard({
  papers,
  referenceStyle,
  isRunning = false,
  isVerifying = false,
}: Props) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('discovery');
  const style = styleLabelMap[referenceStyle] ?? referenceStyle;

  const sorted = useMemo(() => {
    if (sortOrder === 'year-desc')
      return [...papers].sort((a, b) => (b.publication_year ?? 0) - (a.publication_year ?? 0));
    if (sortOrder === 'year-asc')
      return [...papers].sort(
        (a, b) => (a.publication_year ?? 9999) - (b.publication_year ?? 9999),
      );
    return papers;
  }, [papers, sortOrder]);

  return (
    <GlassCard className="p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'rgba(33,85,214,0.14)', color: '#6B9EFF' }}
          >
            <FileText size={13} />
          </span>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold" style={{ color: '#F3F6FB' }}>
              References
            </h2>
            {(isRunning || isVerifying) && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            )}
            <span className="text-[11px]" style={{ color: '#64748B' }}>
              {papers.length > 0 ? `${papers.length.toLocaleString()} · ${style}` : style}
            </span>
            {isVerifying && (
              <span className="text-[11px]" style={{ color: '#FCD34D' }}>
                Filtering…
              </span>
            )}
          </div>
        </div>

        {papers.length > 0 && (
          <div
            className="flex overflow-hidden rounded-md text-[10px]"
            style={{ border: '1px solid rgba(120,140,180,0.14)' }}
          >
            {(['discovery', 'year-desc', 'year-asc'] as const).map((o) => (
              <button
                key={o}
                onClick={() => setSortOrder(o)}
                className="px-2 py-1 transition"
                style={
                  sortOrder === o
                    ? { background: 'rgba(33,85,214,0.22)', color: '#E8EDF5' }
                    : { color: '#64748B' }
                }
              >
                {o === 'discovery' ? 'Default' : o === 'year-desc' ? 'Year ↓' : 'Year ↑'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results area */}
      <div
        className="max-h-[520px] overflow-auto rounded-lg p-3"
        style={{
          background: 'rgba(2, 6, 18, 0.65)',
          border: '1px solid rgba(120,140,180,0.09)',
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.35)',
        }}
      >
        {papers.length === 0 ? (
          <p className="text-sm" style={{ color: '#475569' }}>
            {isRunning ? 'Gathering references…' : 'Run DeepScholar to populate results here.'}
          </p>
        ) : (
          <div className="space-y-3">
            {sorted.map((paper, i) => (
              <div
                key={paper.doi ?? paper.url ?? i}
                className="pb-2.5 last:pb-0"
                style={{ borderBottom: '1px solid rgba(120,140,180,0.07)' }}
              >
                <p className="font-mono text-xs leading-relaxed sm:text-[13px]" style={{ color: '#C4CDD8' }}>
                  {formatCitation(paper, i + 1, referenceStyle)}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-2.5">
                  {paper.doi && (
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-medium transition"
                      style={{ color: '#6B9EFF' }}
                    >
                      DOI ↗
                    </a>
                  )}
                  {!paper.doi && paper.url && (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-medium transition"
                      style={{ color: '#6B9EFF' }}
                    >
                      Link ↗
                    </a>
                  )}
                  {paper.oa_pdf_url && (
                    <a
                      href={paper.oa_pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-medium transition"
                      style={{ color: '#5DD3C2' }}
                    >
                      PDF ↗
                    </a>
                  )}
                  {paper.provider && (
                    <span className="text-[10px]" style={{ color: '#334155' }}>
                      {paper.provider}
                    </span>
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
