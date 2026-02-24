import { describe, expect, it, vi } from 'vitest';

import type { ExperienceApiResponse } from '../src/types';

vi.mock('../src/widget-types', () => {
  return {
    WIDGET_TYPES: {
      'test.items-list': {
        label: 'Test',
        enabled: true,
        icon: null,
        defaultParameters: { items: [] },
        fieldOverrides: {
          items: {
            type: 'items-list',
            label: 'Items',
            fields: [
              { key: 'value', label: 'Value' },
              { key: 'label', label: 'Label' },
            ],
          },
        },
      },
    },
  };
});

// Import after mock so it picks up the mocked widget types.
const { sanitizeExperience } = await import('../src/lib/utils');

function createExperience(
  blocks: ExperienceApiResponse['blocks']
): ExperienceApiResponse {
  return { blocks };
}

describe('sanitizeExperience', () => {
  describe('items-list fields', () => {
    it('trims whitespace from item values', () => {
      const experience = createExperience([
        {
          type: 'test.items-list',
          parameters: {
            items: [{ value: '  products_asc  ', label: '  Ascending  ' }],
          },
        },
      ]);

      const result = sanitizeExperience(experience);

      expect(result.blocks[0]!.parameters.items).toEqual([
        { value: 'products_asc', label: 'Ascending' },
      ]);
    });

    it('removes items where all fields are empty', () => {
      const experience = createExperience([
        {
          type: 'test.items-list',
          parameters: {
            items: [
              { value: 'products_asc', label: 'Ascending' },
              { value: '', label: '' },
            ],
          },
        },
      ]);

      const result = sanitizeExperience(experience);

      expect(result.blocks[0]!.parameters.items).toEqual([
        { value: 'products_asc', label: 'Ascending' },
      ]);
    });

    it('removes items that are only whitespace', () => {
      const experience = createExperience([
        {
          type: 'test.items-list',
          parameters: {
            items: [{ value: '  ', label: '  ' }],
          },
        },
      ]);

      const result = sanitizeExperience(experience);

      expect(result.blocks[0]!.parameters.items).toBeUndefined();
    });

    it('sets items to undefined when all are empty', () => {
      const experience = createExperience([
        {
          type: 'test.items-list',
          parameters: {
            items: [
              { value: '', label: '' },
              { value: '', label: '' },
            ],
          },
        },
      ]);

      const result = sanitizeExperience(experience);

      expect(result.blocks[0]!.parameters.items).toBeUndefined();
    });

    it('keeps items with at least one non-empty field', () => {
      const experience = createExperience([
        {
          type: 'test.items-list',
          parameters: {
            items: [{ value: 'products_asc', label: '' }],
          },
        },
      ]);

      const result = sanitizeExperience(experience);

      expect(result.blocks[0]!.parameters.items).toEqual([
        { value: 'products_asc', label: '' },
      ]);
    });

    it('does not modify blocks without items-list overrides', () => {
      const experience = createExperience([
        {
          type: 'unknown.widget',
          parameters: {
            container: '#search',
          },
        },
      ]);

      const result = sanitizeExperience(experience);

      expect(result.blocks[0]!.parameters).toEqual({ container: '#search' });
    });

    it('preserves other parameters on the block', () => {
      const experience = createExperience([
        {
          type: 'test.items-list',
          parameters: {
            container: '#sort',
            items: [{ value: 'products_asc', label: 'Ascending' }],
          },
        },
      ]);

      const result = sanitizeExperience(experience);

      expect(result.blocks[0]!.parameters.container).toBe('#sort');
      expect(result.blocks[0]!.parameters.items).toEqual([
        { value: 'products_asc', label: 'Ascending' },
      ]);
    });
  });
});
