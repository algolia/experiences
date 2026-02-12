import { useId } from 'preact/hooks';

import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

type SwitchFieldProps = {
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
};

export function SwitchField({ label, checked, onToggle }: SwitchFieldProps) {
  const id = useId();

  return (
    <div class="flex items-center justify-between">
      <Label htmlFor={id}>{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}
