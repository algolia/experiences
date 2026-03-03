import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  fetchExperience,
  fetchIndexRecords,
  fetchIndices,
  fetchIndexSettings,
  fetchQuerySuggestionConfigs,
  saveExperience,
} from '../src/api';

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

describe('fetchExperience', () => {
  it('fetches experience config from the API', async () => {
    const mockResponse = {
      blocks: [
        {
          type: 'ais.chat',
          parameters: { container: '#chat', cssVariables: {} },
        },
      ],
    };

    server.use(
      http.get('https://experiences.algolia.com/1/experiences/exp-123', () => {
        return HttpResponse.json(mockResponse);
      })
    );

    const result = await fetchExperience({
      appId: 'APP_ID',
      apiKey: 'API_KEY',
      env: 'prod',
      experienceId: 'exp-123',
    });

    expect(result).toEqual(mockResponse);
  });

  it('uses beta API base when env is beta', async () => {
    let requestUrl = '';

    server.use(
      http.get(
        'https://experiences-beta.algolia.com/1/experiences/exp-123',
        ({ request }) => {
          requestUrl = request.url;
          return HttpResponse.json({ blocks: [] });
        }
      )
    );

    await fetchExperience({
      appId: 'APP_ID',
      apiKey: 'API_KEY',
      env: 'beta',
      experienceId: 'exp-123',
    });

    expect(requestUrl).toContain('experiences-beta.algolia.com');
  });

  it('sends Algolia credentials as headers', async () => {
    let headers: Headers;

    server.use(
      http.get(
        'https://experiences.algolia.com/1/experiences/exp-123',
        ({ request }) => {
          headers = request.headers;
          return HttpResponse.json({ blocks: [] });
        }
      )
    );

    await fetchExperience({
      appId: 'MY_APP_ID',
      apiKey: 'MY_API_KEY',
      env: 'prod',
      experienceId: 'exp-123',
    });

    expect(headers!.get('X-Algolia-Application-ID')).toBe('MY_APP_ID');
    expect(headers!.get('X-Algolia-API-Key')).toBe('MY_API_KEY');
  });

  it('throws when the API responds with an error', async () => {
    server.use(
      http.get('https://experiences.algolia.com/1/experiences/exp-123', () => {
        return new HttpResponse(null, { status: 404, statusText: 'Not Found' });
      })
    );

    await expect(
      fetchExperience({
        appId: 'APP_ID',
        apiKey: 'API_KEY',
        env: 'prod',
        experienceId: 'exp-123',
      })
    ).rejects.toThrow('Failed to fetch experience: 404');
  });
});

describe('saveExperience', () => {
  it('sends a POST request with the config as JSON body', async () => {
    let requestMethod = '';
    let requestBody: unknown;

    server.use(
      http.post(
        'https://experiences.algolia.com/1/experiences',
        async ({ request }) => {
          requestMethod = request.method;
          requestBody = await request.json();
          return new HttpResponse(null, { status: 200 });
        }
      )
    );

    await saveExperience({
      appId: 'APP_ID',
      apiKey: 'API_KEY',
      env: 'prod',
      config: {
        blocks: [
          {
            type: 'ais.chat',
            parameters: { container: '#chat', cssVariables: {} },
          },
        ],
      },
    });

    expect(requestMethod).toBe('POST');
    expect(requestBody).toEqual({
      blocks: [
        {
          type: 'ais.chat',
          parameters: { container: '#chat', cssVariables: {} },
        },
      ],
    });
  });

  it('sends Algolia credentials as headers', async () => {
    let headers: Headers;

    server.use(
      http.post(
        'https://experiences.algolia.com/1/experiences',
        ({ request }) => {
          headers = request.headers;
          return new HttpResponse(null, { status: 200 });
        }
      )
    );

    await saveExperience({
      appId: 'MY_APP_ID',
      apiKey: 'MY_API_KEY',
      env: 'prod',
      config: { blocks: [] },
    });

    expect(headers!.get('X-Algolia-Application-ID')).toBe('MY_APP_ID');
    expect(headers!.get('X-Algolia-API-Key')).toBe('MY_API_KEY');
    expect(headers!.get('Content-Type')).toBe('application/json');
  });

  it('uses beta API base when env is beta', async () => {
    let requestUrl = '';

    server.use(
      http.post(
        'https://experiences-beta.algolia.com/1/experiences',
        ({ request }) => {
          requestUrl = request.url;
          return new HttpResponse(null, { status: 200 });
        }
      )
    );

    await saveExperience({
      appId: 'APP_ID',
      apiKey: 'API_KEY',
      env: 'beta',
      config: { blocks: [] },
    });

    expect(requestUrl).toContain('experiences-beta.algolia.com');
  });

  it('throws when the API responds with an error', async () => {
    server.use(
      http.post('https://experiences.algolia.com/1/experiences', () => {
        return new HttpResponse(null, { status: 403, statusText: 'Forbidden' });
      })
    );

    await expect(
      saveExperience({
        appId: 'APP_ID',
        apiKey: 'API_KEY',
        env: 'prod',
        config: { blocks: [] },
      })
    ).rejects.toThrow('Failed to save experience: 403');
  });
});

