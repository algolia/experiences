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

import { RESOLVER_URL } from '../src/constants';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.resetModules();
});
afterAll(() => server.close());

const BUNDLE_URL =
  'https://cdn.jsdelivr.net/npm/@algolia/runtime@x.y.z/dist/experiences.umd.js';

describe('loader', () => {
  let script: HTMLScriptElement;

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
  });

  it('injects the runtime script returned by the resolver', async () => {
    script.src =
      '../src/index.ts?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID';

    server.use(
      http.get(`${RESOLVER_URL}/YOUR_EXPERIENCE_ID`, () =>
        HttpResponse.json({ bundleUrl: BUNDLE_URL })
      )
    );

    await (
      await import('../src/index')
    ).default;

    expect(document.head.querySelector('script')?.src).toBe(BUNDLE_URL);
  });

  it('sends Algolia credentials as headers', async () => {
    script.src =
      '../src/index.ts?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID';

    let headers: Headers;

    server.use(
      http.get(`${RESOLVER_URL}/YOUR_EXPERIENCE_ID`, ({ request }) => {
        headers = request.headers;
        return HttpResponse.json({ bundleUrl: BUNDLE_URL });
      })
    );

    await (
      await import('../src/index')
    ).default;

    expect(headers!.get('X-Algolia-Application-Id')).toBe('YOUR_APP_ID');
    expect(headers!.get('X-Algolia-API-Key')).toBe('YOUR_API_KEY');
  });

  it('logs error when appId is missing', async () => {
    script.src =
      '../src/index.ts?apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID';

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (
      await import('../src/index')
    ).default;

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(
          'Missing required parameter(s): appId'
        ),
      })
    );
  });

  it('logs error when apiKey is missing', async () => {
    script.src =
      '../src/index.ts?appId=YOUR_APP_ID&experienceId=YOUR_EXPERIENCE_ID';

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (
      await import('../src/index')
    ).default;

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(
          'Missing required parameter(s): apiKey'
        ),
      })
    );
  });

  it('logs error when experienceId is missing', async () => {
    script.src = '../src/index.ts?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY';

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (
      await import('../src/index')
    ).default;

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(
          'Missing required parameter(s): experienceId'
        ),
      })
    );
  });

  it('logs error when resolver fails', async () => {
    script.src =
      '../src/index.ts?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID';

    server.use(
      http.get(
        `${RESOLVER_URL}/YOUR_EXPERIENCE_ID`,
        () =>
          new HttpResponse(null, { status: 500, statusText: 'Server Error' })
      )
    );

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (
      await import('../src/index')
    ).default;

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Resolver request failed: 500'),
      })
    );
  });

  it('logs error when bundle fails to load', async () => {
    script.src =
      '../src/index.ts?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID';

    server.use(
      http.get(`${RESOLVER_URL}/YOUR_EXPERIENCE_ID`, () =>
        HttpResponse.json({ bundleUrl: BUNDLE_URL })
      )
    );

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (
      await import('../src/index')
    ).default;

    const injectedScript = document.head.querySelector('script');
    injectedScript?.onerror?.(new Event('error'));

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(
          `Failed to load bundle: ${BUNDLE_URL}`
        ),
      })
    );
  });

  it('logs error when network fails', async () => {
    script.src =
      '../src/index.ts?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID';

    server.use(
      http.get(`${RESOLVER_URL}/YOUR_EXPERIENCE_ID`, () => HttpResponse.error())
    );

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (
      await import('../src/index')
    ).default;

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(
          'Network error: failed to reach resolver'
        ),
      })
    );
  });

  it('logs error when resolver returns invalid JSON', async () => {
    script.src =
      '../src/index.ts?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID';

    server.use(
      http.get(
        `${RESOLVER_URL}/YOUR_EXPERIENCE_ID`,
        () =>
          new HttpResponse('not json', {
            headers: { 'Content-Type': 'text/html' },
          })
      )
    );

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (
      await import('../src/index')
    ).default;

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Resolver returned invalid JSON'),
      })
    );
  });

  it('calls AlgoliaExperiences.run when bundle loads', async () => {
    script.src =
      '../src/index.ts?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID';

    server.use(
      http.get(`${RESOLVER_URL}/YOUR_EXPERIENCE_ID`, () =>
        HttpResponse.json({ bundleUrl: BUNDLE_URL })
      )
    );

    const runSpy = vi.fn();
    window.AlgoliaExperiences = { run: runSpy };

    await (
      await import('../src/index')
    ).default;

    const injectedScript = document.head.querySelector('script');
    injectedScript?.onload?.(new Event('load'));

    expect(runSpy).toHaveBeenCalled();
  });
});
