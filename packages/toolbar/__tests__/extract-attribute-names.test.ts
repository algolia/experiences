import { describe, expect, it } from 'vitest';

import { extractAttributeNames } from '../src/lib/extract-attribute-names';

describe('extractAttributeNames', () => {
  it('extracts unique top-level keys from hits', () => {
    const hits = [
      { name: 'Widget', price: 9.99, objectID: '1' },
      { name: 'Gadget', brand: 'Acme', objectID: '2' },
    ];

    expect(extractAttributeNames(hits)).toEqual(['brand', 'name', 'price']);
  });

  it('excludes Algolia internal keys', () => {
    const hits = [
      {
        name: 'Widget',
        objectID: '1',
        _highlightResult: {},
        _snippetResult: {},
        _rankingInfo: {},
        _distinctSeqID: 1,
      },
    ];

    expect(extractAttributeNames(hits)).toEqual(['name']);
  });

  it('sorts alphabetically', () => {
    const hits = [{ zebra: 1, alpha: 2, mango: 3, objectID: '1' }];

    expect(extractAttributeNames(hits)).toEqual(['alpha', 'mango', 'zebra']);
  });

  it('returns empty array for empty hits', () => {
    expect(extractAttributeNames([])).toEqual([]);
  });

  it('deduplicates keys across multiple hits', () => {
    const hits = [
      { name: 'A', brand: 'X', objectID: '1' },
      { name: 'B', brand: 'Y', objectID: '2' },
      { name: 'C', color: 'red', objectID: '3' },
    ];

    expect(extractAttributeNames(hits)).toEqual(['brand', 'color', 'name']);
  });

  it('extracts nested object paths with dot notation', () => {
    const hits = [
      {
        product: { specs: { weight: 100, color: 'red' } },
        objectID: '1',
      },
    ];

    expect(extractAttributeNames(hits)).toEqual([
      'product.specs.color',
      'product.specs.weight',
    ]);
  });

  it('extracts array indices with dot notation', () => {
    const hits = [
      {
        tags: ['electronics', 'sale'],
        objectID: '1',
      },
    ];

    expect(extractAttributeNames(hits)).toEqual(['tags.0', 'tags.1']);
  });

  it('handles mixed nested and flat attributes', () => {
    const hits = [
      {
        name: 'Widget',
        meta: { brand: 'Acme', rating: 4.5 },
        objectID: '1',
      },
    ];

    expect(extractAttributeNames(hits)).toEqual([
      'meta.brand',
      'meta.rating',
      'name',
    ]);
  });
});
