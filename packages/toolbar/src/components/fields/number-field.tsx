import { useId } from 'preact/hooks';

import { InfoTooltip } from './info-tooltip';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type NumberFieldProps = {
  label: string;
  description?: string;
  value: string;
  placeholder?: string;
  onInput: (value: string) => void;
};

export function NumberField({
  label,
  description,
  value,
  placeholder,
  onInput,
}: NumberFieldProps) {
  const id = useId();

  return (
    <div class="group space-y-1">
      <Label htmlFor={id}>
        {label}
        {description && <InfoTooltip content={description} class="mt-0.5" />}
      </Label>
      <Input
        id={id}
        type="number"
        value={value}
        placeholder={placeholder}
        onInput={(event) => {
          return onInput((event.target as HTMLInputElement).value);
        }}
      />
    </div>
  );
}
