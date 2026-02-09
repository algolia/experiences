import { resolve } from './resolve';
import type { LoaderConfiguration } from './types';

declare global {
  interface Window {
    AlgoliaExperiences?: {
      run: (config?: Record<string, unknown>) => void;
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

  const script = document.createElement('script');
  script.src = bundleUrl;
  script.async = true;
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
