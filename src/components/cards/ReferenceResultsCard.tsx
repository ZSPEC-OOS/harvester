import { GlassCard } from '../ui/GlassCard';

type Props = {
  references: string[];
  referenceStyle: string;
  isRunning?: boolean;
};

const styleLabelMap: Record<string, string> = {
  apa: 'APA',
  mla: 'MLA',
  chicago: 'Chicago',
  vancouver: 'Vancouver',
  'doi-only': 'DOI only',
};

export function ReferenceResultsCard({ references, referenceStyle, isRunning = false }: Props) {
  return (
    <GlassCard className="p-5">
      <h2 className="mb-2 text-lg font-semibold text-white">References</h2>
      <p className="mb-4 text-sm text-slate-300">
        Style: {styleLabelMap[referenceStyle] ?? referenceStyle} · Streamed: {references.length.toLocaleString()}
      </p>

      <div className="max-h-[420px] space-y-2 overflow-auto rounded-lg border border-white/15 bg-black/20 p-3">
        {references.length === 0 ? (
          <p className="text-sm text-slate-400">{isRunning ? 'Gathering references…' : 'Start a run to stream references here.'}</p>
        ) : (
          references.map((reference) => (
            <p key={reference} className="font-mono text-xs text-slate-100 sm:text-sm">
              {reference}
            </p>
          ))
        )}
      </div>
    </GlassCard>
  );
}
