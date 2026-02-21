import { useId } from 'preact/hooks';

import { InfoTooltip } from './info-tooltip';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

type SwitchFieldProps = {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
};

export function SwitchField({
  label,
  description,
  checked,
  onToggle,
}: SwitchFieldProps) {
  const id = useId();

  return (
    <div class="flex items-center justify-between">
      <Label htmlFor={id}>
        {label}
        {description && <InfoTooltip content={description} class="mt-0.5" />}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}
