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

beforeAll(() => {
  return server.listen();
});
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
  vi.resetModules();

  delete window.__ALGOLIA_EXPERIENCES_TOOLBAR_CONFIG__;
  document.body.innerHTML = '';
  document.head.querySelectorAll('style').forEach((el) => {
    return el.remove();
  });
  sessionStorage.clear();
});
afterAll(() => {
  return server.close();
});

const MOCK_EXPERIENCE = {
  blocks: [
    {
      type: 'ais.chat',
      parameters: {
        container: '#chat',
        cssVariables: {},
      },
    },
  ],
};

describe('toolbar authentication', () => {
  beforeEach(() => {
    window.__ALGOLIA_EXPERIENCES_TOOLBAR_CONFIG__ = {
      appId: 'APP_ID',
      apiKey: 'API_KEY',
      experienceId: 'exp-123',
      env: 'prod',
    };

    server.use(
      http.get('https://experiences.algolia.com/1/experiences/exp-123', () => {
        return HttpResponse.json(MOCK_EXPERIENCE);
      })
    );
  });

  async function mountToolbar() {
    await import('../src/index');
    await new Promise((resolve) => {
      return setTimeout(resolve, 50);
    });

    return document.getElementById('algolia-experiences-toolbar')!;
  }

  it('opens the dashboard auth page when pill is clicked without a key', async () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

    const host = await mountToolbar();
    const pill = host.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label="Open Algolia Experiences toolbar"]'
    );
    pill?.click();

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('/authenticate/exp-123'),
      '_blank'
    );
  });

  it('unlocks the toolbar when receiving a valid postMessage', async () => {
    const host = await mountToolbar();

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://dashboard.algolia.com',
        data: { type: 'algoliaExperiencesKey', key: 'WRITE_KEY' },
      })
    );
    await new Promise((resolve) => {
      return setTimeout(resolve, 50);
    });

    // Panel should be open (no aria-hidden)
    const panel = host.shadowRoot?.querySelector('[aria-hidden]');
    expect(panel).toBeNull();

    // Key should be persisted in sessionStorage
    expect(sessionStorage.getItem('experiences.exp-123.key')).toBe('WRITE_KEY');
  });

  it('ignores messages from wrong origins', async () => {
    await mountToolbar();

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://evil.com',
        data: { type: 'algoliaExperiencesKey', key: 'EVIL_KEY' },
      })
    );
    await new Promise((resolve) => {
      return setTimeout(resolve, 50);
    });

    expect(sessionStorage.getItem('experiences.exp-123.key')).toBeNull();
  });

  it('ignores messages with wrong type', async () => {
    await mountToolbar();

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://dashboard.algolia.com',
        data: { type: 'somethingElse', key: 'SOME_KEY' },
      })
    );
    await new Promise((resolve) => {
      return setTimeout(resolve, 50);
    });

    expect(sessionStorage.getItem('experiences.exp-123.key')).toBeNull();
  });
});
