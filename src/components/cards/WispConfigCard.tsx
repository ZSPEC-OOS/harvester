import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';

export type WispConfig = {
  baseUrl: string;
  apiKey: string;
};

type Props = {
  config: WispConfig;
  onChange: (config: WispConfig) => void;
};

export function WispConfigCard({ config, onChange }: Props) {
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const set = (field: keyof WispConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, [field]: e.target.value });
    setTestResult(null);
    setTestError(null);
  };

  const testConnection = async () => {
    if (!config.baseUrl.trim()) return;
    setTesting(true);
    setTestResult(null);
    setTestError(null);
    try {
      const headers: Record<string, string> = {};
      if (config.apiKey.trim()) headers['X-API-Key'] = config.apiKey.trim();
      const res = await fetch(`${config.baseUrl.replace(/\/$/, '')}/health`, { headers });
      if (res.ok) {
        setTestResult('ok');
      } else {
        setTestResult('fail');
        setTestError(`Server returned ${res.status}`);
      }
    } catch (err) {
      setTestResult('fail');
      const msg = String(err);
      if (msg.includes('fetch') || msg.includes('Failed') || msg.includes('Network')) {
        setTestError('Network error — check URL and CORS on your WISP server');
      } else {
        setTestError(msg);
      }
    } finally {
      setTesting(false);
    }
  };

  const isConfigured = Boolean(config.baseUrl.trim());

  return (
    <GlassCard className="p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#F3F6FB]">WISP Search Backend</h3>
          <p className="mt-0.5 text-xs text-[#94A3B8]">Real papers via OpenAlex, arXiv &amp; Semantic Scholar</p>
        </div>
        {isConfigured ? (
          <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">
            Live
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-slate-600/40 bg-slate-700/20 px-2 py-0.5 text-[11px] text-[#94A3B8]">
            Mock
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]" htmlFor="wisp-base-url">
            Base URL
          </label>
          <input
            id="wisp-base-url"
            value={config.baseUrl}
            onChange={set('baseUrl')}
            className="ds-input"
            placeholder="https://your-wisp.onrender.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]" htmlFor="wisp-api-key">
            API Key
          </label>
          <div className="relative">
            <input
              id="wisp-api-key"
              type={showKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={set('apiKey')}
              className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 pr-9 text-sm text-[#F3F6FB] placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
              placeholder="Leave blank if WISP_API_KEYS not set"
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
          <p className="mt-1 text-[11px] text-slate-600">Optional — only needed if WISP_API_KEYS is set on your server</p>
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
          {testResult === 'fail' && (
            <span className="text-xs text-red-400">{testError ?? 'Failed'}</span>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
