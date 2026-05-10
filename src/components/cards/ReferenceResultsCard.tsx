import { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

type Paper = {
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

const formatCitation = (paper: Paper, index: number, style: string): string => {
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
  papers: Paper[];
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
            style={{ background: 'rgba(33,85,214,0.18)', color: '#7BAAEE' }}
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
            <span className="text-[11px]" style={{ color: '#8AAAC6' }}>
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
            style={{ border: '1px solid rgba(130,155,200,0.24)' }}
          >
            {(['discovery', 'year-desc', 'year-asc'] as const).map((o) => (
              <button
                key={o}
                onClick={() => setSortOrder(o)}
                className="px-2 py-1 transition"
                style={
                  sortOrder === o
                    ? { background: 'rgba(33,85,214,0.28)', color: '#E8EDF5' }
                    : { color: '#8AAAC6' }
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
          background: 'rgba(6, 14, 36, 0.80)',
          border: '1px solid rgba(130,155,200,0.17)',
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.32)',
        }}
      >
        {papers.length === 0 ? (
          <p className="text-sm" style={{ color: '#7A95B4' }}>
            {isRunning ? 'Gathering references…' : 'Run DeepScholar to populate results here.'}
          </p>
        ) : (
          <div className="space-y-3">
            {sorted.map((paper, i) => (
              <div
                key={paper.doi ?? paper.url ?? i}
                className="pb-2.5 last:pb-0"
                style={{ borderBottom: '1px solid rgba(130,155,200,0.12)' }}
              >
                <p className="font-mono text-xs leading-relaxed sm:text-[13px]" style={{ color: '#D2DDE9' }}>
                  {formatCitation(paper, i + 1, referenceStyle)}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-2.5">
                  {paper.doi && (
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-medium transition"
                      style={{ color: '#7BAAEE' }}
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
                      style={{ color: '#7BAAEE' }}
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
                    <span className="text-[10px]" style={{ color: '#506080' }}>
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
