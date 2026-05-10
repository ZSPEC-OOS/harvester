import { Sparkles } from 'lucide-react';
import { Checkbox } from '../ui/Checkbox';
import { GlassCard } from '../ui/GlassCard';

type Props = {
  expandedTopic: string;
  externalAiEnabled: boolean;
  setExternalAiEnabled: (value: boolean) => void;
  apiConfigured: boolean;
  apiNickname: string;
};

export function OutputCard({
  expandedTopic,
  externalAiEnabled,
  setExternalAiEnabled,
  apiConfigured,
  apiNickname,
}: Props) {
  return (
    <GlassCard className="p-4">
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ background: 'rgba(38,191,166,0.14)', color: '#5DD3C2' }}
        >
          <Sparkles size={13} />
        </span>
        <h3 className="text-sm font-semibold" style={{ color: '#F3F6FB' }}>
          AI Expansion
        </h3>
      </div>

      <div className="mb-3">
        <Checkbox
          id="external-ai"
          checked={externalAiEnabled}
          onChange={setExternalAiEnabled}
          label="Use AI Provider for topic expansion"
        />
        <p className="ml-6 mt-1 text-[11px]" style={{ color: '#7A95B4' }}>
          When off, a local template is used instead
        </p>
      </div>

      {externalAiEnabled && (
        <div
          className="rounded-lg px-3 py-2.5 text-xs"
          style={{
            background: 'rgba(8,18,44,0.65)',
            border: '1px solid rgba(130,155,200,0.20)',
          }}
        >
          {apiConfigured ? (
            <p style={{ color: '#6EE7B7' }}>
              Using{' '}
              <span className="font-medium">{apiNickname || 'configured API'}</span>{' '}
              — edit in AI Provider above.
            </p>
          ) : (
            <p style={{ color: '#FCD34D' }}>
              No AI Provider configured. Fill in the AI Provider section above.
            </p>
          )}
        </div>
      )}

      {expandedTopic && (
        <div className="mt-3">
          <p
            className="mb-1.5 text-[11px] font-medium uppercase tracking-wide"
            style={{ color: '#8AAAC6' }}
          >
            Current Expanded Topic
          </p>
          <div
            className="max-h-28 overflow-auto rounded-lg px-3 py-2"
            style={{
              background: 'rgba(6,14,36,0.80)',
              border: '1px solid rgba(130,155,200,0.18)',
            }}
          >
            <p className="text-xs leading-relaxed" style={{ color: '#AABDD3' }}>
              {expandedTopic}
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
