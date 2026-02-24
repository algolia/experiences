import { describe, expect, it } from 'vitest';

import { sanitizeExperience } from '../src/lib/utils';

describe('sanitizeExperience', () => {
  it('trims whitespace from list items', () => {
    const result = sanitizeExperience({
      blocks: [
        {
          type: 'ais.clearRefinements',
          parameters: {
            container: '#clear',
            includedAttributes: ['  brand  ', ' color '],
          },
        },
      ],
    });

    expect(result.blocks[0]!.parameters.includedAttributes).toEqual([
      'brand',
      'color',
    ]);
  });

  it('removes empty items from lists', () => {
    const result = sanitizeExperience({
      blocks: [
        {
          type: 'ais.clearRefinements',
          parameters: {
            container: '#clear',
            includedAttributes: ['brand', '', '  '],
          },
        },
      ],
    });

    expect(result.blocks[0]!.parameters.includedAttributes).toEqual(['brand']);
  });

  it('sets list to undefined when all items are empty', () => {
    const result = sanitizeExperience({
      blocks: [
        {
          type: 'ais.clearRefinements',
          parameters: {
            container: '#clear',
            includedAttributes: ['', '  '],
          },
        },
      ],
    });

    expect(result.blocks[0]!.parameters.includedAttributes).toBeUndefined();
  });

  it('does not modify non-list parameters', () => {
    const result = sanitizeExperience({
      blocks: [
        {
          type: 'ais.clearRefinements',
          parameters: {
            container: '#clear',
            includedAttributes: undefined,
          },
        },
      ],
    });

    expect(result.blocks[0]!.parameters.container).toBe('#clear');
  });
});
