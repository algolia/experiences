import { RESOLVER_URL } from './constants';
import type { LoaderConfiguration } from './get-config';

export type ResolverResponse = {
  bundleUrl: string;
};

export async function resolve(
  config: LoaderConfiguration
): Promise<ResolverResponse> {
  const { appId, apiKey, experienceId } = config;

  const response = await fetch(`${RESOLVER_URL}/${experienceId}`, {
    headers: {
      'X-Algolia-Application-Id': appId,
      'X-Algolia-API-Key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(
      `[@algolia/experiences] Resolver request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as ResolverResponse;

  if (!data.bundleUrl) {
    throw new Error(
      '[@algolia/experiences] Resolver response missing bundleUrl'
    );
  }

  return data;
}
