import { Settings } from 'lucide-react';

type Props = {
  onMenuClick: () => void;
  isRunning: boolean;
  wispConfigured: boolean;
};

export function TopBar({ onMenuClick, isRunning, wispConfigured }: Props) {
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-xl"
      style={{
        background: 'rgba(5, 8, 22, 0.96)',
        borderBottom: '1px solid rgba(120, 140, 180, 0.10)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.025), 0 4px 32px rgba(0,0,0,0.35)',
      }}
    >
      <div className="relative mx-auto flex max-w-[1360px] items-center px-4 py-3 sm:px-6">
        {/* Left — settings */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition"
          style={{
            background: 'rgba(33, 85, 214, 0.08)',
            border: '1px solid rgba(120, 140, 180, 0.16)',
            color: '#94A3B8',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(33, 85, 214, 0.15)';
            (e.currentTarget as HTMLButtonElement).style.color = '#F3F6FB';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(33, 85, 214, 0.08)';
            (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8';
          }}
          aria-label="Open settings"
        >
          <Settings size={15} />
        </button>

        {/* Center — title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1
            className="text-[1.6rem] font-semibold leading-none tracking-[-0.01em]"
            style={{ fontFamily: "'EB Garamond', serif", color: '#F3F6FB' }}
          >
            DeepScholar
          </h1>
          <p
            className="mt-0.5 text-[9px] tracking-[0.28em] uppercase"
            style={{ color: '#3D5070', letterSpacing: '0.26em' }}
          >
            Research Optimized
          </p>
        </div>

        {/* Right — status badge */}
        <div className="ml-auto">
          {isRunning ? (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                color: '#FCD34D',
              }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              Running
            </span>
          ) : wispConfigured ? (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
              style={{
                background: 'rgba(16, 185, 129, 0.07)',
                border: '1px solid rgba(16, 185, 129, 0.22)',
                color: '#6EE7B7',
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          ) : (
            <div className="w-16" />
          )}
        </div>
      </div>
    </header>
  );
}
