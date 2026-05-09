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
    <GlassCard className="p-4 sm:p-6">
      <h2 className="mb-4 text-2xl font-semibold text-white sm:text-3xl">STEP 3: AI EXPANSION + API ATTACHMENT</h2>

      <label className="mb-2 block text-slate-300" htmlFor="expanded-topic">
        AI Expanded Topic (auto-generated when you run)
      </label>
      <textarea
        id="expanded-topic"
        value={expandedTopic}
        readOnly
        className="mb-4 min-h-24 w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-3 text-white"
        placeholder="DeepScholar will expand your topic into related terminology, synonyms, and adjacent subfields."
      />

      <div className="mb-3">
        <Checkbox
          id="external-ai"
          checked={externalAiEnabled}
          onChange={setExternalAiEnabled}
          label="Use external AI API for topic expansion"
        />
      </div>

      {externalAiEnabled && (
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm">
          {apiConfigured ? (
            <p className="text-emerald-300">
              Using <span className="font-medium">{apiNickname || 'configured API'}</span> — edit details in the AI Provider section above.
            </p>
          ) : (
            <p className="text-amber-300">No API configured. Fill in the AI Provider section above to enable real AI expansion.</p>
          )}
        </div>
      )}
    </GlassCard>
  );
}
