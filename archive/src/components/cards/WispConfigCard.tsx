import { Eye, EyeOff, Server } from 'lucide-react';
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

const inputCls =
  'w-full rounded-lg px-3 py-2 text-sm transition input-recessed';

const labelCls = 'mb-1.5 block text-[11px] font-medium tracking-wide uppercase' as const;

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
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'rgba(33,85,214,0.14)', color: '#6B9EFF' }}
          >
            <Server size={13} />
          </span>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#F3F6FB' }}>
              WISP Search Backend
            </h3>
            <p className="text-[11px]" style={{ color: '#64748B' }}>
              Real papers via OpenAlex, arXiv &amp; Semantic Scholar
            </p>
          </div>
        </div>
        {isConfigured ? (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.22)',
              color: '#6EE7B7',
            }}
          >
            Live
          </span>
        ) : (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px]"
            style={{
              background: 'rgba(30,41,59,0.6)',
              border: '1px solid rgba(100,116,139,0.22)',
              color: '#64748B',
            }}
          >
            Mock
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className={labelCls} htmlFor="wisp-base-url" style={{ color: '#64748B' }}>
            Base URL
          </label>
          <input
            id="wisp-base-url"
            value={config.baseUrl}
            onChange={set('baseUrl')}
            className={inputCls}
            placeholder="https://your-wisp.onrender.com"
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="wisp-api-key" style={{ color: '#64748B' }}>
            API Key
          </label>
          <div className="relative">
            <input
              id="wisp-api-key"
              type={showKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={set('apiKey')}
              className={`${inputCls} pr-9`}
              placeholder="Leave blank if WISP_API_KEYS not set"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 transition"
              style={{ color: '#475569' }}
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
          <p className="mt-1 text-[11px]" style={{ color: '#3D5070' }}>
            Optional — only needed if WISP_API_KEYS is set on your server
          </p>
        </div>

        <div className="flex items-center gap-3 pt-0.5">
          <button
            type="button"
            onClick={testConnection}
            disabled={!isConfigured || testing}
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: 'rgba(33,85,214,0.10)',
              border: '1px solid rgba(33,85,214,0.25)',
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
              {testError ?? 'Failed'}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
