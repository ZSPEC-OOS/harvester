type Props = {
  onRun: () => void;
  onExportText: () => void;
  estimatedPapers: number;
  disableRun?: boolean;
  isRunning?: boolean;
};

export function ActionCard({ onRun, onExportText, estimatedPapers, disableRun = false, isRunning = false }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <button
        onClick={onRun}
        disabled={disableRun}
        className="w-full rounded-xl border border-violet-300/40 bg-gradient-to-r from-violet-500/80 to-indigo-500/80 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_26px_rgba(139,92,246,0.3)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
      >
        {isRunning ? 'Stop DeepScholar Run' : `Generate References · Target ${estimatedPapers.toLocaleString()} records`}
      </button>
      <button
        onClick={onExportText}
        className="w-full rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
      >
        Export as Text File
      </button>
    </div>
  );
}
