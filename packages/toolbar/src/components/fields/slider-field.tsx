import { useEffect, useId, useRef, useState } from 'preact/hooks';

import { Label } from '../ui/label';

type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onInput: (value: number) => void;
};

export function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onInput,
}: SliderFieldProps) {
  const id = useId();
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div class="group space-y-1">
      <div class="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span class="text-xs tabular-nums text-muted-foreground">
          {localValue}
          {unit}
        </span>
      </div>
      <input
        ref={inputRef}
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={localValue}
        onInput={(event) => {
          const numValue = Number((event.target as HTMLInputElement).value);
          setLocalValue(numValue);
          onInput(numValue);
        }}
        class="w-full accent-primary h-1.5 cursor-pointer appearance-none rounded-full bg-muted [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-0"
      />
    </div>
  );
}
