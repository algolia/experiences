/**
 * Determines which editor control to render for a theme variable.
 */
export type ThemeVariableType = 'color' | 'number' | 'text';

/**
 * A single themeable CSS custom property with metadata for editors and CSS generation.
 */
export type ThemeVariable = {
  key: string;
  label: string;
  type: ThemeVariableType;
  default: string | { light: string; dark: string };
  description: string;
  constraints?: { min?: number; max?: number; step?: number; unit?: string };
};

/**
 * Theme overrides, either a flat record (applied to both modes) or per-mode.
 */
export type ThemeOverrides =
  | Record<string, string | number>
  | {
      light: Record<string, string | number>;
      dark: Record<string, string | number>;
    };
