import type { Environment } from './types';

export type RuntimeConfiguration = {
  appId: string;
  apiKey: string;
  experienceId: string;
  env?: Environment;
};

// Capture currentScript at load time (not available after script execution)
const script = document.currentScript as HTMLScriptElement | null;

/**
 * Extracts configuration from the current script's URL parameters.
 * Requires the script to be loaded synchronously (no async/defer).
 */
export function getConfig(): RuntimeConfiguration {
  if (!script) {
    throw new Error(
      '[@algolia/experiences-runtime] Could not find the current script element. ' +
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
      `[@algolia/experiences-runtime] Missing required parameter(s): ${missingParams.join(', ')}`
    );
  }

  const env = params.get('env') as RuntimeConfiguration['env'];

  return { ...config, env } as RuntimeConfiguration;
}
