import { useMemo, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

type Props = {
  lines: string[];
};

export function ConsoleLog({ lines }: Props) {
  const [open, setOpen] = useState(true);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (open && preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [lines, open]);

  const logContent = useMemo(
    () => (
      <pre
        ref={preRef}
        className="max-h-48 overflow-auto rounded-lg bg-black/30 p-4 font-mono text-xs leading-relaxed text-slate-300"
      >
        {lines.join('\n')}
      </pre>
    ),
    [lines],
  );

  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-slate-300 transition hover:bg-white/5"
      >
        <span className="font-mono text-xs tracking-wider text-slate-400">&gt;_ Activity Log</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && <div className="p-4 pt-0">{logContent}</div>}
    </GlassCard>
  );
}
