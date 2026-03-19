import type { ThemeOverrideValue, ThemeVariable } from '@experiences/theme';
import { AUTOCOMPLETE_VARIABLES } from '@experiences/theme/autocomplete';
import { AUTOCOMPLETE_PRESETS } from '@experiences/theme/autocomplete-presets';

import { rgbTripletToHex } from '../../utils/css-colors';

export type ThemeMode = 'light' | 'dark';

export const GROUP_LABELS: Record<string, string> = {
  colors: 'Colors',
  typography: 'Typography',
  icons: 'Icons',
  transitions: 'Transitions',
  input: 'Input',
  panel: 'Panel',
  items: 'Items',
  headers: 'Headers',
  detached: 'Detached',
  scrollbar: 'Scrollbar',
  noResults: 'No Results',
};

export const GROUP_ORDER = [
  'colors',
  'typography',
  'icons',
  'transitions',
  'input',
  'panel',
  'items',
  'headers',
  'noResults',
  'detached',
  'scrollbar',
];

export const SWATCH_KEYS = [
  'autocomplete-primary-color',
  'autocomplete-background-color',
  'autocomplete-text-color',
  'autocomplete-border-color',
] as const;

const CATALOG_DEFAULTS: Record<string, Record<ThemeMode, string>> = {};
for (const variable of AUTOCOMPLETE_VARIABLES) {
  if (variable.type === 'color') {
    if (typeof variable.default === 'string') {
      CATALOG_DEFAULTS[variable.key] = {
        light: variable.default,
        dark: variable.default,
      };
    } else if (!Array.isArray(variable.default)) {
      CATALOG_DEFAULTS[variable.key] = variable.default as {
        light: string;
        dark: string;
      };
    }
  }
}

export function getSwatchColors(
  overrides: Record<string, ThemeOverrideValue>,
  mode: ThemeMode
): string[] {
  return SWATCH_KEYS.map((key) => {
    const value = overrides[key];
    if (typeof value === 'string') {
      return rgbTripletToHex(value);
    }
    const defaults = CATALOG_DEFAULTS[key];
    return defaults ? rgbTripletToHex(defaults[mode]) : '#888888';
  });
}

export function findMatchingPreset(themeOverrides: {
  light: Record<string, ThemeOverrideValue>;
  dark: Record<string, ThemeOverrideValue>;
}): string | null {
  for (const preset of AUTOCOMPLETE_PRESETS) {
    const lightMatch = overridesMatch(
      themeOverrides.light,
      preset.overrides.light
    );
    const darkMatch = overridesMatch(
      themeOverrides.dark,
      preset.overrides.dark
    );
    if (lightMatch && darkMatch) {
      return preset.name;
    }
  }
  return null;
}

function overridesMatch(
  actual: Record<string, ThemeOverrideValue>,
  expected: Record<string, ThemeOverrideValue>
): boolean {
  const actualKeys = Object.keys(actual);
  const expectedKeys = Object.keys(expected);
  if (actualKeys.length !== expectedKeys.length) return false;
  for (const key of expectedKeys) {
    if (!(key in actual)) return false;
    if (JSON.stringify(actual[key]) !== JSON.stringify(expected[key]))
      return false;
  }
  return true;
}

export function getDefault(
  variable: ThemeVariable,
  mode: ThemeMode
): ThemeOverrideValue {
  if (typeof variable.default === 'string' || Array.isArray(variable.default)) {
    return variable.default;
  }

  return variable.default[mode];
}

export function getCurrentValue(
  variable: ThemeVariable,
  overrides: Record<string, ThemeOverrideValue>,
  mode: ThemeMode
): ThemeOverrideValue {
  return overrides[variable.key] ?? getDefault(variable, mode);
}

export function hasOverride(
  variable: ThemeVariable,
  overrides: Record<string, ThemeOverrideValue>,
  baselineOverrides?: Record<string, ThemeOverrideValue>
): boolean {
  if (baselineOverrides) {
    const current = overrides[variable.key];
    const baseline = baselineOverrides[variable.key];
    if (current === undefined && baseline === undefined) return false;
    return JSON.stringify(current) !== JSON.stringify(baseline);
  }
  return variable.key in overrides;
}
