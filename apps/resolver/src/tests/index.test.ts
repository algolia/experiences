import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
} from 'cloudflare:test';
import worker from '../index';

// Mock algoliasearch module
const mockGetApiKey = vi.fn();
vi.mock('algoliasearch', () => ({
  algoliasearch: vi.fn(() => ({
    getApiKey: mockGetApiKey,
  })),
}));

describe('experienceId', () => {
  const baseHeaders = {
    'X-Algolia-Application-Id': 'TEST_APP_ID',
    'X-Algolia-API-Key': 'test-api-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Common tests
  it('returns 204 with CORS headers for OPTIONS preflight', async () => {
    const request = new Request('http://localhost/exp123', {
      method: 'OPTIONS',
    });
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

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
    const request = new Request('http://localhost/foo/bar', {
      method: 'GET',
      headers: baseHeaders,
    });
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.message).toBe('Not found.');
  });

  it('returns 405 for unsupported method', async () => {
    mockGetApiKey.mockResolvedValue({ acl: ['search', 'editSettings'] });

    const request = new Request('http://localhost/exp123', {
      method: 'PUT',
      headers: baseHeaders,
    });
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(405);
    const body = await response.json();
    expect(body.message).toBe('Method not allowed.');
  });

  it('returns 400 when credentials are missing', async () => {
    const request = new Request('http://localhost/exp123', {
      method: 'GET',
    });
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toBe('Missing credentials.');
  });

  describe('GET', () => {
    it('returns 403 when getApiKey throws (invalid credentials)', async () => {
      mockGetApiKey.mockRejectedValue(new Error('Invalid API key'));

      const request = new Request('http://localhost/exp123', {
        method: 'GET',
        headers: baseHeaders,
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.message).toBe('Forbidden');
    });

    it('returns 403 when API key lacks search ACL', async () => {
      mockGetApiKey.mockResolvedValue({ acl: ['browse'] });

      const request = new Request('http://localhost/exp123', {
        method: 'GET',
        headers: baseHeaders,
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.message).toBe('Forbidden');
    });

    it('returns 404 when experience is not found in KV', async () => {
      mockGetApiKey.mockResolvedValue({ acl: ['search'] });

      const request = new Request('http://localhost/nonexistent', {
        method: 'GET',
        headers: baseHeaders,
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.message).toContain('Experience not found');
    });

    it('returns 200 with bundle URL when experience exists', async () => {
      mockGetApiKey.mockResolvedValue({ acl: ['search'] });
      await env.EXPERIENCES_BUNDLE_VERSIONS.put('TEST_APP_ID:exp123', '2.0.0');

      const request = new Request('http://localhost/exp123', {
        method: 'GET',
        headers: baseHeaders,
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.experienceId).toBe('exp123');
      expect(body.bundleUrl).toBe(
        'https://cdn.jsdelivr.net/npm/@algolia/runtime@2.0.0/dist/experiences.umd.js'
      );
    });

    it('includes CORS headers in response', async () => {
      mockGetApiKey.mockResolvedValue({ acl: ['search'] });
      await env.EXPERIENCES_BUNDLE_VERSIONS.put('TEST_APP_ID:exp123', '1.0.0');

      const request = new Request('http://localhost/exp123', {
        method: 'GET',
        headers: baseHeaders,
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain(
        'GET'
      );
    });
  });

  describe('POST', () => {
    it('returns 403 when getApiKey throws (invalid credentials)', async () => {
      mockGetApiKey.mockRejectedValue(new Error('Invalid API key'));

      const request = new Request('http://localhost/exp123', {
        method: 'POST',
        headers: {
          ...baseHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bundleVersion: '1.0.0' }),
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.message).toBe('Forbidden');
    });

    it('returns 403 when API key lacks editSettings ACL', async () => {
      mockGetApiKey.mockResolvedValue({ acl: ['search'] });

      const request = new Request('http://localhost/exp123', {
        method: 'POST',
        headers: {
          ...baseHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bundleVersion: '1.0.0' }),
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.message).toBe('Forbidden');
    });

    it('returns 400 when bundleVersion is missing', async () => {
      mockGetApiKey.mockResolvedValue({ acl: ['editSettings'] });

      const request = new Request('http://localhost/exp123', {
        method: 'POST',
        headers: {
          ...baseHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.message).toBe('Missing bundleVersion.');
    });

    it('returns 200 and updates KV on valid request', async () => {
      mockGetApiKey.mockResolvedValue({ acl: ['editSettings'] });

      const request = new Request('http://localhost/exp123', {
        method: 'POST',
        headers: {
          ...baseHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bundleVersion: '3.0.0' }),
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.experienceId).toBe('exp123');

      // Verify KV was updated
      const storedVersion =
        await env.EXPERIENCES_BUNDLE_VERSIONS.get('TEST_APP_ID:exp123');
      expect(storedVersion).toBe('3.0.0');
    });
  });
});
