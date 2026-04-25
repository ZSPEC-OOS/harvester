import { ChevronDown, CircleUserRound, Download, Files } from 'lucide-react';

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#060913]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative rounded-xl border border-white/20 bg-white/10 p-2 text-white">
            <Files size={22} />
            <Download size={12} className="absolute -bottom-1 -right-1 rounded-full bg-violet-500 p-0.5 text-white" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Reference intelligence · AI-assisted</p>
            <h1 className="text-xl font-semibold text-white sm:text-3xl">DeepScholar</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Live
          </div>
          <button className="flex items-center gap-2 rounded-full p-1 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/70">
            <CircleUserRound size={38} className="rounded-full bg-white/10 p-1.5" />
            <ChevronDown size={20} className="hidden sm:inline" />
          </button>
        </div>
      </div>
    </header>
  );
}
