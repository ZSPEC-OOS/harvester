type Props = {
  onRun: () => void;
  onExportYaml: () => void;
};

export function ActionCard({ onRun, onExportYaml }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        onClick={onRun}
        className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-4 text-base font-semibold text-white sm:flex-1 sm:text-2xl"
      >
        ▶ RUN HARVEST – ESTIMATED 847 OPEN-ACCESS PAPERS
      </button>
      <button
        onClick={onExportYaml}
        className="w-full rounded-xl border border-white/40 bg-transparent px-6 py-4 text-base font-semibold text-white sm:w-auto sm:text-2xl"
      >
        Save Configuration as YAML
      </button>
      <a href="#" className="text-lg text-sky-300 underline underline-offset-2">
        View Example Query
      </a>
    </div>
  );
}
