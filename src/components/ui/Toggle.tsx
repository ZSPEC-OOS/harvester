import { clsx } from 'clsx';

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id: string;
};

export function Toggle({ checked, onChange, label, id }: ToggleProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 text-xl sm:text-2xl lg:text-3xl text-slate-200">
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative h-9 w-16 sm:h-10 sm:w-18 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/70',
          checked ? 'bg-blue-500' : 'bg-slate-500/70',
        )}
      >
        <span
          className={clsx(
            'absolute top-1 h-7 w-7 rounded-full bg-white transition-transform',
            checked ? 'translate-x-8' : 'translate-x-1',
          )}
        />
      </button>
      {label}
    </label>
  );
}