describe('fetchIndexRecords', () => {
  it('fetches records from the Algolia search API', async () => {
    server.use(
      http.post(
        'https://APP_ID-dsn.algolia.net/1/indexes/my_index/query',
        () => {
          return HttpResponse.json({
            hits: [{ name: 'Widget', objectID: '1' }],
          });
        }
      )
    );

    const result = await fetchIndexRecords({
      appId: 'APP_ID',
      apiKey: 'API_KEY',
      indexName: 'my_index',
    });

    expect(result).toEqual([{ name: 'Widget', objectID: '1' }]);
  });

  it('sends correct headers and body', async () => {
    let headers: Headers;
    let body: unknown;

    server.use(
      http.post(
        'https://APP_ID-dsn.algolia.net/1/indexes/my_index/query',
        async ({ request }) => {
          headers = request.headers;
          body = await request.json();

          return HttpResponse.json({ hits: [] });
        }
      )
    );

    await fetchIndexRecords({
      appId: 'APP_ID',
      apiKey: 'API_KEY',
      indexName: 'my_index',
    });

    expect(headers!.get('X-Algolia-Application-ID')).toBe('APP_ID');
    expect(headers!.get('X-Algolia-API-Key')).toBe('API_KEY');
    expect(body).toEqual({
      hitsPerPage: 10,
      attributesToHighlight: [],
      attributesToSnippet: [],
    });
  });

  it('returns empty array on error', async () => {
    server.use(
      http.post(
        'https://APP_ID-dsn.algolia.net/1/indexes/my_index/query',
        () => {
          return new HttpResponse(null, { status: 403 });
        }
      )
    );

    const result = await fetchIndexRecords({
      appId: 'APP_ID',
      apiKey: 'API_KEY',
      indexName: 'my_index',
    });

    expect(result).toEqual([]);
  });
});

describe('fetchIndices', () => {
  it('fetches all indices with pagination', async () => {
    server.use(
      http.get('https://APP_ID-dsn.algolia.net/1/indexes', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');

        if (page === '0') {
          return HttpResponse.json({
            items: [{ name: 'products', replicas: ['products_price_asc'] }],
            nbPages: 2,
          });
        }

        return HttpResponse.json({
          items: [{ name: 'articles' }],
          nbPages: 2,
        });
      })
    );

    const result = await fetchIndices({ appId: 'APP_ID', apiKey: 'API_KEY' });

    expect(result).toEqual([
      { name: 'products', replicas: ['products_price_asc'] },
      { name: 'articles' },
    ]);
  });

  it('sends Algolia credentials as headers', async () => {
    let headers: Headers;

    server.use(
      http.get('https://APP_ID-dsn.algolia.net/1/indexes', ({ request }) => {
        headers = request.headers;

        return HttpResponse.json({ items: [], nbPages: 1 });
      })
    );

    await fetchIndices({ appId: 'APP_ID', apiKey: 'API_KEY' });

    expect(headers!.get('X-Algolia-Application-ID')).toBe('APP_ID');
    expect(headers!.get('X-Algolia-API-Key')).toBe('API_KEY');
  });

  it('returns empty array on HTTP error', async () => {
    server.use(
      http.get('https://APP_ID-dsn.algolia.net/1/indexes', () => {
        return new HttpResponse(null, { status: 403 });
      })
    );

    const result = await fetchIndices({ appId: 'APP_ID', apiKey: 'API_KEY' });

    expect(result).toEqual([]);
  });

  it('returns empty array on network error', async () => {
    server.use(
      http.get('https://APP_ID-dsn.algolia.net/1/indexes', () => {
        return HttpResponse.error();
      })
    );

    const result = await fetchIndices({ appId: 'APP_ID', apiKey: 'API_KEY' });

    expect(result).toEqual([]);
  });
});

