import { isShadowLayers } from '..';

import type { ShadowLayer, ThemeVariable, ThemeOverrides } from '..';

type ThemeOverrideValue = string | number | ShadowLayer[];

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

      if (isShadowLayers(raw)) {
        return `  --ais-${variable.key}: ${shadowLayersToCss(raw)};`;
      }

      const value = variable.constraints?.unit
        ? `${raw}${variable.constraints.unit}`
        : raw;

      return `  --ais-${variable.key}: ${value};`;
    })
    .join('\n');
}

function shadowLayersToCss(layers: ShadowLayer[]): string {
  return layers
    .map((layer) => {
      return `${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${layer.spread}px rgba(${layer.color}, ${layer.opacity})`;
    })
    .join(', ');
}

function getDefault(
  variable: ThemeVariable,
  mode: 'light' | 'dark'
): string | ShadowLayer[] {
  if (typeof variable.default === 'string' || Array.isArray(variable.default)) {
    return variable.default;
  }

  return variable.default[mode];
}
