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
  | Record<string, string>
  | { light: Record<string, string>; dark: Record<string, string> };

/**
 * Generates a complete theme CSS string with `:root` (light) and dark mode blocks.
 * Merges catalog defaults with optional user overrides for both blocks.
 */
export function generateThemeCss(
  variables: ThemeVariable[],
  overrides: ThemeOverrides = {}
): string {
  const isPerMode =
    typeof (overrides as { light?: unknown }).light === 'object';
  const lightOverrides = isPerMode
    ? (overrides as { light: Record<string, string> }).light
    : (overrides as Record<string, string>);
  const darkOverrides = isPerMode
    ? (overrides as { dark: Record<string, string> }).dark
    : (overrides as Record<string, string>);

  const light = generateDeclarations(variables, 'light', lightOverrides);
  const dark = generateDeclarations(variables, 'dark', darkOverrides);

  return `:root {\n${light}\n}\n\n:root[data-theme='dark'], .dark {\n${dark}\n}`;
}

function generateDeclarations(
  variables: ThemeVariable[],
  mode: 'light' | 'dark',
  overrides: Record<string, string>
): string {
  return variables
    .map((variable) => {
      const raw = overrides[variable.key] ?? getDefault(variable, mode);
      const value = variable.constraints?.unit
        ? `${raw}${variable.constraints.unit}`
        : raw;

      return `  --ais-${variable.key}: ${value};`;
    })
    .join('\n');
}

function getDefault(variable: ThemeVariable, mode: 'light' | 'dark'): string {
  if (typeof variable.default === 'string') {
    return variable.default;
  }

  return variable.default[mode];
}
