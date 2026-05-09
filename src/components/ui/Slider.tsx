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
      className="h-1 w-full cursor-pointer appearance-none rounded-full"
      style={{
        accentColor: '#2155D6',
        background: `linear-gradient(to right, #2155D6 ${((value - min) / (max - min)) * 100}%, rgba(120,140,180,0.18) 0%)`,
      }}
    />
  );
}
