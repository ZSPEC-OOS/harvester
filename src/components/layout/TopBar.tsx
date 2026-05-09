import { Settings } from 'lucide-react';

type Props = {
  onMenuClick: () => void;
  isRunning: boolean;
  wispConfigured: boolean;
};

export function TopBar({ onMenuClick, isRunning, wispConfigured }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#060913]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between px-4 py-3 sm:px-6">
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">DeepScholar</h1>

        <div className="flex items-center gap-3">
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
            <span className="rounded-full border border-slate-600/40 bg-slate-700/20 px-3 py-1 text-xs text-slate-400">
              Demo
            </span>
          )}

          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg border border-white/15 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Open settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
