import { PlusCircle, Settings } from 'lucide-react';

type Props = {
  onMenuClick: () => void;
  onNewTask: () => void;
  isRunning: boolean;
};

export function TopBar({ onMenuClick, onNewTask, isRunning }: Props) {
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-xl"
      style={{
        background: 'rgba(6, 11, 28, 0.97)',
        borderBottom: '1px solid rgba(130, 155, 200, 0.18)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 4px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div className="relative mx-auto flex max-w-[1360px] items-center px-4 py-3 sm:px-6">
        {/* Left — settings + new task */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition"
            style={{
              background: 'rgba(33, 85, 214, 0.10)',
              border: '1px solid rgba(130, 155, 200, 0.22)',
              color: '#A8BDD3',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(33, 85, 214, 0.18)';
              (e.currentTarget as HTMLButtonElement).style.color = '#F3F6FB';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(33, 85, 214, 0.10)';
              (e.currentTarget as HTMLButtonElement).style.color = '#A8BDD3';
            }}
            aria-label="Open settings"
          >
            <Settings size={15} />
          </button>

          <button
            type="button"
            onClick={onNewTask}
            disabled={isRunning}
            title={isRunning ? 'Stop the current run before starting a new task' : 'Clear all results and start a new research task'}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: 'rgba(38, 191, 166, 0.10)',
              border: '1px solid rgba(38, 191, 166, 0.28)',
              color: '#5DD3C2',
            }}
            onMouseEnter={(e) => {
              if (!isRunning) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(38, 191, 166, 0.20)';
                (e.currentTarget as HTMLButtonElement).style.color = '#8FEADA';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(38, 191, 166, 0.10)';
              (e.currentTarget as HTMLButtonElement).style.color = '#5DD3C2';
            }}
            aria-label="New task"
          >
            <PlusCircle size={15} />
          </button>
        </div>

        {/* Center — title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1
            className="text-[1.6rem] font-semibold leading-none tracking-[-0.01em]"
            style={{ fontFamily: "'EB Garamond', serif", color: '#F3F6FB' }}
          >
            DeepScholar
          </h1>
          <p
            className="mt-0.5 text-[9px] tracking-[0.28em] uppercase"
            style={{ color: '#5E7898', letterSpacing: '0.26em' }}
          >
            AI-Driven Research
          </p>
        </div>

        {/* Right — status */}
        <div className="ml-auto flex items-center gap-2">
          {isRunning ? (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
              style={{
                background: 'rgba(245, 158, 11, 0.10)',
                border: '1px solid rgba(245, 158, 11, 0.28)',
                color: '#FCD34D',
              }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              Running
            </span>
          ) : (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
              style={{
                background: 'rgba(33, 85, 214, 0.09)',
                border: '1px solid rgba(33, 85, 214, 0.26)',
                color: '#93B4FF',
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Ready
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
