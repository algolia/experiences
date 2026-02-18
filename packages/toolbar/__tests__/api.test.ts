import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { fetchExperience, saveExperience } from '../src/api';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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
      http.get('https://experiences.algolia.com/1/experiences/exp-123', () =>
        HttpResponse.json(mockResponse)
      )
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
      http.get(
        'https://experiences.algolia.com/1/experiences/exp-123',
        () => new HttpResponse(null, { status: 404, statusText: 'Not Found' })
      )
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
  it('sends a PUT request with the config as JSON body', async () => {
    let requestMethod = '';
    let requestBody: unknown;

    server.use(
      http.put(
        'https://experiences.algolia.com/1/experiences/exp-123',
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
      experienceId: 'exp-123',
      config: {
        blocks: [
          {
            type: 'ais.chat',
            parameters: { container: '#chat', cssVariables: {} },
          },
        ],
      },
    });

    expect(requestMethod).toBe('PUT');
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
      http.put(
        'https://experiences.algolia.com/1/experiences/exp-123',
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
      experienceId: 'exp-123',
      config: { blocks: [] },
    });

    expect(headers!.get('X-Algolia-Application-ID')).toBe('MY_APP_ID');
    expect(headers!.get('X-Algolia-API-Key')).toBe('MY_API_KEY');
    expect(headers!.get('Content-Type')).toBe('application/json');
  });

  it('uses beta API base when env is beta', async () => {
    let requestUrl = '';

    server.use(
      http.put(
        'https://experiences-beta.algolia.com/1/experiences/exp-123',
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
      experienceId: 'exp-123',
      config: { blocks: [] },
    });

    expect(requestUrl).toContain('experiences-beta.algolia.com');
  });

  it('throws when the API responds with an error', async () => {
    server.use(
      http.put(
        'https://experiences.algolia.com/1/experiences/exp-123',
        () => new HttpResponse(null, { status: 403, statusText: 'Forbidden' })
      )
    );

    await expect(
      saveExperience({
        appId: 'APP_ID',
        apiKey: 'API_KEY',
        env: 'prod',
        experienceId: 'exp-123',
        config: { blocks: [] },
      })
    ).rejects.toThrow('Failed to save experience: 403');
  });
});
