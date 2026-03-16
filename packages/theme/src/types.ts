/**
 * Determines which editor control to render for a theme variable.
 */
export type ThemeVariableType = 'color' | 'number' | 'shadow' | 'text';

/**
 * A single layer of a structured box-shadow value.
 */
export type ShadowLayer = {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
};

/**
 * A single themeable CSS custom property with metadata for editors and CSS generation.
 */
export type ThemeVariable = {
  key: string;
  label: string;
  type: ThemeVariableType;
  group: string;
  default:
    | string
    | ShadowLayer[]
    | { light: string; dark: string }
    | { light: ShadowLayer[]; dark: ShadowLayer[] };
  description: string;
  constraints?: { min?: number; max?: number; step?: number; unit?: string };
};

export type ThemeOverrideValue = string | number | ShadowLayer[];

/**
 * A curated theme preset with per-mode overrides.
 */
export type ThemePreset = {
  name: string;
  overrides: {
    light: Record<string, ThemeOverrideValue>;
    dark: Record<string, ThemeOverrideValue>;
  };
};

/**
 * Theme overrides, either a flat record (applied to both modes) or per-mode.
 */
export type ThemeOverrides =
  | Record<string, ThemeOverrideValue>
  | {
      light: Record<string, ThemeOverrideValue>;
      dark: Record<string, ThemeOverrideValue>;
    };
