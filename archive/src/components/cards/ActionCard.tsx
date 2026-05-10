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

export function ActionCard({
  onRun,
  onExport,
  estimatedPapers,
  disableRun = false,
  isRunning = false,
  hasPapers = false,
}: Props) {
  const [exportFmt, setExportFmt] = useState<ExportFormat>('txt');

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {/* Primary CTA */}
        <button
          onClick={onRun}
          disabled={disableRun}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-35"
          style={
            disableRun
              ? {
                  background: 'rgba(33, 85, 214, 0.25)',
                  border: '1px solid rgba(33, 85, 214, 0.18)',
                }
              : {
                  background: 'linear-gradient(135deg, #2155D6 0%, #26BFA6 100%)',
                  border: '1px solid rgba(38, 191, 166, 0.35)',
                  boxShadow: isRunning
                    ? '0 0 0 1px rgba(38,191,166,0.2)'
                    : '0 6px 28px rgba(33,85,214,0.38), inset 0 1px 0 rgba(255,255,255,0.10)',
                }
          }
        >
          {isRunning ? (
            <>
              <Square size={13} className="fill-white" />
              Stop Run
            </>
          ) : (
            <>
              <Play size={13} className="fill-white" />
              Run DeepScholar
            </>
          )}
        </button>

        {/* Export controls */}
        <div className="flex flex-col gap-1">
          {hasPapers && (
            <div
              className="flex overflow-hidden rounded-lg text-[10px]"
              style={{ border: '1px solid rgba(120,140,180,0.14)' }}
            >
              {(['txt', 'bibtex', 'ris'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFmt(fmt)}
                  className="px-2 py-1 transition"
                  style={
                    exportFmt === fmt
                      ? { background: 'rgba(33,85,214,0.22)', color: '#E8EDF5' }
                      : { color: '#64748B' }
                  }
                >
                  {fmt === 'txt' ? 'TXT' : fmt === 'bibtex' ? 'BibTeX' : 'RIS'}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => onExport(exportFmt)}
            disabled={!hasPapers}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-35"
            style={{
              background: 'rgba(8,18,38,0.6)',
              border: '1px solid rgba(120,140,180,0.14)',
              color: '#94A3B8',
            }}
            title={`Export as ${exportFmt}`}
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {!isRunning && estimatedPapers > 0 && (
        <p className="text-center text-xs" style={{ color: '#475569' }}>
          up to ~{estimatedPapers.toLocaleString()} references
        </p>
      )}
    </div>
  );
}
