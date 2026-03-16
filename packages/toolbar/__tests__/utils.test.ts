import { afterEach, describe, expect, it } from 'vitest';

import { sanitizeExperience, withAutocompleteFocus } from '../src/lib/utils';

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

describe('withAutocompleteFocus', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns experience unchanged when no autocomplete block exists', () => {
    const experience = {
      blocks: [{ type: 'ais.hits', parameters: { container: '#hits' } }],
    };

    expect(withAutocompleteFocus(experience)).toBe(experience);
  });

  it('sets autofocus to true when autocomplete panel is open', () => {
    document.body.innerHTML =
      '<input class="ais-AutocompleteInput" aria-expanded="true" />';

    const result = withAutocompleteFocus({
      blocks: [
        {
          type: 'ais.autocomplete',
          parameters: { container: '#autocomplete' },
        },
      ],
    });

    expect(result.blocks[0]!.parameters.autofocus).toBe(true);
  });

  it('sets autofocus to false when autocomplete panel is closed', () => {
    document.body.innerHTML =
      '<input class="ais-AutocompleteInput" aria-expanded="false" />';

    const result = withAutocompleteFocus({
      blocks: [
        {
          type: 'ais.autocomplete',
          parameters: { container: '#autocomplete' },
        },
      ],
    });

    expect(result.blocks[0]!.parameters.autofocus).toBe(false);
  });

  it('sets autofocus to false when no autocomplete input is on the page', () => {
    const result = withAutocompleteFocus({
      blocks: [
        {
          type: 'ais.autocomplete',
          parameters: { container: '#autocomplete' },
        },
      ],
    });

    expect(result.blocks[0]!.parameters.autofocus).toBe(false);
  });

  it('does not modify non-autocomplete blocks', () => {
    document.body.innerHTML =
      '<input class="ais-AutocompleteInput" aria-expanded="true" />';

    const result = withAutocompleteFocus({
      blocks: [
        { type: 'ais.hits', parameters: { container: '#hits' } },
        {
          type: 'ais.autocomplete',
          parameters: { container: '#autocomplete' },
        },
      ],
    });

    expect(result.blocks[0]!.parameters).toEqual({ container: '#hits' });
    expect(result.blocks[1]!.parameters.autofocus).toBe(true);
  });
});
