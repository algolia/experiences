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
    runtimeConfig = JSON.parse(decodeURIComponent(atob(runtimeConfigParam)));
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

export function loadToolbar(bundleUrl: string, config: LoaderConfiguration) {
  window.__ALGOLIA_EXPERIENCES_TOOLBAR_CONFIG__ = {
    appId: config.appId,
    apiKey: config.apiKey,
    experienceId: config.experienceId,
    env: config.env,
  };

  const script = document.createElement('script');
  script.src = bundleUrl.replace(/runtime\.js$/, 'toolbar.js');
  script.onerror = () => {
    console.error(
      '[@algolia/experiences] Failed to load toolbar script:',
      script.src
    );
  };
  document.head.appendChild(script);
}

export default (async () => {
  const config = getPreviewConfig();
  const bundleUrl = await load(config);
  loadToolbar(bundleUrl, config);
})().catch(console.error);
