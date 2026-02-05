import { RESOLVER_URL } from './constants';
import type { LoaderConfiguration } from './get-config';

export type ResolverResponse = {
  bundleUrl: string;
};

export async function resolve(
  config: LoaderConfiguration
): Promise<ResolverResponse> {
  const { appId, apiKey, experienceId } = config;

  let response: Response;
  try {
    response = await fetch(`${RESOLVER_URL}/${experienceId}`, {
      headers: {
        'X-Algolia-Application-Id': appId,
        'X-Algolia-API-Key': apiKey,
      },
    });
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
    throw new Error(
      '[@algolia/experiences] Resolver returned invalid JSON'
    );
  }

  if (!data.bundleUrl) {
    throw new Error(
      '[@algolia/experiences] Resolver response missing bundleUrl'
    );
  }

  return data;
}
