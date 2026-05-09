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
  const style = styleLabelMap[referenceStyle] ?? referenceStyle;

  return (
    <GlassCard className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">References</h2>
        <div className="flex items-center gap-2">
          {isRunning && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />}
          <span className="text-xs text-slate-400">
            {references.length > 0
              ? `${references.length.toLocaleString()} · ${style}`
              : style}
          </span>
        </div>
      </div>

      <div className="max-h-[420px] overflow-auto rounded-lg border border-white/10 bg-black/20 p-3">
        {references.length === 0 ? (
          <p className="text-sm text-slate-500">
            {isRunning ? 'Gathering references…' : 'Run DeepScholar to populate results here.'}
          </p>
        ) : (
          <div className="space-y-2">
            {references.map((ref, i) => (
              <p key={i} className="font-mono text-xs leading-relaxed text-slate-200 sm:text-sm">
                {ref}
              </p>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
