import type { LoaderConfiguration } from './types';

/**
 * Extracts configuration from the current script's URL parameters.
 * Requires the script to be loaded synchronously (no async/defer).
 */
export function getConfig(): LoaderConfiguration {
  const script = document.currentScript as HTMLScriptElement | null;

  if (!script) {
    throw new Error(
      '[@algolia/experiences] Could not find the current script element. ' +
        'Make sure the script is loaded synchronously.'
    );
  }

  const params = new URL(script.src).searchParams;

  const config = {
    appId: params.get('appId'),
    apiKey: params.get('apiKey'),
    experienceId: params.get('experienceId'),
  };

  const missingParams = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingParams.length > 0) {
    throw new Error(
      `[@algolia/experiences] Missing required parameter(s): ${missingParams.join(', ')}`
    );
  }

  return {
    appId: config.appId,
    apiKey: config.apiKey,
    experienceId: config.experienceId,
  } as LoaderConfiguration;
}
