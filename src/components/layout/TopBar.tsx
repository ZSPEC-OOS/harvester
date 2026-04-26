import { Menu } from 'lucide-react';

type Props = {
  onMenuClick: () => void;
};

export function TopBar({ onMenuClick }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#060913]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg border border-white/20 bg-white/5 p-2 text-white transition hover:bg-white/10"
            aria-label="Open settings menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Research mode</p>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">Deep Research Search</h1>
          </div>
        </div>

        <p className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Ready</p>
      </div>
    </header>
  );
}
