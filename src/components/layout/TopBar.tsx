import { ChevronDown, CircleUserRound, Download, Files } from 'lucide-react';

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050b1b]/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative rounded-full bg-gradient-to-br from-slate-200 to-slate-100 p-2 text-slate-900">
            <Files size={26} />
            <Download size={14} className="absolute -bottom-1 -right-1 rounded-full bg-sky-500 p-0.5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white sm:text-4xl">Paper Harvester</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 border-r border-white/15 pr-5 text-xl text-white sm:flex">
            <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
            Active
          </div>
          <button className="flex items-center gap-2 rounded-full p-1 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/70">
            <CircleUserRound size={40} className="rounded-full bg-gradient-to-br from-blue-500 to-violet-500 p-1" />
            <ChevronDown size={20} className="hidden sm:inline" />
          </button>
        </div>
      </div>
    </header>
  );
}
