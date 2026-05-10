import { clsx } from 'clsx';

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id: string;
};

export function Toggle({ checked, onChange, label, id }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2.5 text-sm select-none"
      style={{ color: '#94A3B8' }}
    >
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative h-5 w-9 shrink-0 rounded-full transition-all duration-200 focus-visible:outline-none',
        )}
        style={
          checked
            ? {
                background: 'linear-gradient(135deg, #2155D6 0%, #26BFA6 100%)',
                boxShadow: '0 0 12px rgba(33,85,214,0.35)',
              }
            : {
                background: 'rgba(30,41,59,0.8)',
                border: '1px solid rgba(120,140,180,0.18)',
              }
        }
      >
        <span
          className={clsx(
            'absolute top-0.5 h-4 w-4 rounded-full shadow-sm transition-transform duration-200',
          )}
          style={{
            background: '#F1F5F9',
            transform: checked ? 'translateX(1.1rem)' : 'translateX(0.125rem)',
          }}
        />
      </button>
      {label}
    </label>
  );
}
