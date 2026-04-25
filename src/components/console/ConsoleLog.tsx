import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { GlassCard } from '../ui/GlassCard';

type Props = {
  lines: string[];
  progress: number;
  mobile?: boolean;
};

export function ConsoleLog({ lines, progress, mobile = false }: Props) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<'logs' | 'progress'>('logs');

  const logContent = useMemo(
    () => (
      <pre className="max-h-44 overflow-auto rounded-lg bg-black/30 p-4 font-mono text-sm text-slate-100 sm:max-h-56 sm:text-2xl">
        {lines.join('\n')}
      </pre>
    ),
    [lines],
  );

  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-white/5 px-4 py-3 text-left text-slate-200"
      >
        <span className="font-mono text-sm tracking-wide sm:text-xl">&gt;_ HARVEST LOG</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className="space-y-4 p-4">
          {mobile ? (
            <>
              <div className="flex gap-2">
                <button onClick={() => setTab('logs')} className={`rounded-lg px-3 py-2 ${tab === 'logs' ? 'bg-sky-500/30 text-white' : 'text-slate-300'}`}>Logs</button>
                <button onClick={() => setTab('progress')} className={`rounded-lg px-3 py-2 ${tab === 'progress' ? 'bg-sky-500/30 text-white' : 'text-slate-300'}`}>Progress</button>
              </div>
              {tab === 'logs' ? logContent : <ProgressBar progress={progress} />}
            </>
          ) : (
            <>
              {logContent}
              <ProgressBar progress={progress} />
            </>
          )}
          <div className="rounded-xl border border-amber-500/70 bg-amber-900/20 px-4 py-3 text-amber-300">
            ⚠ Some publishers may require institutional access
          </div>
        </div>
      )}
    </GlassCard>
  );
}
