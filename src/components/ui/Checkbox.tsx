type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id: string;
};

export function Checkbox({ checked, onChange, label, id }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 text-slate-200 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 rounded border border-white/30 bg-slate-900 text-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/70"
      />
      <span>{label}</span>
    </label>
  );
}
