import { GlassCard } from '../ui/GlassCard';

type Props = {
  references: string[];
  referenceStyle: string;
};

const styleLabelMap: Record<string, string> = {
  apa: 'APA',
  mla: 'MLA',
  chicago: 'Chicago',
  vancouver: 'Vancouver',
  'doi-only': 'DOI only',
};

export function ReferenceResultsCard({ references, referenceStyle }: Props) {
  return (
    <GlassCard className="p-4 sm:p-6">
      <h2 className="mb-2 text-2xl font-semibold text-white sm:text-3xl">STEP 4: GENERATED REFERENCES</h2>
      <p className="mb-4 text-slate-300">
        Style: {styleLabelMap[referenceStyle] ?? referenceStyle} · Total generated: {references.length.toLocaleString()}
      </p>

      <div className="max-h-[480px] space-y-2 overflow-auto rounded-lg border border-white/15 bg-black/20 p-3">
        {references.length === 0 ? (
          <p className="text-slate-400">Run DeepScholar to generate an extensive reference list.</p>
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
