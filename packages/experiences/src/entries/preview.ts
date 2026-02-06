/**
 * Preview entry point.
 * Extends production config with optional runtime config override from URL.
 * Use this on staging environments or the Algolia Dashboard for live editing.
 *
 * The runtime config is passed via the `algolia_experiences_config` URL parameter
 * as a base64-encoded JSON string.
 */
import { getConfig, load } from '../core';
import type { LoaderConfiguration } from '../core';

function getPreviewConfig(): LoaderConfiguration {
  const config = getConfig();

  const params = new URLSearchParams(window.location.search);
  const runtimeConfigParam = params.get('algolia_experiences_config');

  if (!runtimeConfigParam) {
    return config;
  }

  let runtimeConfig: Record<string, unknown>;

  try {
    runtimeConfig = JSON.parse(atob(runtimeConfigParam));
  } catch {
    throw new Error(
      '[@algolia/experiences] Invalid algolia_experiences_config: must be base64-encoded JSON'
    );
  }

  return {
    ...config,
    runtimeConfig,
  };
}

export default (async () => {
  await load(getPreviewConfig());
})().catch(console.error);
