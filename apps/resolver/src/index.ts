import { algoliasearch } from 'algoliasearch';

import type { Acl, Algoliasearch } from 'algoliasearch';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'X-Algolia-Application-Id, X-Algolia-API-Key, Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Extract experienceId from path (/{experienceId})
    const match = path.match(/^\/([^/]+)$/);
    if (!match) {
      return response({ message: 'Not found.' }, 404);
    }

    const experienceId = match[1];

    // Check required headers
    const appId = request.headers.get('X-Algolia-Application-Id');
    const apiKey = request.headers.get('X-Algolia-API-Key');

    if (!appId || !apiKey) {
      return response({ message: 'Missing credentials.' }, 400);
    }

    const client = algoliasearch(appId, apiKey);
    const kvKey = `${appId}:${experienceId}`;

    if (request.method === 'GET') {
      const hasAccess = await validateAcl(client, apiKey, 'search');
      if (!hasAccess) {
        return response({ message: 'Forbidden' }, 403);
      }

      const bundleVersion = await env.EXPERIENCES_BUNDLE_VERSIONS.get(kvKey);
      if (!bundleVersion) {
        return response(
          { message: `Experience not found with id ${experienceId}` },
          404
        );
      }

      return response({
        experienceId,
        bundleUrl: getBundleURL(bundleVersion),
      });
    }

    if (request.method === 'POST') {
      const hasAccess = await validateAcl(client, apiKey, 'editSettings');
      if (!hasAccess) {
        return response({ message: 'Forbidden' }, 403);
      }

      let bundleVersion: string;
      try {
        const body = (await request.json()) as { bundleVersion?: string };
        if (!body.bundleVersion) {
          throw new Error();
        }
        bundleVersion = body.bundleVersion;
      } catch {
        return response({ message: 'Missing bundleVersion.' }, 400);
      }

      await env.EXPERIENCES_BUNDLE_VERSIONS.put(kvKey, bundleVersion);

      return response({ experienceId });
    }

    return response({ message: 'Method not allowed.' }, 405);
  },
};

function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

async function validateAcl(
  client: Algoliasearch,
  apiKey: string,
  requiredAcl: Acl
): Promise<boolean> {
  try {
    // TODO: Cache API key ACLs to reduce requests to Algolia
    const { acl } = await client.getApiKey({ key: apiKey });
    return acl.includes(requiredAcl);
  } catch {
    return false;
  }
}

function getBundleURL(bundleVersion: string) {
  return `https://cdn.jsdelivr.net/npm/@algolia/runtime@${bundleVersion}/dist/experiences.umd.js`;
}
