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
  vi.unstubAllGlobals();
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

  it('navigates to the dashboard auth page when pill is clicked without a key', async () => {
    vi.stubGlobal('location', {
      href: 'http://localhost/',
      search: '',
      pathname: '/',
      hash: '',
    });

    const host = await mountToolbar();
    const pill = host.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label="Open Algolia Experiences toolbar"]'
    );
    pill?.click();

    expect(window.location.href).toContain('/authenticate/exp-123');
  });

  it('unlocks the toolbar when URL contains a token parameter', async () => {
    vi.stubGlobal('location', {
      href: 'http://localhost/?token=WRITE_KEY',
      search: '?token=WRITE_KEY',
      pathname: '/',
      hash: '',
    });
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

    const host = await mountToolbar();
    await new Promise((resolve) => {
      return setTimeout(resolve, 50);
    });

    expect(sessionStorage.getItem('experiences.exp-123.key')).toBe('WRITE_KEY');

    // Panel should be open (no aria-hidden)
    const panel = host.shadowRoot?.querySelector('div[aria-hidden]');
    expect(panel).toBeNull();
  });

  it('cleans the token from the URL after reading it', async () => {
    vi.stubGlobal('location', {
      href: 'http://localhost/page?token=WRITE_KEY&other=keep#section',
      search: '?token=WRITE_KEY&other=keep',
      pathname: '/page',
      hash: '#section',
    });
    const replaceStateSpy = vi
      .spyOn(window.history, 'replaceState')
      .mockImplementation(() => {});

    await mountToolbar();
    await new Promise((resolve) => {
      return setTimeout(resolve, 50);
    });

    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      '',
      '/page?other=keep#section'
    );
  });

  it('does not unlock when no token is present in the URL', async () => {
    await mountToolbar();
    await new Promise((resolve) => {
      return setTimeout(resolve, 50);
    });

    expect(sessionStorage.getItem('experiences.exp-123.key')).toBeNull();
  });
});
