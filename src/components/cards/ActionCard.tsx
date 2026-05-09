import { Download, Play, Square } from 'lucide-react';

type Props = {
  onRun: () => void;
  onExportText: () => void;
  estimatedPapers: number;
  disableRun?: boolean;
  isRunning?: boolean;
};

export function ActionCard({ onRun, onExportText, estimatedPapers, disableRun = false, isRunning = false }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={onRun}
          disabled={disableRun}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-violet-400/40 bg-gradient-to-r from-violet-500/80 to-indigo-500/80 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_26px_rgba(139,92,246,0.25)] transition hover:from-violet-500/90 hover:to-indigo-500/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isRunning ? (
            <>
              <Square size={14} className="fill-white" />
              Stop Run
            </>
          ) : (
            <>
              <Play size={14} className="fill-white" />
              Run DeepScholar
            </>
          )}
        </button>
        <button
          onClick={onExportText}
          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          title="Export as text file"
        >
          <Download size={15} />
          Export
        </button>
      </div>
      {!isRunning && estimatedPapers > 0 && (
        <p className="text-center text-xs text-slate-500">
          ~{estimatedPapers.toLocaleString()} references targeted
        </p>
      )}
    </div>
  );
}
