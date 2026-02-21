import type { LoaderConfiguration } from './core';

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
