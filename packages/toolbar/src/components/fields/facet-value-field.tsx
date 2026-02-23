import { useId } from 'preact/hooks';

import { Input } from '../ui/input';
import { Label } from '../ui/label';

// TODO: Add support for FacetValue[] (array values display as empty and are
// overwritten on edit).
type FacetValueFieldProps = {
  label: string;
  value: string | number | boolean | undefined;
  placeholder?: string;
  onChange: (value: string | number | boolean | undefined) => void;
};

function parseFacetValue(text: string): string | number | boolean | undefined {
  const trimmed = text.trim();
  if (trimmed === '') return undefined;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;

  const num = Number(trimmed);
  if (!Number.isNaN(num)) return num;

  return trimmed;
}

export function FacetValueField({
  label,
  value,
  placeholder,
  onChange,
}: FacetValueFieldProps) {
  const id = useId();
  const displayValue = value === undefined ? '' : String(value);

  return (
    <div class="group space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={displayValue}
        placeholder={placeholder}
        onInput={(event) => {
          return onChange(
            parseFacetValue((event.target as HTMLInputElement).value)
          );
        }}
      />
    </div>
  );
}
