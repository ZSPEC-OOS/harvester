export function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-ds-border/60 bg-ds-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary shadow-glow" />
          <div>
            <h1 className="text-lg font-semibold text-ds-text">DeepScholar</h1>
            <p className="text-[11px] uppercase tracking-widest text-ds-muted">Research Console</p>
          </div>
        </div>
        <span className="rounded-full border border-ds-primary/40 bg-ds-primary/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-200">
          Beta
        </span>
      </div>
    </header>
  );
}
