type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id: string;
};

export function Checkbox({ checked, onChange, label, id }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2 select-none"
      style={{ color: '#94A3B8' }}
    >
      <span
        className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded"
        style={{
          background: checked ? 'rgba(33,85,214,0.85)' : 'rgba(3,8,20,0.75)',
          border: checked
            ? '1px solid rgba(33,85,214,0.9)'
            : '1px solid rgba(120,140,180,0.25)',
          boxShadow: checked ? '0 0 8px rgba(33,85,214,0.35)' : 'inset 0 1px 3px rgba(0,0,0,0.4)',
          transition: 'all 0.15s ease',
        }}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </span>
      <span className="text-xs">{label}</span>
    </label>
  );
}
