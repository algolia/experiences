import type { ThemeVariable, ThemeOverrides } from '..';

type ThemeOverrideValue = string | number;

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
    ? (overrides as { light: Record<string, ThemeOverrideValue> }).light
    : (overrides as Record<string, ThemeOverrideValue>);
  const darkOverrides = isPerMode
    ? (overrides as { dark: Record<string, ThemeOverrideValue> }).dark
    : (overrides as Record<string, ThemeOverrideValue>);

  const light = generateDeclarations(variables, 'light', lightOverrides);
  const dark = generateDeclarations(variables, 'dark', darkOverrides);

  return `:root {\n${light}\n}\n\n:root[data-theme='dark'], .dark {\n${dark}\n}`;
}

function generateDeclarations(
  variables: ThemeVariable[],
  mode: 'light' | 'dark',
  overrides: Record<string, ThemeOverrideValue>
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
