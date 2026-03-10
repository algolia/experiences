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
  default:
    | string
    | ShadowLayer[]
    | { light: string; dark: string }
    | { light: ShadowLayer[]; dark: ShadowLayer[] };
  description: string;
  constraints?: { min?: number; max?: number; step?: number; unit?: string };
};

type ThemeOverrideValue = string | number | ShadowLayer[];

/**
 * Theme overrides, either a flat record (applied to both modes) or per-mode.
 */
export type ThemeOverrides =
  | Record<string, ThemeOverrideValue>
  | {
      light: Record<string, ThemeOverrideValue>;
      dark: Record<string, ThemeOverrideValue>;
    };

/**
 * Type predicate to check if a value is a ShadowLayer array.
 */
export function isShadowLayers(value: unknown): value is ShadowLayer[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0] !== null &&
    'blur' in value[0]
  );
}
