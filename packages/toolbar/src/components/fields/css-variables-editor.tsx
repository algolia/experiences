import { ColorField } from './color-field';
import { TextField } from './text-field';

type CssVariablesEditorProps = {
  variables: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

function isHexColor(value: string): boolean {
  return /^#([0-9a-f]{3,8})$/i.test(value);
}

function isRgbTriplet(value: string): boolean {
  const parts = value.split(',');

  return (
    parts.length === 3 &&
    parts.every((s) => {
      const n = Number(s.trim());

      return !isNaN(n) && n >= 0 && n <= 255;
    })
  );
}

function rgbTripletToHex(triplet: string): string {
  return (
    '#' +
    triplet
      .split(',')
      .map((s) =>
        Math.max(0, Math.min(255, Number(s.trim())))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

function hexToRgbTriplet(hex: string): string {
  const result = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);

  if (!result) {
    return '0,0,0';
  }

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ].join(',');
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
      {entries.map(([key, value]) => {
        if (isHexColor(value)) {
          return (
            <ColorField
              key={key}
              label={key}
              value={value}
              onInput={(v) => onChange(key, v)}
            />
          );
        }

        if (isRgbTriplet(value)) {
          return (
            <ColorField
              key={key}
              label={key}
              value={rgbTripletToHex(value)}
              onInput={(v) => onChange(key, hexToRgbTriplet(v))}
            />
          );
        }

        return (
          <TextField
            key={key}
            label={key}
            value={value}
            onInput={(v) => onChange(key, v)}
          />
        );
      })}
    </div>
  );
}
