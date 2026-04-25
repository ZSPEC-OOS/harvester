type Props = {
  message: string;
  onFix: () => void;
};

export function ErrorBox({ message, onFix }: Props) {
  return (
    <button
      onClick={onFix}
      className="w-full rounded-xl border border-red-500/80 bg-red-950/20 px-4 py-3 text-left text-red-300 transition hover:bg-red-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
    >
      ⚠ {message} Click to auto-fix.
    </button>
  );
}
