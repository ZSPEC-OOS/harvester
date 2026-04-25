type Props = { progress: number };

export function ProgressBar({ progress }: Props) {
  return (
    <div className="h-7 w-full overflow-hidden rounded-full bg-slate-200/70">
      <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${progress}%` }} />
    </div>
  );
}
