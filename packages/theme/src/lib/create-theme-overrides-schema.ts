import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { isShadowLayers } from '../predicates/is-shadow-layers';

import type { ThemeVariable } from '..';

/**
 * Builds a Zod schema for theme overrides from a variable catalog.
 *
 * - `color` variables → `z.string()` (RGB triplet like "30, 89, 255")
 * - `number` variables → `z.number()` with min/max/step constraints
 * - `shadow` variables → `z.array(shadowLayerSchema)` (1–4 structured layers)
 * - `text` variables → `z.string()`
 *
 * All fields are optional — the agent only returns the values it wants to override.
 * Each field includes a `.describe()` with the variable's description, default, and unit.
 */
export function createThemeOverridesSchema(variables: ThemeVariable[]) {
  const flatShape = Object.fromEntries(
    variables.map((variable) => {
      return [variable.key, variableToZodField(variable)];
    })
  );

  const modeSchema = z.object(flatShape);

  const schema = z
    .object({
      light: modeSchema.optional(),
      dark: modeSchema.optional(),
    })
    .refine(
      (data) => {
        return data.light !== undefined || data.dark !== undefined;
      },
      {
        message: 'At least one of "light" or "dark" must be provided.',
      }
    );

  return Object.assign(schema, {
    toJsonSchema() {
      return zodToJsonSchema(schema);
    },
  });
}

const shadowLayerSchema = z.object({
  offsetX: z.number(),
  offsetY: z.number(),
  blur: z.number().min(0),
  spread: z.number(),
  color: z.string(),
  opacity: z.number().min(0).max(1),
});

function variableToZodField(variable: ThemeVariable) {
  const description = buildDescription(variable);

  switch (variable.type) {
    case 'color': {
      return z.string().optional().describe(description);
    }
    case 'number': {
      let schema = z.number();
      if (variable.constraints?.min != null) {
        schema = schema.min(variable.constraints.min);
      }
      if (variable.constraints?.max != null) {
        schema = schema.max(variable.constraints.max);
      }
      // `step` is a UI hint for slider increments, not a validation constraint.
      // Floating point arithmetic makes `multipleOf` unreliable for fractional
      // steps (e.g. 0.15 fails `multipleOf(0.1)` due to IEEE 754 rounding).
      return schema.optional().describe(description);
    }
    case 'shadow': {
      return z
        .array(shadowLayerSchema)
        .min(1)
        .max(4)
        .optional()
        .describe(description);
    }
    case 'text': {
      return z.string().optional().describe(description);
    }
  }
}

function getDefaultString(variable: ThemeVariable): string {
  const def = variable.default;

  if (typeof def === 'string') {
    return def;
  }

  if (isShadowLayers(def)) {
    return JSON.stringify(def);
  }

  const modeDefault = def.light;

  return isShadowLayers(modeDefault)
    ? JSON.stringify(modeDefault)
    : modeDefault;
}

function buildDescription(variable: ThemeVariable): string {
  const parts = [variable.description];

  if (variable.type === 'color') {
    parts.push('Format: R, G, B.');
  }

  if (variable.type === 'shadow') {
    parts.push(
      'Format: array of shadow layers, each with { offsetX, offsetY, blur, spread, color, opacity }. Color is "R, G, B" format. Opacity is 0–1. Blur must be >= 0. Max 4 layers.'
    );
  }

  const defaultValue = getDefaultString(variable);

  if (variable.constraints?.unit) {
    parts.push(`Unit: ${variable.constraints.unit}.`);
  }

  parts.push(`Default: ${defaultValue}.`);

  return parts.join(' ');
}
