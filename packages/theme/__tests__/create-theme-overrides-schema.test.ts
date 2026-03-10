import { describe, it, expect } from 'vitest';

import { createThemeOverridesSchema } from '../src/lib/create-theme-overrides-schema';

import type { ThemeVariable } from '../src/types';

const variables: ThemeVariable[] = [
  {
    key: 'brand-color',
    label: 'Brand color',
    type: 'color',
    default: { light: '30, 89, 255', dark: '110, 160, 255' },
    description: 'Primary brand color.',
  },
  {
    key: 'border-radius',
    label: 'Border radius',
    type: 'number',
    default: '4',
    description: 'Corner rounding.',
    constraints: { min: 0, max: 32, step: 1, unit: 'px' },
  },
  {
    key: 'opacity',
    label: 'Opacity',
    type: 'number',
    default: '0.8',
    description: 'Global opacity.',
  },
  {
    key: 'shadow',
    label: 'Shadow',
    type: 'text',
    default: '0 2px 4px rgba(0,0,0,0.1)',
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
          shadow: '0 4px 8px rgba(0,0,0,0.2)',
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

    it('rejects a number that does not match the step', () => {
      const result = schema.safeParse({
        light: { 'border-radius': 4.5 },
      });

      expect(result.success).toBe(false);
    });

    it('accepts any number when there are no constraints', () => {
      const result = schema.safeParse({
        light: { opacity: 123.456 },
      });

      expect(result.success).toBe(true);
    });

    it('rejects a number for a text variable', () => {
      const result = schema.safeParse({
        light: { shadow: 42 },
      });

      expect(result.success).toBe(false);
    });
  });

  describe('toJsonSchema', () => {
    it('has light and dark properties at the top level', () => {
      const jsonSchema = schema.toJsonSchema();
      const properties = (jsonSchema as { properties: Record<string, unknown> })
        .properties;

      expect(Object.keys(properties)).toEqual(['light', 'dark']);
    });

    it('has variable keys inside each mode', () => {
      const jsonSchema = schema.toJsonSchema();
      const topProperties = (
        jsonSchema as {
          properties: Record<string, { properties: Record<string, unknown> }>;
        }
      ).properties;
      const lightProperties = topProperties.light.properties;

      expect(Object.keys(lightProperties)).toEqual([
        'brand-color',
        'border-radius',
        'opacity',
        'shadow',
      ]);
    });

    it('includes descriptions with defaults', () => {
      const jsonSchema = schema.toJsonSchema();
      const lightProperties = (
        jsonSchema as {
          properties: Record<
            string,
            { properties: Record<string, { description: string }> }
          >;
        }
      ).properties.light.properties;
      const brandColor = lightProperties['brand-color'];

      expect(brandColor.description).toContain('Primary brand color.');
      expect(brandColor.description).toContain('Default: 30, 89, 255.');
    });

    it('includes RGB format hint for color variables', () => {
      const jsonSchema = schema.toJsonSchema();
      const lightProperties = (
        jsonSchema as {
          properties: Record<
            string,
            { properties: Record<string, { description: string }> }
          >;
        }
      ).properties.light.properties;
      const brandColor = lightProperties['brand-color'];

      expect(brandColor.description).toContain('Format: R, G, B.');
    });

    it('includes unit in descriptions for constrained numbers', () => {
      const jsonSchema = schema.toJsonSchema();
      const lightProperties = (
        jsonSchema as {
          properties: Record<
            string,
            { properties: Record<string, { description: string }> }
          >;
        }
      ).properties.light.properties;
      const borderRadius = lightProperties['border-radius'];

      expect(borderRadius.description).toContain('Unit: px.');
    });

    it('includes numeric constraints', () => {
      const jsonSchema = schema.toJsonSchema();
      const lightProperties = (
        jsonSchema as {
          properties: Record<
            string,
            {
              properties: Record<
                string,
                { minimum?: number; maximum?: number; multipleOf?: number }
              >;
            }
          >;
        }
      ).properties.light.properties;
      const borderRadius = lightProperties['border-radius'];

      expect(borderRadius.minimum).toBe(0);
      expect(borderRadius.maximum).toBe(32);
      expect(borderRadius.multipleOf).toBe(1);
    });

    it('maps color variables to string type', () => {
      const jsonSchema = schema.toJsonSchema();
      const lightProperties = (
        jsonSchema as {
          properties: Record<
            string,
            { properties: Record<string, { type: string }> }
          >;
        }
      ).properties.light.properties;

      expect(lightProperties['brand-color'].type).toBe('string');
    });

    it('maps number variables to number type', () => {
      const jsonSchema = schema.toJsonSchema();
      const lightProperties = (
        jsonSchema as {
          properties: Record<
            string,
            { properties: Record<string, { type: string }> }
          >;
        }
      ).properties.light.properties;

      expect(lightProperties['border-radius'].type).toBe('number');
      expect(lightProperties['opacity'].type).toBe('number');
    });

    it('maps text variables to string type', () => {
      const jsonSchema = schema.toJsonSchema();
      const lightProperties = (
        jsonSchema as {
          properties: Record<
            string,
            { properties: Record<string, { type: string }> }
          >;
        }
      ).properties.light.properties;

      expect(lightProperties['shadow'].type).toBe('string');
    });
  });
});
