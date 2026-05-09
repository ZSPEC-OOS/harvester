import { Checkbox } from '../ui/Checkbox';
import { GlassCard } from '../ui/GlassCard';

type Props = {
  expandedTopic: string;
  externalAiEnabled: boolean;
  setExternalAiEnabled: (value: boolean) => void;
  apiConfigured: boolean;
  apiNickname: string;
};

export function OutputCard({ expandedTopic, externalAiEnabled, setExternalAiEnabled, apiConfigured, apiNickname }: Props) {
  return (
    <GlassCard className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-[#F3F6FB]">AI Expansion</h3>

      <div className="mb-3">
        <Checkbox
          id="external-ai"
          checked={externalAiEnabled}
          onChange={setExternalAiEnabled}
          label="Use AI Provider for topic expansion"
        />
        <p className="ml-6 mt-1 text-[11px] text-slate-500">
          When off, WISP or local fallback is used instead
        </p>
      </div>

      {externalAiEnabled && (
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs">
          {apiConfigured ? (
            <p className="text-emerald-400">
              Using <span className="font-medium">{apiNickname || 'configured API'}</span> — edit in AI Provider above.
            </p>
          ) : (
            <p className="text-amber-400">No AI Provider configured. Fill in the AI Provider section above.</p>
          )}
        </div>
      )}

      {expandedTopic && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-[#94A3B8]">Current Expanded Topic</p>
          <div className="max-h-28 overflow-auto rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            <p className="text-xs leading-relaxed text-slate-300">{expandedTopic}</p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
