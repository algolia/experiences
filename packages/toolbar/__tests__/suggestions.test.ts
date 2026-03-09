import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  fetchSuggestions,
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

describe('suggestionSourceRequiresIndexName', () => {
  it('returns true for facetAttributes', () => {
    expect(suggestionSourceRequiresIndexName('facetAttributes')).toBe(true);
  });

  it('returns true for indices:replicas', () => {
    expect(suggestionSourceRequiresIndexName('indices:replicas')).toBe(true);
  });

  it('returns true for indexAttributes', () => {
    expect(suggestionSourceRequiresIndexName('indexAttributes')).toBe(true);
  });

  it('returns false for agentStudioAgents', () => {
    expect(suggestionSourceRequiresIndexName('agentStudioAgents')).toBe(false);
  });

  it('returns false for indices', () => {
    expect(suggestionSourceRequiresIndexName('indices')).toBe(false);
  });

  it('returns false for indices:qs', () => {
    expect(suggestionSourceRequiresIndexName('indices:qs')).toBe(false);
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

  it('returns sorted index names', async () => {
    server.use(
      http.get('https://APP_ID-dsn.algolia.net/1/indexes', () => {
        return HttpResponse.json({
          items: [
            { name: 'products' },
            { name: 'articles' },
            { name: 'categories' },
          ],
          nbPages: 1,
        });
      })
    );

    const result = await fetchSuggestions('indices', credentials, 'beta');

    expect(result).toEqual({
      values: ['articles', 'categories', 'products'],
      description: 'Available Algolia indices',
    });
  });

  it('returns empty values when indices fetch fails', async () => {
    server.use(
      http.get('https://APP_ID-dsn.algolia.net/1/indexes', () => {
        return HttpResponse.error();
      })
    );

    const result = await fetchSuggestions('indices', credentials, 'beta');

    expect(result).toEqual({
      values: [],
      description: 'Available Algolia indices',
    });
  });

  it('returns sorted replica names for a given index', async () => {
    server.use(
      http.get('https://APP_ID-dsn.algolia.net/1/indexes', () => {
        return HttpResponse.json({
          items: [
            {
              name: 'products',
              replicas: ['products_price_asc', 'products_name_desc'],
            },
            { name: 'articles' },
          ],
          nbPages: 1,
        });
      })
    );

    const result = await fetchSuggestions(
      'indices:replicas',
      credentials,
      'beta',
      'products'
    );

    expect(result).toEqual({
      values: ['products_name_desc', 'products_price_asc'],
      description: 'Replica indices for the given index',
    });
  });

  it('returns empty values when index has no replicas', async () => {
    server.use(
      http.get('https://APP_ID-dsn.algolia.net/1/indexes', () => {
        return HttpResponse.json({
          items: [{ name: 'products' }],
          nbPages: 1,
        });
      })
    );

    const result = await fetchSuggestions(
      'indices:replicas',
      credentials,
      'beta',
      'products'
    );

    expect(result).toEqual({
      values: [],
      description: 'Replica indices for the given index',
    });
  });

  it('returns sorted query suggestion index names', async () => {
    server.use(
      http.get('https://query-suggestions.us.algolia.com/1/configs', () => {
        return HttpResponse.json([
          {
            indexName: 'products_query_suggestions',
            sourceIndices: [{ indexName: 'products' }],
          },
          {
            indexName: 'articles_query_suggestions',
            sourceIndices: [{ indexName: 'articles' }],
          },
        ]);
      })
    );

    const result = await fetchSuggestions('indices:qs', credentials, 'beta');

    expect(result).toEqual({
      values: ['articles_query_suggestions', 'products_query_suggestions'],
      description: 'Query Suggestion indices',
    });
  });

  it('returns error when QS config fetch fails', async () => {
    server.use(
      http.get('https://query-suggestions.us.algolia.com/1/configs', () => {
        return HttpResponse.error();
      }),
      http.get('https://query-suggestions.eu.algolia.com/1/configs', () => {
        return HttpResponse.error();
      })
    );

    const result = await fetchSuggestions('indices:qs', credentials, 'beta');

    expect(result).toEqual({
      values: [],
      description: 'Query Suggestion indices',
    });
  });

  it('returns sorted attribute names from index records', async () => {
    server.use(
      http.post(
        'https://APP_ID-dsn.algolia.net/1/indexes/products/query',
        () => {
          return HttpResponse.json({
            hits: [
              { objectID: '1', name: 'Widget', price: 9.99, brand: 'Acme' },
              { objectID: '2', name: 'Gadget', color: 'red', brand: 'Beta' },
            ],
          });
        }
      )
    );

    const result = await fetchSuggestions(
      'indexAttributes',
      credentials,
      'beta',
      'products'
    );

    expect(result).toEqual({
      values: ['brand', 'color', 'name', 'price'],
      description: 'Attributes found in index records',
    });
  });

  it('returns error when index records fetch fails', async () => {
    server.use(
      http.post(
        'https://APP_ID-dsn.algolia.net/1/indexes/products/query',
        () => {
          return HttpResponse.error();
        }
      )
    );

    const result = await fetchSuggestions(
      'indexAttributes',
      credentials,
      'beta',
      'products'
    );

    expect(result).toEqual({
      error:
        'Failed to fetch suggestions from indexAttributes for index "products"',
    });
  });
});
