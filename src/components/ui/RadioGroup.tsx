type Option = { label: string; value: string };

type RadioGroupProps = {
  name: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

export function RadioGroup({ name, value, options, onChange }: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 text-slate-200 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="h-5 w-5 border-white/30 bg-slate-900 text-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/70"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
