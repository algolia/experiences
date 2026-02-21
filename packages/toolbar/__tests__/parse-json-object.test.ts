import { describe, expect, it } from 'vitest';

import { parseJsonObject } from '../src/utils/parse-json-object';

describe('parseJsonObject', () => {
  it('returns the parsed object for a valid JSON object string', () => {
    expect(parseJsonObject('{"hitsPerPage": 20}')).toEqual({
      success: true,
      value: { hitsPerPage: 20 },
    });
  });

  it('returns the parsed object for a deeply nested object', () => {
    const input = JSON.stringify({
      filters: { category: { nested: { deep: true } } },
      hitsPerPage: 10,
    });

    expect(parseJsonObject(input)).toEqual({
      success: true,
      value: {
        filters: { category: { nested: { deep: true } } },
        hitsPerPage: 10,
      },
    });
  });

  it('returns an error for a JSON array', () => {
    expect(parseJsonObject('[1, 2, 3]')).toEqual({
      success: false,
      error: 'Must be a JSON object',
    });
  });

  it('returns an error for a JSON string primitive', () => {
    expect(parseJsonObject('"hello"')).toEqual({
      success: false,
      error: 'Must be a JSON object',
    });
  });

  it('returns an error for a JSON number primitive', () => {
    expect(parseJsonObject('42')).toEqual({
      success: false,
      error: 'Must be a JSON object',
    });
  });

  it('returns an error for JSON null', () => {
    expect(parseJsonObject('null')).toEqual({
      success: false,
      error: 'Must be a JSON object',
    });
  });

  it('returns an error for invalid JSON', () => {
    expect(parseJsonObject('{not valid json}')).toEqual({
      success: false,
      error: 'Invalid JSON',
    });
  });

  it('returns an error for an empty string', () => {
    expect(parseJsonObject('')).toEqual({
      success: false,
      error: 'Invalid JSON',
    });
  });
});
