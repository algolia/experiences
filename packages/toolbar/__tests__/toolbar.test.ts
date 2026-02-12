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

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.resetModules();

  delete window.__ALGOLIA_EXPERIENCES_TOOLBAR_CONFIG__;
  document.body.innerHTML = '';
  document.head.querySelectorAll('style').forEach((el) => el.remove());
});
afterAll(() => server.close());

const MOCK_EXPERIENCE = {
  blocks: [
    {
      type: 'ais.chat',
      parameters: {
        container: '#chat',
        cssVariables: { primaryColor: '#003dff' },
        indexName: 'products',
      },
    },
    {
      type: 'ais.autocomplete',
      parameters: {
        container: '#autocomplete',
        cssVariables: {},
      },
    },
  ],
};

describe('toolbar', () => {
  it('logs error when config is missing', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await import('../src/index');

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(
          'Missing window.__ALGOLIA_EXPERIENCES_TOOLBAR_CONFIG__'
        ),
      })
    );

    errorSpy.mockRestore();
  });

  describe('with config', () => {
    beforeEach(() => {
      window.__ALGOLIA_EXPERIENCES_TOOLBAR_CONFIG__ = {
        appId: 'APP_ID',
        apiKey: 'API_KEY',
        experienceId: 'exp-123',
        env: 'prod',
      };

      server.use(
        http.get('https://experiences.algolia.com/1/experiences/exp-123', () =>
          HttpResponse.json(MOCK_EXPERIENCE)
        )
      );
    });

    it('creates a shadow DOM host element', async () => {
      await import('../src/index');

      // Wait for async mount
      await new Promise((resolve) => setTimeout(resolve, 50));

      const host = document.getElementById('algolia-experiences-toolbar');
      expect(host).not.toBeNull();
      expect(host?.shadowRoot).not.toBeNull();
    });

    it('injects CSS into the shadow root', async () => {
      await import('../src/index');
      await new Promise((resolve) => setTimeout(resolve, 50));

      const host = document.getElementById('algolia-experiences-toolbar');
      const style = host?.shadowRoot?.querySelector('style');
      expect(style?.textContent).toContain('box-sizing');
    });

    it('renders the pill (collapsed state) by default', async () => {
      await import('../src/index');
      await new Promise((resolve) => setTimeout(resolve, 50));

      const host = document.getElementById('algolia-experiences-toolbar');
      const pill = host?.shadowRoot?.querySelector(
        'button[aria-label="Open Algolia Experiences toolbar"]'
      );
      expect(pill).not.toBeNull();
    });
  });
});
