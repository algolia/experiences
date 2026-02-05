import { getConfig } from './get-config';
import { resolve } from './resolve';

export async function load() {
  const config = getConfig();
  const { bundleUrl } = await resolve(config);

  const script = document.createElement('script');
  script.src = bundleUrl;
  script.async = true;
  script.onerror = () => {
    console.error(
      new Error(`[@algolia/experiences] Failed to load bundle: ${bundleUrl}`)
    );
  };

  document.head.appendChild(script);
}
