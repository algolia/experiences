import { resolve } from './resolve';
import type { LoaderConfiguration } from './types';

declare global {
  interface Window {
    AlgoliaExperiences?: {
      run: (config?: Record<string, unknown>) => void;
      dispose: () => void;
    };
  }
}

/**
 * Main loader function that orchestrates the loading process:
 *
 * 1. Calls the resolver to get the runtime bundle URL
 * 2. Injects the runtime script into the page
 * 3. Calls the runtime's run function with optional config
 */
export async function load(config: LoaderConfiguration) {
  const { bundleUrl } = await resolve(config);

  const runtimeUrl = new URL(bundleUrl);
  runtimeUrl.searchParams.set('appId', config.appId);
  runtimeUrl.searchParams.set('apiKey', config.apiKey);
  runtimeUrl.searchParams.set('experienceId', config.experienceId);
  if (config.env) {
    runtimeUrl.searchParams.set('env', config.env);
  }

  // TODO: Load CSS via <link> once served from a CDN with proper MIME type.
  // Currently, CSS is inlined in the runtime JS bundle (see injectCssPlugin in
  // packages/runtime/tsdown.config.ts).

  const script = document.createElement('script');
  script.src = runtimeUrl.toString();
  script.onload = () => {
    window.AlgoliaExperiences?.run(config.runtimeConfig);
  };
  script.onerror = () => {
    console.error(
      new Error(`[@algolia/experiences] Failed to load bundle: ${bundleUrl}`)
    );
  };

  document.head.appendChild(script);
}
