import { clsx } from 'clsx';

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id: string;
};

export function Toggle({ checked, onChange, label, id }: ToggleProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/70',
          checked ? 'bg-blue-500' : 'bg-slate-600',
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </button>
      {label}
    </label>
  );
}
