import { Download, Play, Square } from 'lucide-react';
import { useState } from 'react';

type ExportFormat = 'txt' | 'bibtex' | 'ris';

type Props = {
  onRun: () => void;
  onExport: (format: ExportFormat) => void;
  estimatedPapers: number;
  disableRun?: boolean;
  isRunning?: boolean;
  hasPapers?: boolean;
};

export function ActionCard({ onRun, onExport, estimatedPapers, disableRun = false, isRunning = false, hasPapers = false }: Props) {
  const [exportFmt, setExportFmt] = useState<ExportFormat>('txt');

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

        <div className="flex flex-col gap-1">
          {hasPapers && (
            <div className="flex overflow-hidden rounded-lg border border-white/10 text-[10px]">
              {(['txt', 'bibtex', 'ris'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFmt(fmt)}
                  className={`px-2 py-1 transition ${
                    exportFmt === fmt ? 'bg-white/15 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {fmt === 'txt' ? 'TXT' : fmt === 'bibtex' ? 'BibTeX' : 'RIS'}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => onExport(exportFmt)}
            disabled={!hasPapers}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            title={`Export as ${exportFmt}`}
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      {!isRunning && estimatedPapers > 0 && (
        <p className="text-center text-xs text-slate-500">
          up to ~{estimatedPapers.toLocaleString()} references
        </p>
      )}
    </div>
  );
}
