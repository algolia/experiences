import { useId } from 'preact/hooks';

import { InfoTooltip } from './info-tooltip';
import { Combobox, type Suggestion } from '../ui/combobox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type TextFieldProps = {
  label: string;
  description?: string;
  value: string;
  placeholder?: string;
  onInput: (value: string) => void;
  readOnly?: boolean;
  suggestions?: Suggestion[];
};

export function TextField({
  label,
  description,
  value,
  placeholder,
  onInput,
  readOnly,
  suggestions,
}: TextFieldProps) {
  const id = useId();

  return (
    <div class="group space-y-1">
      <Label htmlFor={id}>
        {label}
        {description && <InfoTooltip content={description} class="mt-0.5" />}
      </Label>
      {suggestions ? (
        <Combobox
          id={id}
          value={value}
          placeholder={placeholder}
          onInput={onInput}
          suggestions={suggestions}
          label={label}
        />
      ) : (
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          onInput={(event) => {
            return onInput((event.target as HTMLInputElement).value);
          }}
          readOnly={readOnly}
          class={readOnly ? 'bg-muted text-muted-foreground' : ''}
        />
      )}
    </div>
  );
}
