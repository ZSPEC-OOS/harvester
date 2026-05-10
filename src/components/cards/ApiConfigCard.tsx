import { Eye, EyeOff, Cpu } from 'lucide-react';
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

const inputCls =
  'w-full rounded-lg px-3 py-2 text-sm transition input-recessed';

const labelCls = 'mb-1.5 block text-[11px] font-medium tracking-wide uppercase' as const;

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
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'rgba(38,191,166,0.14)', color: '#5DD3C2' }}
          >
            <Cpu size={13} />
          </span>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#F3F6FB' }}>
              AI Provider
            </h3>
            <p className="text-[11px]" style={{ color: '#7A95B4' }}>
              OpenAI-compatible endpoint for topic expansion
            </p>
          </div>
        </div>
        {isConfigured && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.30)',
              color: '#6EE7B7',
            }}
          >
            Ready
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className={labelCls} htmlFor="api-nickname" style={{ color: '#8AAAC6' }}>
            Nickname
          </label>
          <input
            id="api-nickname"
            value={config.nickname}
            onChange={set('nickname')}
            className={inputCls}
            placeholder="e.g. OpenAI, Groq, Local Ollama"
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="api-base-url" style={{ color: '#8AAAC6' }}>
            Base URL
          </label>
          <input
            id="api-base-url"
            value={config.baseUrl}
            onChange={set('baseUrl')}
            className={inputCls}
            placeholder="https://api.openai.com/v1"
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="api-model-id" style={{ color: '#8AAAC6' }}>
            Model ID
          </label>
          <input
            id="api-model-id"
            value={config.modelId}
            onChange={set('modelId')}
            className={inputCls}
            placeholder="gpt-4o, claude-sonnet-4-6, llama3"
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="api-key" style={{ color: '#8AAAC6' }}>
            API Key
          </label>
          <div className="relative">
            <input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={set('apiKey')}
              className={`${inputCls} pr-9`}
              placeholder="sk-…"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 transition"
              style={{ color: '#8AAAC6' }}
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-0.5">
          <button
            type="button"
            onClick={testConnection}
            disabled={!isConfigured || testing}
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: 'rgba(33,85,214,0.14)',
              border: '1px solid rgba(33,85,214,0.32)',
              color: '#93B4FF',
            }}
          >
            {testing ? 'Testing…' : 'Test Connection'}
          </button>
          {testResult === 'ok' && (
            <span className="text-xs" style={{ color: '#6EE7B7' }}>
              Connected ✓
            </span>
          )}
          {testResult === 'fail' && (
            <span className="text-xs" style={{ color: '#FCA5A5' }}>
              Failed
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
