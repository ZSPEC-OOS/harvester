import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';

export type ApiConfig = {
  nickname: string;
  baseUrl: string;
  modelId: string;
  apiKey: string;
};

type Props = {
  config: ApiConfig;
  onChange: (config: ApiConfig) => void;
};

export function ApiConfigCard({ config, onChange }: Props) {
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null);

  const set = (field: keyof ApiConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, [field]: e.target.value });
    setTestResult(null);
  };

  const testConnection = async () => {
    if (!config.baseUrl.trim() || !config.apiKey.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${config.baseUrl.replace(/\/$/, '')}/models`, {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      });
      setTestResult(res.ok ? 'ok' : 'fail');
    } catch {
      setTestResult('fail');
    } finally {
      setTesting(false);
    }
  };

  const isConfigured = Boolean(config.baseUrl.trim() && config.apiKey.trim());

  return (
    <GlassCard className="p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#F3F6FB]">AI Provider</h3>
          <p className="mt-0.5 text-xs text-[#94A3B8]">OpenAI-compatible endpoint for topic expansion</p>
        </div>
        {isConfigured && (
          <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">
            Ready
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]" htmlFor="api-nickname">
            Nickname
          </label>
          <input
            id="api-nickname"
            value={config.nickname}
            onChange={set('nickname')}
            className="ds-input"
            placeholder="e.g. OpenAI, Groq, Local Ollama"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]" htmlFor="api-base-url">
            Base URL
          </label>
          <input
            id="api-base-url"
            value={config.baseUrl}
            onChange={set('baseUrl')}
            className="ds-input"
            placeholder="https://api.openai.com/v1"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]" htmlFor="api-model-id">
            Model ID
          </label>
          <input
            id="api-model-id"
            value={config.modelId}
            onChange={set('modelId')}
            className="ds-input"
            placeholder="gpt-4o, claude-sonnet-4-6, llama3"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]" htmlFor="api-key">
            API Key
          </label>
          <div className="relative">
            <input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={set('apiKey')}
              className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 pr-9 text-sm text-[#F3F6FB] placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
              placeholder="sk-…"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-0.5">
          <button
            type="button"
            onClick={testConnection}
            disabled={!isConfigured || testing}
            className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {testing ? 'Testing…' : 'Test Connection'}
          </button>
          {testResult === 'ok' && <span className="text-xs text-emerald-400">Connected ✓</span>}
          {testResult === 'fail' && <span className="text-xs text-red-400">Failed</span>}
        </div>
      </div>
    </GlassCard>
  );
}
