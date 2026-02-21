import { useId } from 'preact/hooks';

import { InfoTooltip } from './info-tooltip';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type TextFieldProps = {
  label: string;
  description?: string;
  value: string;
  onInput: (value: string) => void;
  readOnly?: boolean;
};

export function TextField({
  label,
  description,
  value,
  onInput,
  readOnly,
}: TextFieldProps) {
  const id = useId();

  return (
    <div class="group space-y-1">
      <Label htmlFor={id}>
        {label}
        {description && <InfoTooltip content={description} class="mt-0.5" />}
      </Label>
      <Input
        id={id}
        value={value}
        onInput={(event) => {
          return onInput((event.target as HTMLInputElement).value);
        }}
        readOnly={readOnly}
        class={readOnly ? 'bg-muted text-muted-foreground' : ''}
      />
    </div>
  );
}
