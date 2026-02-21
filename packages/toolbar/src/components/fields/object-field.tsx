import { useId, useState } from 'preact/hooks';

import { InfoTooltip } from './info-tooltip';
import { CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { TextField } from './text-field';

type ObjectFieldProps = {
  label: string;
  description?: string;
  enabled: boolean;
  value: Record<string, unknown>;
  defaultValue: Record<string, unknown>;
  fields: Array<{ key: string; label: string }>;
  onToggle: (value: boolean | Record<string, unknown>) => void;
  onFieldChange: (key: string, value: string) => void;
};

export function ObjectField({
  label,
  description,
  enabled,
  value,
  defaultValue,
  fields,
  onToggle,
  onFieldChange,
}: ObjectFieldProps) {
  const id = useId();
  const [open, setOpen] = useState(true);

  return (
    <div>
      <div class="flex items-center justify-between">
        <Label htmlFor={id}>
          {label}
          {description && <InfoTooltip content={description} class="mt-0.5" />}
        </Label>
        <Switch
          id={id}
          checked={enabled}
          onCheckedChange={(checked) => {
            return onToggle(checked ? { ...defaultValue, ...value } : false);
          }}
        />
      </div>
      <CollapsibleContent open={enabled}>
        <CollapsibleTrigger
          class="mt-2 w-full justify-between py-1"
          onClick={() => {
            return setOpen(!open);
          }}
          aria-expanded={open}
        >
          <span class="text-muted-foreground text-xs">Configuration</span>
          <svg
            class={`size-3.5 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent open={open}>
          <div class="border-l-2 border-border mt-1.5 space-y-2 pl-3">
            {fields.map((field) => {
              const raw = value[field.key];

              return (
                <TextField
                  key={field.key}
                  label={field.label}
                  value={typeof raw === 'string' ? raw : String(raw ?? '')}
                  onInput={(text) => {
                    return onFieldChange(field.key, text);
                  }}
                />
              );
            })}
          </div>
        </CollapsibleContent>
      </CollapsibleContent>
    </div>
  );
}
