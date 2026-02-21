import {
  hexToRgbTriplet,
  isHexColor,
  isRgbTriplet,
  rgbTripletToHex,
} from '../../utils/css-colors';
import { ColorField } from './color-field';
import { TextField } from './text-field';

type CssVariablesEditorProps = {
  variables: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

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
              onInput={(color) => {
                return onChange(key, color);
              }}
            />
          );
        }

        if (isRgbTriplet(value)) {
          return (
            <ColorField
              key={key}
              label={key}
              value={rgbTripletToHex(value)}
              onInput={(color) => {
                return onChange(key, hexToRgbTriplet(color));
              }}
            />
          );
        }

        return (
          <TextField
            key={key}
            label={key}
            value={value}
            onInput={(text) => {
              return onChange(key, text);
            }}
          />
        );
      })}
    </div>
  );
}
