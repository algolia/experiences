export type LoaderConfiguration = {
  appId: string;
  apiKey: string;
  experienceId: string;
};

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

  const appId = params.get('appId');
  const apiKey = params.get('apiKey');
  const experienceId = params.get('experienceId');

  if (!appId) {
    throw new Error('[@algolia/experiences] Missing required parameter: appId');
  }

  if (!apiKey) {
    throw new Error(
      '[@algolia/experiences] Missing required parameter: apiKey'
    );
  }

  if (!experienceId) {
    throw new Error(
      '[@algolia/experiences] Missing required parameter: experienceId'
    );
  }

  return {
    appId,
    apiKey,
    experienceId,
  };
}
