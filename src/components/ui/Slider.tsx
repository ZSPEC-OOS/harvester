type SliderProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  id: string;
};

export function Slider({ value, min = 1, max = 10, onChange, id }: SliderProps) {
  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-3 w-full accent-sky-500 sm:h-3.5"
    />
  );
}
