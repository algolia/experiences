import { useState } from 'preact/hooks';
import { CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { TextField } from './text-field';

type ObjectFieldProps = {
  label: string;
  value: Record<string, unknown>;
  fields: Array<{ key: string; label: string }>;
  onChange: (key: string, value: string) => void;
};

export function ObjectField({
  label,
  value,
  fields,
  onChange,
}: ObjectFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <CollapsibleTrigger
        class="group w-full justify-between py-1"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span class="text-xs font-medium text-foreground">{label}</span>
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
                onInput={(v) => onChange(field.key, v)}
              />
            );
          })}
        </div>
      </CollapsibleContent>
    </div>
  );
}
