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

  const set = (field: keyof WispConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, [field]: e.target.value });
    setTestResult(null);
  };

  const testConnection = async () => {
    if (!config.baseUrl.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${config.baseUrl.replace(/\/$/, '')}/health`);
      setTestResult(res.ok ? 'ok' : 'fail');
    } catch {
      setTestResult('fail');
    } finally {
      setTesting(false);
    }
  };

  const isConfigured = Boolean(config.baseUrl.trim());

  return (
    <GlassCard className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">WISP Search Backend</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Real academic search via OpenAlex, arXiv &amp; Semantic Scholar
          </p>
        </div>
        {isConfigured ? (
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-300">
            Configured
          </span>
        ) : (
          <span className="rounded-full border border-slate-600/40 bg-slate-700/20 px-2.5 py-0.5 text-xs text-slate-400">
            Mock mode
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm text-slate-300" htmlFor="wisp-base-url">
            WISP Base URL
          </label>
          <input
            id="wisp-base-url"
            value={config.baseUrl}
            onChange={set('baseUrl')}
            className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500"
            placeholder="https://your-wisp-instance.up.railway.app"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-slate-300" htmlFor="wisp-api-key">
            API Key{' '}
            <span className="text-slate-500">(optional if WISP_API_KEYS not set on server)</span>
          </label>
          <div className="relative">
            <input
              id="wisp-api-key"
              type={showKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={set('apiKey')}
              className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-slate-500"
              placeholder="your-wisp-api-key"
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

        {!isConfigured && (
          <p className="pt-1 text-xs text-slate-500">
            Without WISP, references are generated as mock data. Self-host WISP and paste its URL above to switch to real academic search.
          </p>
        )}
      </div>
    </GlassCard>
  );
}
