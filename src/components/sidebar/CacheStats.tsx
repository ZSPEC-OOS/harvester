import { GlassCard } from '../ui/GlassCard';

type Props = {
  gatheredCount: number;
  targetCount: number;
  sourceCounts?: Record<string, number>;
};

export function CacheStats({ gatheredCount, targetCount, sourceCounts = {} }: Props) {
  const safeTarget = Math.max(1, targetCount);
  const progress = Math.min(100, Math.round((gatheredCount / safeTarget) * 100));
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  const sourceEntries = Object.entries(sourceCounts).sort(([, a], [, b]) => b - a);
  const maxCount = sourceEntries.length > 0 ? sourceEntries[0][1] : 1;

  return (
    <GlassCard className="p-5">
      <h2 className="mb-3 text-sm font-semibold" style={{ color: '#F3F6FB' }}>Progress</h2>

      <div className="mx-auto flex w-full max-w-[200px] items-center justify-center">
        <svg viewBox="0 0 180 180" className="h-40 w-40">
          <circle cx="90" cy="90" r={radius} stroke="rgba(130,155,200,0.20)" strokeWidth="10" fill="none" />
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            transform="rotate(-90 90 90)"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <text x="90" y="86" textAnchor="middle" fill="#F3F6FB" fontSize="26" fontWeight="700">
            {progress}%
          </text>
          <text x="90" y="106" textAnchor="middle" fill="#8AAAC6" fontSize="11">
            complete
          </text>
        </svg>
      </div>

      <div className="mt-3 space-y-1 pt-3" style={{ borderTop: '1px solid rgba(130,155,200,0.18)' }}>
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: '#8AAAC6' }}>Gathered</span>
          <span className="font-medium" style={{ color: '#F3F6FB' }}>{gatheredCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: '#8AAAC6' }}>Target</span>
          <span className="font-medium" style={{ color: '#AABDD3' }}>{targetCount.toLocaleString()}</span>
        </div>
      </div>

      {sourceEntries.length > 0 && (
        <div className="mt-3 space-y-1.5 pt-3" style={{ borderTop: '1px solid rgba(130,155,200,0.18)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#7090B8' }}>By Source</p>
          {sourceEntries.map(([provider, count]) => (
            <div key={provider} className="flex items-center gap-2">
              <span className="w-20 shrink-0 truncate text-[10px]" style={{ color: '#8AAAC6' }}>{provider}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(130,155,200,0.12)' }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((count / maxCount) * 100)}%`, background: 'rgba(34,211,238,0.65)' }}
                />
              </div>
              <span className="w-6 text-right text-[10px]" style={{ color: '#8AAAC6' }}>{count}</span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
