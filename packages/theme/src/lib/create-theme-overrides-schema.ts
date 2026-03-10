import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { ThemeVariable } from '..';

/**
 * Builds a Zod schema for theme overrides from a variable catalog.
 *
 * - `color` variables → `z.string()` (RGB triplet like "30, 89, 255")
 * - `number` variables → `z.number()` with min/max/step constraints
 * - `text` variables → `z.string()`
 *
 * All fields are optional — the agent only returns the values it wants to override.
 * Each field includes a `.describe()` with the variable's description, default, and unit.
 */
export function createThemeOverridesSchema(variables: ThemeVariable[]) {
  const schema = z.object(
    Object.fromEntries(
      variables.map((variable) => {
        return [variable.key, variableToZodField(variable)];
      })
    )
  );

  return Object.assign(schema, {
    toJsonSchema() {
      return zodToJsonSchema(schema);
    },
  });
}

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
      if (variable.constraints?.step != null) {
        schema = schema.multipleOf(variable.constraints.step);
      }
      return schema.optional().describe(description);
    }
    case 'text': {
      return z.string().optional().describe(description);
    }
  }
}

function buildDescription(variable: ThemeVariable): string {
  const parts = [variable.description];

  if (variable.type === 'color') {
    parts.push('Format: R, G, B.');
  }

  const defaultValue =
    typeof variable.default === 'string'
      ? variable.default
      : variable.default.light;

  if (variable.constraints?.unit) {
    parts.push(`Unit: ${variable.constraints.unit}.`);
  }

  parts.push(`Default: ${defaultValue}.`);

  return parts.join(' ');
}
