import { isShadowLayers } from '../predicates/is-shadow-layers';

import type {
  ShadowLayer,
  ThemeOverrideValue,
  ThemeVariable,
  ThemeOverrides,
} from '..';

/**
 * Generates a complete theme CSS string.
 *
 * - **adaptive** (default): outputs `:root` (light) and `:root[data-theme='dark']`
 *   blocks, each with their own defaults and overrides.
 * - **fixed**: outputs a single `:root` block using light defaults as baseline,
 *   ignoring dark mode entirely.
 */
export function generateThemeCss(
  variables: ThemeVariable[],
  overrides: ThemeOverrides = {},
  mode: 'adaptive' | 'fixed' = 'adaptive'
): string {
  const isPerMode =
    typeof (overrides as { light?: unknown }).light === 'object';
  const lightOverrides = isPerMode
    ? ((overrides as { light?: Record<string, ThemeOverrideValue> }).light ??
      {})
    : (overrides as Record<string, ThemeOverrideValue>);

  if (mode === 'fixed') {
    const declarations = generateDeclarations(
      variables,
      'light',
      lightOverrides
    );
    return `:root {\n${declarations}\n}${generateResponsiveRules(variables, lightOverrides)}`;
  }

  const darkOverrides = isPerMode
    ? ((overrides as { dark?: Record<string, ThemeOverrideValue> }).dark ?? {})
    : (overrides as Record<string, ThemeOverrideValue>);

  const light = generateDeclarations(variables, 'light', lightOverrides);
  const dark = generateDeclarations(variables, 'dark', darkOverrides);

  return `:root {\n${light}\n}\n\n:root[data-theme='dark'], .dark {\n${dark}\n}${generateResponsiveRules(variables, lightOverrides)}`;
}

function generateResponsiveRules(
  variables: ThemeVariable[],
  overrides: Record<string, ThemeOverrideValue>
): string {
  const breakpointVariable = variables.find((variable) => {
    return variable.key === 'autocomplete-panel-columns-breakpoint';
  });

  if (!breakpointVariable) {
    return '';
  }

  const raw =
    overrides[breakpointVariable.key] ??
    getDefault(breakpointVariable, 'light');
  const breakpoint = parseFloat(String(raw));

  return `\n\n@media (max-width: ${breakpoint}px) {
  .ais-AutocompletePanelTwoColumns { grid-template-columns: 1fr; }
}`;
}

const DECLARATION_EXCLUDED_KEYS = new Set([
  'autocomplete-panel-columns-breakpoint',
]);

function generateDeclarations(
  variables: ThemeVariable[],
  mode: 'light' | 'dark',
  overrides: Record<string, ThemeOverrideValue>
): string {
  return variables
    .filter((variable) => {
      return !DECLARATION_EXCLUDED_KEYS.has(variable.key);
    })
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
