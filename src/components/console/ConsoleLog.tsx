import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

type Props = {
  lines: string[];
};

export function ConsoleLog({ lines }: Props) {
  const [open, setOpen] = useState(true);

  const logContent = useMemo(
    () => (
      <pre className="max-h-56 overflow-auto rounded-lg bg-black/30 p-4 font-mono text-xs text-slate-100 sm:text-sm">
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
        <span className="font-mono text-sm tracking-wide">&gt;_ Harvest Log</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className="space-y-4 p-4">
          {logContent}
          <div className="rounded-xl border border-amber-500/70 bg-amber-900/20 px-4 py-3 text-sm text-amber-300">
            ⚠ Some publishers may require institutional access
          </div>
        </div>
      )}
    </GlassCard>
  );
}
