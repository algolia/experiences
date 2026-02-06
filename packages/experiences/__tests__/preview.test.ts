import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { RESOLVER_URL } from '../src/core/constants';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.resetModules();
});
afterAll(() => server.close());

const BUNDLE_URL =
  'https://github.com/algolia/experiences/releases/download/canary/runtime.js';

describe('preview loader', () => {
  let script: HTMLScriptElement;
  const originalLocation = window.location;

  beforeEach(() => {
    script = document.createElement('script');
    document.body.appendChild(script);
    Object.defineProperty(document, 'currentScript', {
      value: script,
      configurable: true,
    });
  });

  afterEach(() => {
    script.remove();
    document.head
      .querySelectorAll('script')
      .forEach((script) => script.remove());
    delete window.AlgoliaExperiences;
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      configurable: true,
    });
  });

  it('passes runtime config from page URL to AlgoliaExperiences.run', async () => {
    const runtimeConfig = { foo: 'bar', baz: 123 };
    const encodedConfig = btoa(JSON.stringify(runtimeConfig));

    // Script URL has appId, apiKey, experienceId
    script.src =
      '../src/entries/preview.ts?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID';

    // Page URL has the config override
    Object.defineProperty(window, 'location', {
      value: { search: `?algolia_experiences_config=${encodedConfig}` },
      configurable: true,
    });

    server.use(
      http.get(`${RESOLVER_URL}/YOUR_EXPERIENCE_ID`, () =>
        HttpResponse.json({ bundleUrl: BUNDLE_URL })
      )
    );

    const runSpy = vi.fn();
    window.AlgoliaExperiences = { run: runSpy };

    await (
      await import('../src/entries/preview')
    ).default;

    const injectedScript = document.head.querySelector('script');
    injectedScript?.onload?.(new Event('load'));

    expect(runSpy).toHaveBeenCalledWith(runtimeConfig);
  });

  it('works without runtime config in page URL', async () => {
    script.src =
      '../src/entries/preview.ts?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID';

    Object.defineProperty(window, 'location', {
      value: { search: '' },
      configurable: true,
    });

    server.use(
      http.get(`${RESOLVER_URL}/YOUR_EXPERIENCE_ID`, () =>
        HttpResponse.json({ bundleUrl: BUNDLE_URL })
      )
    );

    const runSpy = vi.fn();
    window.AlgoliaExperiences = { run: runSpy };

    await (
      await import('../src/entries/preview')
    ).default;

    const injectedScript = document.head.querySelector('script');
    injectedScript?.onload?.(new Event('load'));

    expect(runSpy).toHaveBeenCalledWith(undefined);
  });

  it('logs error when algolia_experiences_config is invalid', async () => {
    script.src =
      '../src/entries/preview.ts?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID';

    Object.defineProperty(window, 'location', {
      value: { search: '?algolia_experiences_config=not-valid-base64' },
      configurable: true,
    });

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (
      await import('../src/entries/preview')
    ).default;

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(
          'Invalid algolia_experiences_config: must be base64-encoded JSON'
        ),
      })
    );
  });
});
