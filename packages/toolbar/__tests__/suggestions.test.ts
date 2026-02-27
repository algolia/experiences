import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  fetchSuggestions,
  getSuggestionSourceForParam,
} from '../src/ai/suggestions';

const server = setupServer();

beforeAll(() => {
  return server.listen();
});
afterEach(() => {
  return server.resetHandlers();
});
afterAll(() => {
  return server.close();
});

describe('getSuggestionSourceForParam', () => {
  it('returns source name for known param', () => {
    expect(getSuggestionSourceForParam('attribute')).toBe('facetAttributes');
  });

  it('returns undefined for unknown param', () => {
    expect(getSuggestionSourceForParam('unknownParam')).toBeUndefined();
  });
});

describe('fetchSuggestions', () => {
  const credentials = { appId: 'APP_ID', apiKey: 'API_KEY' };

  it('returns sorted facet attributes with modifiers stripped', async () => {
    server.use(
      http.get(
        'https://APP_ID-dsn.algolia.net/1/indexes/products/settings',
        () => {
          return HttpResponse.json({
            attributesForFaceting: [
              'searchable(brand)',
              'filterOnly(price)',
              'color',
              'size',
            ],
          });
        }
      )
    );

    const result = await fetchSuggestions(
      'facetAttributes',
      credentials,
      'products'
    );

    expect(result).toEqual({
      values: ['brand', 'color', 'price', 'size'],
      description: 'Facet attributes configured in the Algolia index settings',
    });
  });

  it('returns error for unknown source', async () => {
    const result = await fetchSuggestions(
      'unknownSource',
      credentials,
      'products'
    );

    expect(result).toEqual({
      error: 'Unknown suggestion source: unknownSource',
    });
  });

  it('returns error when fetch fails', async () => {
    server.use(
      http.get(
        'https://APP_ID-dsn.algolia.net/1/indexes/products/settings',
        () => {
          return HttpResponse.error();
        }
      )
    );

    const result = await fetchSuggestions(
      'facetAttributes',
      credentials,
      'products'
    );

    expect(result).toEqual({
      error:
        'Failed to fetch suggestions from facetAttributes for index "products"',
    });
  });
});
