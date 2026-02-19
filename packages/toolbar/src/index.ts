import { render, h } from 'preact';
import toolbarCss from 'virtual:toolbar-css';
import { fetchExperience } from './api';
import { App } from './components/app';
import type { ToolbarConfig } from './types';

declare global {
  interface Window {
    __ALGOLIA_EXPERIENCES_TOOLBAR_CONFIG__?: ToolbarConfig;
    __OPENAI_API_KEY__?: string;
    AlgoliaExperiences?: {
      run: (config?: Record<string, unknown>) => void;
      dispose: () => void;
    };
  }
}

async function mount() {
  const config = window.__ALGOLIA_EXPERIENCES_TOOLBAR_CONFIG__;

  if (!config) {
    console.error(
      new Error(
        '[@algolia/experiences-toolbar] Missing window.__ALGOLIA_EXPERIENCES_TOOLBAR_CONFIG__'
      )
    );
    return;
  }

  const experience = await fetchExperience({
    appId: config.appId,
    apiKey: config.apiKey,
    env: config.env ?? 'prod',
    experienceId: config.experienceId,
  });

  // Create Shadow DOM host for CSS isolation
  const host = document.createElement('div');
  host.id = 'algolia-experiences-toolbar';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Inject compiled Tailwind CSS into the shadow root
  const style = document.createElement('style');
  style.textContent = toolbarCss;
  shadow.appendChild(style);

  const container = document.createElement('div');
  shadow.appendChild(container);

  render(h(App, { config, initialExperience: experience }), container);
}

mount().catch(console.error);
