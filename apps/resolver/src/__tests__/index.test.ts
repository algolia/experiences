import { describe, it, expect, vi, beforeEach } from 'vitest';
import { env, SELF } from 'cloudflare:test';

type ResponseBody = {
  message?: string;
  experienceId?: string;
  bundleUrl?: string;
};

const mockGetApiKey = vi.fn();
vi.mock('algoliasearch', () => ({
  algoliasearch: vi.fn(() => ({
    getApiKey: mockGetApiKey,
  })),
}));

describe('/{experienceId}', () => {
  const CREDENTIALS_HEADERS = {
    'X-Algolia-Application-Id': 'TEST_APP_ID',
    'X-Algolia-API-Key': 'test-api-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Common tests
  it('returns 204 with CORS headers for OPTIONS preflight', async () => {
    const response = await createTestRequest('/exp123', {
      method: 'OPTIONS',
    });

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain(
      'GET'
    );
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain(
      'POST'
    );
  });

  it('returns 404 for invalid path', async () => {
    const response = await createTestRequest('/foo/bar', {
      method: 'GET',
      headers: CREDENTIALS_HEADERS,
    });

    expect(response.status).toBe(404);
    const body = await response.json<ResponseBody>();
    expect(body.message).toBe('Not found.');
  });

  it('returns 405 for unsupported method', async () => {
    mockGetApiKey.mockResolvedValue({ acl: ['search', 'editSettings'] });

    const response = await createTestRequest('/exp123', {
      method: 'PUT',
      headers: CREDENTIALS_HEADERS,
    });

    expect(response.status).toBe(405);
    const body = await response.json<ResponseBody>();
    expect(body.message).toBe('Method not allowed.');
  });

  it('returns 400 when credentials are missing', async () => {
    const response = await createTestRequest('/exp123', {
      method: 'GET',
    });

    expect(response.status).toBe(400);
    const body = await response.json<ResponseBody>();
    expect(body.message).toBe('Missing credentials.');
  });

  describe('GET', () => {
    it('returns 403 when getApiKey throws (invalid credentials)', async () => {
      mockGetApiKey.mockRejectedValue(new Error('Invalid API key'));

      const response = await createTestRequest('/exp123', {
        method: 'GET',
        headers: CREDENTIALS_HEADERS,
      });

      expect(response.status).toBe(403);
      const body = await response.json<ResponseBody>();
      expect(body.message).toBe('Forbidden');
    });

    it('returns 403 when API key lacks search ACL', async () => {
      mockGetApiKey.mockResolvedValue({ acl: ['browse'] });

      const response = await createTestRequest('/exp123', {
        method: 'GET',
        headers: CREDENTIALS_HEADERS,
      });

      expect(response.status).toBe(403);
      const body = await response.json<ResponseBody>();
      expect(body.message).toBe('Forbidden');
    });

    it('returns 404 when experience is not found in KV', async () => {
      mockGetApiKey.mockResolvedValue({ acl: ['search'] });

      const response = await createTestRequest('/nonexistent', {
        method: 'GET',
        headers: CREDENTIALS_HEADERS,
      });

      expect(response.status).toBe(404);
      const body = await response.json<ResponseBody>();
      expect(body.message).toContain('Experience not found');
    });

    it('returns 200 with bundle URL when experience exists', async () => {
      mockGetApiKey.mockResolvedValue({ acl: ['search'] });
      await env.EXPERIENCES_BUNDLE_VERSIONS.put('TEST_APP_ID:exp123', '2.0.0');

      const response = await createTestRequest('/exp123', {
        method: 'GET',
        headers: CREDENTIALS_HEADERS,
      });

      expect(response.status).toBe(200);
      const body = await response.json<ResponseBody>();
      expect(body.experienceId).toBe('exp123');
      expect(body.bundleUrl).toBe(
        'https://cdn.jsdelivr.net/npm/@algolia/runtime@2.0.0/dist/experiences.umd.js'
      );
    });

    it('includes CORS headers in response', async () => {
      mockGetApiKey.mockResolvedValue({ acl: ['search'] });
      await env.EXPERIENCES_BUNDLE_VERSIONS.put('TEST_APP_ID:exp123', '1.0.0');

      const response = await createTestRequest('/exp123', {
        method: 'GET',
        headers: CREDENTIALS_HEADERS,
      });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain(
        'GET'
      );
    });
  });

  describe('POST', () => {
    it('returns 403 when getApiKey throws (invalid credentials)', async () => {
      mockGetApiKey.mockRejectedValue(new Error('Invalid API key'));

      const response = await createTestRequest('/exp123', {
        method: 'POST',
        headers: {
          ...CREDENTIALS_HEADERS,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bundleVersion: '1.0.0' }),
      });

      expect(response.status).toBe(403);
      const body = await response.json<ResponseBody>();
      expect(body.message).toBe('Forbidden');
    });

    it('returns 403 when API key lacks editSettings ACL', async () => {
      mockGetApiKey.mockResolvedValue({ acl: ['search'] });

      const response = await createTestRequest('/exp123', {
        method: 'POST',
        headers: {
          ...CREDENTIALS_HEADERS,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bundleVersion: '1.0.0' }),
      });

      expect(response.status).toBe(403);
      const body = await response.json<ResponseBody>();
      expect(body.message).toBe('Forbidden');
    });

    it('returns 400 when bundleVersion is missing', async () => {
      mockGetApiKey.mockResolvedValue({ acl: ['editSettings'] });

      const response = await createTestRequest('/exp123', {
        method: 'POST',
        headers: {
          ...CREDENTIALS_HEADERS,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const body = await response.json<ResponseBody>();
      expect(body.message).toBe('Missing bundleVersion.');
    });

    it('returns 400 when body is invalid JSON', async () => {
      mockGetApiKey.mockResolvedValue({ acl: ['editSettings'] });

      const response = await createTestRequest('/exp123', {
        method: 'POST',
        headers: {
          ...CREDENTIALS_HEADERS,
          'Content-Type': 'application/json',
        },
        body: 'not valid json',
      });

      expect(response.status).toBe(400);
      const body = await response.json<ResponseBody>();
      expect(body.message).toBe('Missing bundleVersion.');
    });

    it('returns 200 and updates KV on valid request', async () => {
      mockGetApiKey.mockResolvedValue({ acl: ['editSettings'] });

      const response = await createTestRequest('/exp123', {
        method: 'POST',
        headers: {
          ...CREDENTIALS_HEADERS,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bundleVersion: '3.0.0' }),
      });

      expect(response.status).toBe(200);
      const body = await response.json<ResponseBody>();
      expect(body.experienceId).toBe('exp123');

      // Verify KV was updated
      const storedVersion =
        await env.EXPERIENCES_BUNDLE_VERSIONS.get('TEST_APP_ID:exp123');
      expect(storedVersion).toBe('3.0.0');
    });
  });
});

function createTestRequest(
  path: string,
  init?: RequestInit
): Promise<Response> {
  return SELF.fetch(`http://localhost${path}`, init);
}
