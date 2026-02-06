import { RESOLVER_URL } from './constants';
import type { LoaderConfiguration } from './get-config';

export type ResolverResponse = {
  bundleUrl: string;
};

/**
 * Calls the Algolia Experiences resolver to get the runtime bundle URL.
 * Authenticates using Algolia headers (X-Algolia-Application-Id, X-Algolia-API-Key).
 */
export async function resolve(
  config: LoaderConfiguration
): Promise<ResolverResponse> {
  const { appId, apiKey, experienceId } = config;

  let response: Response;

  try {
    response = await fetch(
      `${RESOLVER_URL}/${encodeURIComponent(experienceId)}`,
      {
        headers: {
          'X-Algolia-Application-Id': appId,
          'X-Algolia-API-Key': apiKey,
        },
      }
    );
  } catch {
    throw new Error(
      '[@algolia/experiences] Network error: failed to reach resolver'
    );
  }

  if (!response.ok) {
    throw new Error(
      `[@algolia/experiences] Resolver request failed: ${response.status} ${response.statusText}`
    );
  }

  let data: ResolverResponse;

  try {
    data = (await response.json()) as ResolverResponse;
  } catch {
    throw new Error('[@algolia/experiences] Resolver returned invalid JSON');
  }

  return data;
}
