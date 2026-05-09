type Props = {
  message: string;
  onFix: () => void;
};

export function ErrorBox({ message, onFix }: Props) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3"
      style={{
        background: 'rgba(127,29,29,0.15)',
        border: '1px solid rgba(239,68,68,0.22)',
      }}
    >
      <span className="mt-0.5 text-base leading-none" style={{ color: '#F87171' }}>⚠</span>
      <p className="flex-1 text-sm" style={{ color: '#FCA5A5' }}>
        {message}
      </p>
      <button
        onClick={onFix}
        className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition"
        style={{
          background: 'rgba(239,68,68,0.10)',
          border: '1px solid rgba(239,68,68,0.22)',
          color: '#FCA5A5',
        }}
      >
        Auto-fix
      </button>
    </div>
  );
}
