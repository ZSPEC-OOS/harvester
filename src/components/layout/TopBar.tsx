import { Settings } from 'lucide-react';

type Props = {
  onMenuClick: () => void;
  isRunning: boolean;
  wispConfigured: boolean;
};

export function TopBar({ onMenuClick, isRunning, wispConfigured }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(120,140,180,0.15)] bg-[rgba(6,14,30,0.82)] backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-[1360px] items-center px-4 py-3 sm:px-6">
        {/* Left — menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg border border-[rgba(120,140,180,0.24)] bg-[rgba(13,24,48,0.7)] p-2 text-slate-300 transition hover:bg-[rgba(19,32,60,0.92)] hover:text-[#F3F6FB]"
          aria-label="Open settings"
        >
          <Settings size={18} />
        </button>

        {/* Center — title (absolute so it's truly centred regardless of badge width) */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1
            className="text-2xl font-semibold text-[#F3F6FB] sm:text-3xl"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            DeepScholar
          </h1>
          <p className="text-[10px] tracking-[0.24em] text-[#64748B] uppercase">Research Optimized</p>
        </div>

        {/* Right — status badge (only when meaningful) */}
        <div className="ml-auto">
          {isRunning ? (
            <span className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              Running
            </span>
          ) : wispConfigured ? (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          ) : (
            <div className="w-16" /> /* spacer to keep title centred */
          )}
        </div>
      </div>
    </header>
  );
}
