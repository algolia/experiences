import { useId } from 'preact/hooks';

import { Input } from '../ui/input';
import { Label } from '../ui/label';

type ColorFieldProps = {
  label: string;
  value: string;
  onInput: (value: string) => void;
};

export function ColorField({ label, value, onInput }: ColorFieldProps) {
  const id = useId();

  return (
    <div class="group space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <div class="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onInput={(event) => {
            return onInput((event.target as HTMLInputElement).value);
          }}
          class="size-8 shrink-0 cursor-pointer rounded border border-input p-0.5"
        />
        <Input
          value={value}
          onInput={(event) => {
            return onInput((event.target as HTMLInputElement).value);
          }}
          class="font-mono text-xs"
        />
      </div>
    </div>
  );
}
