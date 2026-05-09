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
    <GlassCard className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">AI Provider</h2>
        {isConfigured && (
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-300">
            Configured
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm text-slate-300" htmlFor="api-nickname">
            Nickname
          </label>
          <input
            id="api-nickname"
            value={config.nickname}
            onChange={set('nickname')}
            className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500"
            placeholder="e.g. OpenAI, Groq, My Ollama"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-slate-300" htmlFor="api-base-url">
            Base URL
          </label>
          <input
            id="api-base-url"
            value={config.baseUrl}
            onChange={set('baseUrl')}
            className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500"
            placeholder="https://api.openai.com/v1"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-slate-300" htmlFor="api-model-id">
            Model ID
          </label>
          <input
            id="api-model-id"
            value={config.modelId}
            onChange={set('modelId')}
            className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500"
            placeholder="gpt-4o, claude-sonnet-4-6, llama3"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-slate-300" htmlFor="api-key">
            API Key
          </label>
          <div className="relative">
            <input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={set('apiKey')}
              className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-slate-500"
              placeholder="sk-…"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              aria-label={showKey ? 'Hide API key' : 'Show API key'}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={testConnection}
            disabled={!isConfigured || testing}
            className="rounded-lg border border-cyan-300/50 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {testing ? 'Testing…' : 'Test Connection'}
          </button>
          {testResult === 'ok' && <span className="text-sm text-emerald-300">Connected</span>}
          {testResult === 'fail' && <span className="text-sm text-red-400">Connection failed</span>}
        </div>
      </div>
    </GlassCard>
  );
}
