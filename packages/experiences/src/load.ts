import { getConfig } from './get-config';
import { resolve } from './resolve';

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
 * 1. Reads configuration from script URL parameters
 * 2. Calls the resolver to get the runtime bundle URL
 * 3. Injects the runtime script into the page
 * 4. Calls the runtime's run function
 */
export async function load() {
  const config = getConfig();
  const { bundleUrl } = await resolve(config);

  const script = document.createElement('script');
  script.src = bundleUrl;
  script.async = true;
  script.onload = () => {
    window.AlgoliaExperiences?.run();
  };
  script.onerror = () => {
    console.error(
      new Error(`[@algolia/experiences] Failed to load bundle: ${bundleUrl}`)
    );
  };

  document.head.appendChild(script);
}
