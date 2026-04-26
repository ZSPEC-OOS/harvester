import { GlassCard } from '../ui/GlassCard';

type Props = {
  gatheredCount: number;
  targetCount: number;
};

export function CacheStats({ gatheredCount, targetCount }: Props) {
  const safeTarget = Math.max(1, targetCount);
  const progress = Math.min(100, Math.round((gatheredCount / safeTarget) * 100));
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <GlassCard className="p-5">
      <h2 className="mb-4 text-lg font-semibold text-white">Live Reference Progress</h2>
      <div className="mx-auto flex w-full max-w-[220px] items-center justify-center">
        <svg viewBox="0 0 180 180" className="h-44 w-44">
          <circle cx="90" cy="90" r={radius} stroke="rgba(148,163,184,0.3)" strokeWidth="12" fill="none" />
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth="12"
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
          <text x="90" y="84" textAnchor="middle" className="fill-white text-[24px] font-semibold">
            {progress}%
          </text>
          <text x="90" y="108" textAnchor="middle" className="fill-slate-300 text-[11px]">
            gathered
          </text>
        </svg>
      </div>
      <div className="space-y-1 text-sm text-slate-200">
        <p>{gatheredCount.toLocaleString()} references gathered</p>
        <p>{targetCount.toLocaleString()} target references</p>
      </div>
    </GlassCard>
  );
}
