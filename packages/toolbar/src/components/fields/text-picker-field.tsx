import { useId } from 'preact/hooks';

import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PickElementButton } from './pick-element-button';

type TextPickerFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onInput: (value: string) => void;
  onPickElement: (callback: (selector: string) => void) => void;
};

export function TextPickerField({
  label,
  value,
  placeholder,
  onInput,
  onPickElement,
}: TextPickerFieldProps) {
  const id = useId();

  return (
    <div class="group space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <div class="flex gap-1.5">
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          onInput={(event) => {
            return onInput((event.target as HTMLInputElement).value);
          }}
        />
        <PickElementButton onPickElement={onPickElement} onSelect={onInput} />
      </div>
    </div>
  );
}
