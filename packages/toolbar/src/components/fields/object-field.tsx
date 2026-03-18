import { useId, useState } from 'preact/hooks';

import { ChevronDown } from 'lucide-preact';

import { InfoTooltip } from './info-tooltip';
import { CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { TextField } from './text-field';
import type { Suggestion } from '../ui/combobox';

type ObjectFieldProps = {
  label: string;
  description?: string;
  enabled: boolean;
  value: Record<string, unknown>;
  defaultValue: Record<string, unknown>;
  disabledValue?: false | undefined;
  fields: Array<{ key: string; label: string }>;
  onToggle: (value: false | undefined | Record<string, unknown>) => void;
  onFieldChange: (key: string, value: string) => void;
  fieldSuggestLists?: Record<string, Suggestion[]>;
};

export function ObjectField({
  label,
  description,
  enabled,
  value,
  defaultValue,
  disabledValue,
  fields,
  onToggle,
  onFieldChange,
  fieldSuggestLists,
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
            return onToggle(
              checked ? { ...defaultValue, ...value } : disabledValue
            );
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
          <ChevronDown
            class={`size-3.5 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          />
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
                  suggestions={fieldSuggestLists?.[field.key]}
                />
              );
            })}
          </div>
        </CollapsibleContent>
      </CollapsibleContent>
    </div>
  );
}
