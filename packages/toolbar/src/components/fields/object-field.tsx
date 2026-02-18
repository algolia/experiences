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
  return (
    <div class="space-y-1.5">
      <p class="text-xs font-medium text-foreground">{label}</p>
      <div class="space-y-2 rounded-md border border-border p-3">
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
    </div>
  );
}
