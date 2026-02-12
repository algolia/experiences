import { ColorField } from './color-field';
import { TextField } from './text-field';

type CssVariablesEditorProps = {
  variables: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

function isColorValue(value: string): boolean {
  return /^#([0-9a-f]{3,8})$/i.test(value);
}

export function CssVariablesEditor({
  variables,
  onChange,
}: CssVariablesEditorProps) {
  const entries = Object.entries(variables);

  if (entries.length === 0) {
    return (
      <p class="text-xs text-muted-foreground">No CSS variables defined.</p>
    );
  }

  return (
    <div class="space-y-2">
      {entries.map(([key, value]) =>
        isColorValue(value) ? (
          <ColorField
            key={key}
            label={key}
            value={value}
            onInput={(v) => onChange(key, v)}
          />
        ) : (
          <TextField
            key={key}
            label={key}
            value={value}
            onInput={(v) => onChange(key, v)}
          />
        )
      )}
    </div>
  );
}
