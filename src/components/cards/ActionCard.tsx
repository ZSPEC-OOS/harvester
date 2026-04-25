type Props = {
  onRun: () => void;
  onExportYaml: () => void;
  estimatedPapers: number;
  disableRun?: boolean;
  isRunning?: boolean;
  onUseExampleQuery: () => void;
};

export function ActionCard({
  onRun,
  onExportYaml,
  estimatedPapers,
  disableRun = false,
  isRunning = false,
  onUseExampleQuery,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <button
        onClick={onRun}
        disabled={disableRun}
        className="w-full rounded-xl border border-violet-300/40 bg-gradient-to-r from-violet-500/80 to-indigo-500/80 px-6 py-4 text-base font-semibold text-white shadow-[0_8px_26px_rgba(139,92,246,0.3)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:text-2xl"
      >
        {isRunning ? '⏹ STOP HARVEST' : `▶ RUN HARVEST – ESTIMATED ${estimatedPapers.toLocaleString()} PAPERS`}
      </button>
      <button
        onClick={onExportYaml}
        className="w-full rounded-xl border border-white/25 bg-white/5 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto sm:text-2xl"
      >
        Save Configuration as YAML
      </button>
      <button
        type="button"
        onClick={onUseExampleQuery}
        className="text-left text-lg text-violet-300 underline underline-offset-2"
      >
        Use Example Query
      </button>
    </div>
  );
}
