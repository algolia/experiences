import { describe, it, expect } from 'vitest';

import { createThemeOverridesSchema } from '../create-theme-overrides-schema';

import type { ThemeVariable } from '../../types';

const variables: ThemeVariable[] = [
  {
    key: 'brand-color',
    label: 'Brand color',
    type: 'color',
    group: 'colors',
    default: { light: '30, 89, 255', dark: '110, 160, 255' },
    description: 'Primary brand color.',
  },
  {
    key: 'border-radius',
    label: 'Border radius',
    type: 'number',
    group: 'layout',
    default: '4',
    description: 'Corner rounding.',
    constraints: { min: 0, max: 32, step: 1, unit: 'px' },
  },
  {
    key: 'opacity',
    label: 'Opacity',
    type: 'number',
    group: 'colors',
    default: '0.8',
    description: 'Global opacity.',
  },
  {
    key: 'shadow',
    label: 'Shadow',
    type: 'shadow',
    group: 'effects',
    default: [
      {
        offsetX: 0,
        offsetY: 2,
        blur: 4,
        spread: 0,
        color: '0, 0, 0',
        opacity: 0.1,
      },
    ],
    description: 'Box shadow value.',
  },
];

describe('createThemeOverridesSchema', () => {
  const schema = createThemeOverridesSchema(variables);

  describe('validation', () => {
    it('rejects an empty object (requires at least one mode)', () => {
      expect(schema.safeParse({}).success).toBe(false);
    });

    it('accepts light mode only', () => {
      const result = schema.safeParse({
        light: { 'brand-color': '255, 0, 0' },
      });

      expect(result.success).toBe(true);
    });

    it('accepts dark mode only', () => {
      const result = schema.safeParse({
        dark: { 'brand-color': '110, 160, 255' },
      });

      expect(result.success).toBe(true);
    });

    it('accepts both modes', () => {
      const result = schema.safeParse({
        light: { 'brand-color': '255, 0, 0' },
        dark: { 'brand-color': '110, 160, 255' },
      });

      expect(result.success).toBe(true);
    });

    it('accepts empty mode objects', () => {
      const result = schema.safeParse({ light: {} });

      expect(result.success).toBe(true);
    });

    it('accepts a valid partial overrides object', () => {
      const result = schema.safeParse({
        light: {
          'brand-color': '255, 0, 0',
          'border-radius': 12,
        },
      });

      expect(result.success).toBe(true);
    });

    it('accepts all fields at once', () => {
      const result = schema.safeParse({
        light: {
          'brand-color': '255, 0, 0',
          'border-radius': 16,
          opacity: 0.5,
          shadow: [
            {
              offsetX: 0,
              offsetY: 4,
              blur: 8,
              spread: 0,
              color: '0, 0, 0',
              opacity: 0.2,
            },
          ],
        },
      });

      expect(result.success).toBe(true);
    });

    it('rejects a number for a color variable', () => {
      const result = schema.safeParse({
        light: { 'brand-color': 123 },
      });

      expect(result.success).toBe(false);
    });

    it('rejects a string for a number variable', () => {
      const result = schema.safeParse({
        light: { 'border-radius': '12px' },
      });

      expect(result.success).toBe(false);
    });

    it('rejects a number below the minimum', () => {
      const result = schema.safeParse({
        light: { 'border-radius': -1 },
      });

      expect(result.success).toBe(false);
    });

    it('rejects a number above the maximum', () => {
      const result = schema.safeParse({
        light: { 'border-radius': 999 },
      });

      expect(result.success).toBe(false);
    });

    it('accepts a number between steps (step is a UI hint, not a validation constraint)', () => {
      const result = schema.safeParse({
        light: { 'border-radius': 4.5 },
      });

      expect(result.success).toBe(true);
    });

    it('accepts any number when there are no constraints', () => {
      const result = schema.safeParse({
        light: { opacity: 123.456 },
      });

      expect(result.success).toBe(true);
    });

    it('accepts a valid shadow layer array', () => {
      const result = schema.safeParse({
        light: {
          shadow: [
            {
              offsetX: 0,
              offsetY: 2,
              blur: 4,
              spread: 0,
              color: '0, 0, 0',
              opacity: 0.1,
            },
            {
              offsetX: 0,
              offsetY: 6,
              blur: 16,
              spread: -4,
              color: '23, 23, 23',
              opacity: 0.15,
            },
          ],
        },
      });

      expect(result.success).toBe(true);
    });

    it('rejects an empty array for a shadow variable', () => {
      const result = schema.safeParse({
        light: { shadow: [] },
      });

      expect(result.success).toBe(false);
    });

    it('rejects a shadow array with more than 4 layers', () => {
      const layer = {
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        spread: 0,
        color: '0, 0, 0',
        opacity: 0.1,
      };
      const result = schema.safeParse({
        light: { shadow: [layer, layer, layer, layer, layer] },
      });

      expect(result.success).toBe(false);
    });

    it('rejects a shadow layer with negative blur', () => {
      const result = schema.safeParse({
        light: {
          shadow: [
            {
              offsetX: 0,
              offsetY: 0,
              blur: -1,
              spread: 0,
              color: '0, 0, 0',
              opacity: 0.5,
            },
          ],
        },
      });

      expect(result.success).toBe(false);
    });

    it('rejects a shadow layer with opacity > 1', () => {
      const result = schema.safeParse({
        light: {
          shadow: [
            {
              offsetX: 0,
              offsetY: 0,
              blur: 4,
              spread: 0,
              color: '0, 0, 0',
              opacity: 1.5,
            },
          ],
        },
      });

      expect(result.success).toBe(false);
    });

    it('rejects a non-array value for a shadow variable', () => {
      const result = schema.safeParse({
        light: { shadow: '0 2px 4px rgba(0,0,0,0.1)' },
      });

      expect(result.success).toBe(false);
    });
  });

  describe('toJsonSchema', () => {
    type JsonSchemaProperty = {
      type?: string;
      description?: string;
      minimum?: number;
      maximum?: number;
    };
    type JsonSchemaObject = {
      properties: Record<
        string,
        { properties?: Record<string, JsonSchemaProperty> }
      >;
    };

    function getLightProperties(
      jsonSchema: ReturnType<typeof schema.toJsonSchema>
    ) {
      const top = (jsonSchema as JsonSchemaObject).properties;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- test helper, shape is known
      return top['light']!.properties!;
    }

    it('has light and dark properties at the top level', () => {
      const jsonSchema = schema.toJsonSchema();
      const properties = (jsonSchema as JsonSchemaObject).properties;

      expect(Object.keys(properties)).toEqual(['light', 'dark']);
    });

    it('has variable keys inside each mode', () => {
      const lightProperties = getLightProperties(schema.toJsonSchema());

      expect(Object.keys(lightProperties)).toEqual([
        'brand-color',
        'border-radius',
        'opacity',
        'shadow',
      ]);
    });

    it('includes descriptions with defaults', () => {
      const brandColor = getLightProperties(schema.toJsonSchema())[
        'brand-color'
      ];

      expect(brandColor?.description).toContain('Primary brand color.');
      expect(brandColor?.description).toContain('Default: 30, 89, 255.');
    });

    it('includes RGB format hint for color variables', () => {
      const brandColor = getLightProperties(schema.toJsonSchema())[
        'brand-color'
      ];

      expect(brandColor?.description).toContain('Format: R, G, B.');
    });

    it('includes unit in descriptions for constrained numbers', () => {
      const borderRadius = getLightProperties(schema.toJsonSchema())[
        'border-radius'
      ];

      expect(borderRadius?.description).toContain('Unit: px.');
    });

    it('includes numeric constraints', () => {
      const borderRadius = getLightProperties(schema.toJsonSchema())[
        'border-radius'
      ];

      expect(borderRadius?.minimum).toBe(0);
      expect(borderRadius?.maximum).toBe(32);
    });

    it('maps color variables to string type', () => {
      const lightProperties = getLightProperties(schema.toJsonSchema());

      expect(lightProperties['brand-color']?.type).toBe('string');
    });

    it('maps number variables to number type', () => {
      const lightProperties = getLightProperties(schema.toJsonSchema());

      expect(lightProperties['border-radius']?.type).toBe('number');
      expect(lightProperties['opacity']?.type).toBe('number');
    });

    it('maps shadow variables to array type', () => {
      const lightProperties = getLightProperties(schema.toJsonSchema());

      expect(lightProperties['shadow']?.type).toBe('array');
    });
  });
});
