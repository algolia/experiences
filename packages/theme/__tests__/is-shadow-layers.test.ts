import { describe, it, expect } from 'vitest';

import { isShadowLayers } from '../src/predicates/is-shadow-layers';

describe('isShadowLayers', () => {
  it('returns true for a valid single-layer shadow array', () => {
    expect(
      isShadowLayers([
        {
          offsetX: 0,
          offsetY: 2,
          blur: 4,
          spread: 0,
          color: '0, 0, 0',
          opacity: 0.1,
        },
      ])
    ).toBe(true);
  });

  it('returns true for a multi-layer shadow array', () => {
    expect(
      isShadowLayers([
        {
          offsetX: 0,
          offsetY: 0,
          blur: 0,
          spread: 1,
          color: '23, 23, 23',
          opacity: 0.05,
        },
        {
          offsetX: 0,
          offsetY: 6,
          blur: 16,
          spread: -4,
          color: '23, 23, 23',
          opacity: 0.15,
        },
      ])
    ).toBe(true);
  });

  it('returns false for a string', () => {
    expect(isShadowLayers('0 2px 4px rgba(0,0,0,0.1)')).toBe(false);
  });

  it('returns false for a number', () => {
    expect(isShadowLayers(42)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isShadowLayers(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isShadowLayers(undefined)).toBe(false);
  });

  it('returns false for an empty array', () => {
    expect(isShadowLayers([])).toBe(false);
  });

  it('returns false for an array of strings', () => {
    expect(isShadowLayers(['0 2px 4px rgba(0,0,0,0.1)'])).toBe(false);
  });

  it('returns false for an array of numbers', () => {
    expect(isShadowLayers([1, 2, 3])).toBe(false);
  });

  it('returns false for an array of objects without shadow properties', () => {
    expect(isShadowLayers([{ foo: 'bar' }])).toBe(false);
  });

  it('returns false for an array of objects with only blur (missing offsetX)', () => {
    expect(isShadowLayers([{ blur: 4 }])).toBe(false);
  });
});
