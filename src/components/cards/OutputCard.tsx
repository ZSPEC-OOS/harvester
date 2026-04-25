import { Checkbox } from '../ui/Checkbox';
import { GlassCard } from '../ui/GlassCard';

type Props = {
  expandedTopic: string;
  externalAiEnabled: boolean;
  setExternalAiEnabled: (value: boolean) => void;
  externalApiUrl: string;
  setExternalApiUrl: (value: string) => void;
  externalApiAttachment: string;
  setExternalApiAttachment: (value: string) => void;
};

export function OutputCard(props: Props) {
  return (
    <GlassCard className="p-4 sm:p-6">
      <h2 className="mb-4 text-2xl font-semibold text-white sm:text-3xl">STEP 3: AI EXPANSION + API ATTACHMENT</h2>

      <label className="mb-2 block text-slate-300" htmlFor="expanded-topic">
        AI Expanded Topic (auto-generated when you run)
      </label>
      <textarea
        id="expanded-topic"
        value={props.expandedTopic}
        readOnly
        className="mb-4 min-h-24 w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-3 text-white"
        placeholder="DeepScholar will expand your topic into related terminology, synonyms, and adjacent subfields."
      />

      <div className="mb-4">
        <Checkbox
          id="external-ai"
          checked={props.externalAiEnabled}
          onChange={props.setExternalAiEnabled}
          label="Use external AI API attachment"
        />
      </div>

      {props.externalAiEnabled && (
        <div className="space-y-3">
          <div>
            <label className="mb-2 block text-slate-300" htmlFor="api-url">
              External API URL
            </label>
            <input
              id="api-url"
              value={props.externalApiUrl}
              onChange={(e) => props.setExternalApiUrl(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-3 text-white"
              placeholder="https://api.example.com/v1/references"
            />
          </div>
          <div>
            <label className="mb-2 block text-slate-300" htmlFor="api-attachment">
              API Attachment / Key / Connector ID
            </label>
            <input
              id="api-attachment"
              value={props.externalApiAttachment}
              onChange={(e) => props.setExternalApiAttachment(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-3 text-white"
              placeholder="paste your token or attachment id"
            />
          </div>
        </div>
      )}
    </GlassCard>
  );
}
