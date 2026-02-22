import { useId } from 'preact/hooks';

import { CollapsibleContent } from '../ui/collapsible';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { PickElementButton } from './pick-element-button';

type ToggleableTextFieldProps = {
  label: string;
  enabled: boolean;
  value: string;
  placeholder?: string;
  picker?: boolean;
  onToggle: (value: false | undefined) => void;
  onInput: (value: string | undefined) => void;
  onPickElement?: (callback: (selector: string) => void) => void;
};

export function ToggleableTextField({
  label,
  enabled,
  value,
  placeholder,
  picker,
  onToggle,
  onInput,
  onPickElement,
}: ToggleableTextFieldProps) {
  const switchId = useId();
  const inputId = useId();

  const handleInput = (text: string) => {
    return onInput(text === '' ? undefined : text);
  };

  return (
    <div>
      <div class="flex items-center justify-between">
        <Label htmlFor={switchId}>{label}</Label>
        <Switch
          id={switchId}
          checked={enabled}
          onCheckedChange={(checked) => {
            return onToggle(checked ? undefined : false);
          }}
        />
      </div>
      <CollapsibleContent open={enabled}>
        <div class="mt-2 flex gap-1.5">
          <Input
            id={inputId}
            value={value}
            placeholder={placeholder}
            onInput={(event) => {
              return handleInput((event.target as HTMLInputElement).value);
            }}
          />
          {picker && onPickElement && (
            <PickElementButton
              onPickElement={onPickElement}
              onSelect={handleInput}
            />
          )}
        </div>
      </CollapsibleContent>
    </div>
  );
}
