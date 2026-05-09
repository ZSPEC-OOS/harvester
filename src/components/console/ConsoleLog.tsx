import { useMemo, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';
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
        className="max-h-48 overflow-auto rounded-lg p-4 font-mono text-xs leading-relaxed"
        style={{
          background: 'rgba(2, 5, 14, 0.72)',
          border: '1px solid rgba(120,140,180,0.08)',
          color: '#64A0D0',
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.4)',
        }}
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
        className="flex w-full items-center justify-between px-4 py-3 text-left transition"
        style={{ color: '#64748B' }}
      >
        <span className="flex items-center gap-2 font-mono text-[11px] tracking-widest" style={{ color: '#3D5070' }}>
          <Terminal size={11} style={{ color: '#4A6FA5' }} />
          Activity Log
        </span>
        {open
          ? <ChevronUp size={14} />
          : <ChevronDown size={14} />
        }
      </button>

      {open && <div className="px-4 pb-4 pt-0">{logContent}</div>}
    </GlassCard>
  );
}
