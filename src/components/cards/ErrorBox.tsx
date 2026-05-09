type Props = {
  message: string;
  onFix: () => void;
};

export function ErrorBox({ message, onFix }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3">
      <span className="mt-0.5 text-base leading-none text-red-400">⚠</span>
      <p className="flex-1 text-sm text-red-300">{message}</p>
      <button
        onClick={onFix}
        className="shrink-0 rounded-lg border border-red-400/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
      >
        Auto-fix
      </button>
    </div>
  );
}
