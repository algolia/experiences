import { Input } from '../ui/input';

type SliderFieldProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onInput: (value: number) => void;
};

export function SliderField({
  value,
  min,
  max,
  step,
  onInput,
}: SliderFieldProps) {
  return (
    <div class="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={(event) => {
          return onInput(Number((event.target as HTMLInputElement).value));
        }}
        class="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={(event) => {
          return onInput(Number((event.target as HTMLInputElement).value));
        }}
        class="w-18 text-xs font-mono"
      />
    </div>
  );
}
