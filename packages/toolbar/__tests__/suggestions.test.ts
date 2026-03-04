import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  fetchSuggestions,
  getSuggestionSourceForParam,
  suggestionSourceRequiresIndexName,
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
  it('returns source name for attribute param', () => {
    expect(getSuggestionSourceForParam('attribute')).toBe('facetAttributes');
    expect(getSuggestionSourceForParam('attributes')).toBe('facetAttributes');
    expect(getSuggestionSourceForParam('includedAttributes')).toBe(
      'facetAttributes'
    );
    expect(getSuggestionSourceForParam('excludedAttributes')).toBe(
      'facetAttributes'
    );
  });

  it('returns source name for agentId param', () => {
    expect(getSuggestionSourceForParam('agentId')).toBe('agentStudioAgents');
  });

  it('returns undefined for unknown param', () => {
    expect(getSuggestionSourceForParam('unknownParam')).toBeUndefined();
  });
});

describe('suggestionSourceRequiresIndexName', () => {
  it('returns true for facetAttributes', () => {
    expect(suggestionSourceRequiresIndexName('facetAttributes')).toBe(true);
  });

  it('returns false for agentStudioAgents', () => {
    expect(suggestionSourceRequiresIndexName('agentStudioAgents')).toBe(false);
  });

  it('returns false for unknown source', () => {
    expect(suggestionSourceRequiresIndexName('unknown')).toBe(false);
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
      'beta',
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
      'beta',
      'products'
    );

    expect(result).toEqual({
      error: 'Unknown suggestion source: unknownSource',
    });
  });

  it('returns error when fetch fails for index-bound source', async () => {
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
      'beta',
      'products'
    );

    expect(result).toEqual({
      error:
        'Failed to fetch suggestions from facetAttributes for index "products"',
    });
  });

  it('returns agents sorted by name with draft agents filtered out', async () => {
    server.use(
      http.get('https://agent-studio.staging.eu.algolia.com/1/agents', () => {
        return HttpResponse.json({
          data: [
            { id: 'id-zebra', name: 'Zebra Agent', status: 'published' },
            { id: 'id-draft', name: 'Draft Agent', status: 'draft' },
            { id: 'id-alpha', name: 'Alpha Agent', status: 'published' },
          ],
          pagination: { page: 1, limit: 100, totalCount: 3, totalPages: 1 },
        });
      })
    );

    const result = await fetchSuggestions(
      'agentStudioAgents',
      credentials,
      'beta'
    );

    expect(result).toEqual({
      values: ['id-alpha', 'id-zebra'],
      description: 'Available Agent Studio agents',
      labels: {
        'id-alpha': 'Alpha Agent',
        'id-zebra': 'Zebra Agent',
      },
    });
  });

  it('fetches all pages of agents', async () => {
    server.use(
      http.get(
        'https://agent-studio.staging.eu.algolia.com/1/agents',
        ({ request }) => {
          const url = new URL(request.url);
          const page = url.searchParams.get('page') ?? '1';

          if (page === '1') {
            return HttpResponse.json({
              data: [{ id: 'id-a', name: 'Agent A', status: 'published' }],
              pagination: {
                page: 1,
                limit: 1,
                totalCount: 2,
                totalPages: 2,
              },
            });
          }

          return HttpResponse.json({
            data: [{ id: 'id-b', name: 'Agent B', status: 'published' }],
            pagination: {
              page: 2,
              limit: 1,
              totalCount: 2,
              totalPages: 2,
            },
          });
        }
      )
    );

    const result = await fetchSuggestions(
      'agentStudioAgents',
      credentials,
      'beta'
    );

    expect(result).toEqual({
      values: ['id-a', 'id-b'],
      description: 'Available Agent Studio agents',
      labels: {
        'id-a': 'Agent A',
        'id-b': 'Agent B',
      },
    });
  });

  it('returns error when agent fetch fails', async () => {
    server.use(
      http.get('https://agent-studio.staging.eu.algolia.com/1/agents', () => {
        return HttpResponse.error();
      })
    );

    const result = await fetchSuggestions(
      'agentStudioAgents',
      credentials,
      'beta'
    );

    expect(result).toEqual({
      error: 'Failed to fetch suggestions from agentStudioAgents',
    });
  });

  it('uses prod Agent Studio URL when env is prod', async () => {
    server.use(
      http.get('https://APP_ID.algolia.net/agent-studio/1/agents', () => {
        return HttpResponse.json({
          data: [{ id: 'id-prod', name: 'Prod Agent', status: 'published' }],
          pagination: { page: 1, limit: 100, totalCount: 1, totalPages: 1 },
        });
      })
    );

    const result = await fetchSuggestions(
      'agentStudioAgents',
      credentials,
      'prod'
    );

    expect(result).toEqual({
      values: ['id-prod'],
      description: 'Available Agent Studio agents',
      labels: { 'id-prod': 'Prod Agent' },
    });
  });
});