describe('fetchQuerySuggestionConfigs', () => {
  it('returns configs from the US region', async () => {
    const mockConfigs = [
      {
        indexName: 'products_suggestions',
        sourceIndices: [{ indexName: 'products' }],
      },
    ];

    server.use(
      http.get('https://query-suggestions.us.algolia.com/1/configs', () => {
        return HttpResponse.json(mockConfigs);
      })
    );

    const result = await fetchQuerySuggestionConfigs({
      appId: 'APP_ID',
      apiKey: 'API_KEY',
    });

    expect(result).toEqual(mockConfigs);
  });

  it('falls back to EU when US fails', async () => {
    const mockConfigs = [
      {
        indexName: 'products_suggestions',
        sourceIndices: [{ indexName: 'products' }],
      },
    ];

    server.use(
      http.get('https://query-suggestions.us.algolia.com/1/configs', () => {
        return new HttpResponse(null, { status: 403 });
      }),
      http.get('https://query-suggestions.eu.algolia.com/1/configs', () => {
        return HttpResponse.json(mockConfigs);
      })
    );

    const result = await fetchQuerySuggestionConfigs({
      appId: 'APP_ID',
      apiKey: 'API_KEY',
    });

    expect(result).toEqual(mockConfigs);
  });

  it('returns empty array when both regions fail', async () => {
    server.use(
      http.get('https://query-suggestions.us.algolia.com/1/configs', () => {
        return new HttpResponse(null, { status: 403 });
      }),
      http.get('https://query-suggestions.eu.algolia.com/1/configs', () => {
        return new HttpResponse(null, { status: 403 });
      })
    );

    const result = await fetchQuerySuggestionConfigs({
      appId: 'APP_ID',
      apiKey: 'API_KEY',
    });

    expect(result).toEqual([]);
  });

  it('sends Algolia credentials as headers', async () => {
    let headers: Headers;

    server.use(
      http.get(
        'https://query-suggestions.us.algolia.com/1/configs',
        ({ request }) => {
          headers = request.headers;

          return HttpResponse.json([]);
        }
      )
    );

    await fetchQuerySuggestionConfigs({
      appId: 'APP_ID',
      apiKey: 'API_KEY',
    });

    expect(headers!.get('X-Algolia-Application-ID')).toBe('APP_ID');
    expect(headers!.get('X-Algolia-API-Key')).toBe('API_KEY');
  });
});

describe('fetchIndexSettings', () => {
  it('fetches settings from the Algolia API', async () => {
    server.use(
      http.get(
        'https://APP_ID-dsn.algolia.net/1/indexes/my_index/settings',
        () => {
          return HttpResponse.json({
            attributesForFaceting: ['brand', 'searchable(color)'],
          });
        }
      )
    );

    const result = await fetchIndexSettings({
      appId: 'APP_ID',
      apiKey: 'API_KEY',
      indexName: 'my_index',
    });

    expect(result).toEqual({
      attributesForFaceting: ['brand', 'searchable(color)'],
    });
  });

  it('sends correct headers', async () => {
    let headers: Headers;

    server.use(
      http.get(
        'https://APP_ID-dsn.algolia.net/1/indexes/my_index/settings',
        ({ request }) => {
          headers = request.headers;

          return HttpResponse.json({});
        }
      )
    );

    await fetchIndexSettings({
      appId: 'APP_ID',
      apiKey: 'API_KEY',
      indexName: 'my_index',
    });

    expect(headers!.get('X-Algolia-Application-ID')).toBe('APP_ID');
    expect(headers!.get('X-Algolia-API-Key')).toBe('API_KEY');
  });

  it('returns empty object on error', async () => {
    server.use(
      http.get(
        'https://APP_ID-dsn.algolia.net/1/indexes/my_index/settings',
        () => {
          return new HttpResponse(null, { status: 403 });
        }
      )
    );

    const result = await fetchIndexSettings({
      appId: 'APP_ID',
      apiKey: 'API_KEY',
      indexName: 'my_index',
    });

    expect(result).toEqual({});
  });
});
