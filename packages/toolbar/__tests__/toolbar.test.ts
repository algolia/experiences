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

    describe('add widget', () => {
      async function openToolbar() {
        await import('../src/index');
        await new Promise((resolve) => setTimeout(resolve, 50));

        const host = document.getElementById('algolia-experiences-toolbar');
        const pill = host?.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Open Algolia Experiences toolbar"]'
        );
        pill?.click();
        await new Promise((resolve) => setTimeout(resolve, 50));

        return host!;
      }

      it('shows a popover with widget options when clicking "Add widget"', async () => {
        const host = await openToolbar();

        const addButton = host.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Add widget"]'
        );
        expect(addButton).not.toBeNull();
        addButton!.click();
        await new Promise((resolve) => setTimeout(resolve, 50));

        const popoverText = host.shadowRoot?.innerHTML ?? '';
        expect(popoverText).toContain('Autocomplete');
        expect(popoverText).toContain('Chat');
        expect(popoverText).toContain('Hits');
        expect(popoverText).toContain('Coming Soon');
      });

      it('adds a new block when selecting "Autocomplete"', async () => {
        const host = await openToolbar();

        const addButton = host.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Add widget"]'
        );
        addButton!.click();
        await new Promise((resolve) => setTimeout(resolve, 50));

        // The popover renders enabled items as buttons directly inside the
        // popover container (the div with the border/shadow). These buttons
        // have trimmed textContent like "Autocomplete" (icon + span).
        // Block card triggers live deeper in the tree and contain badges, etc.
        // We find the popover's own Autocomplete button by matching on
        // textContent being exactly the label (possibly with whitespace).
        const buttons = Array.from(
          host.shadowRoot?.querySelectorAll('button') ?? []
        );
        const autocompleteOption = buttons.find(
          (btn) =>
            btn.textContent?.trim() === 'Autocomplete' && btn !== addButton
        );
        expect(autocompleteOption).not.toBeUndefined();
        autocompleteOption!.click();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // There should be 3 block cards (2 original + 1 new)
        const cards =
          host.shadowRoot?.querySelectorAll('[data-slot="card"]') ?? [];
        expect(cards.length).toBe(3);
      });

      it('does not allow clicking disabled options', async () => {
        const host = await openToolbar();

        const addButton = host.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Add widget"]'
        );
        addButton!.click();
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Disabled items are rendered as <div> elements, not <button>
        // Check that "Hits" is not a button
        const buttons = Array.from(
          host.shadowRoot?.querySelectorAll('button') ?? []
        );
        const recommendationsButton = buttons.find(
          (btn) => btn.textContent?.includes('Hits') && btn !== addButton
        );
        expect(recommendationsButton).toBeUndefined();

        // Verify the text is still rendered (as a div)
        const popoverText = host.shadowRoot?.innerHTML ?? '';
        expect(popoverText).toContain('Hits');
      });
    });

    describe('locate button', () => {
      beforeEach(() => {
        // jsdom does not implement Web Animations API
        Element.prototype.animate = vi.fn(() => ({
          onfinish: null,
          cancel: vi.fn(),
          finished: Promise.resolve(),
        })) as unknown as typeof Element.prototype.animate;
      });

      async function openToolbar() {
        await import('../src/index');
        await new Promise((resolve) => setTimeout(resolve, 50));

        const host = document.getElementById('algolia-experiences-toolbar');
        const pill = host?.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Open Algolia Experiences toolbar"]'
        );
        pill?.click();
        await new Promise((resolve) => setTimeout(resolve, 50));

        return host!;
      }

      it('scrolls the matching container element into view', async () => {
        const container = document.createElement('div');
        container.id = 'chat';
        container.scrollIntoView = vi.fn();
        document.body.appendChild(container);

        const host = await openToolbar();

        const locateButton = host.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Locate #chat"]'
        );
        expect(locateButton).not.toBeNull();
        locateButton!.click();

        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(container.scrollIntoView).toHaveBeenCalledWith({
          behavior: 'instant',
          block: 'center',
        });
      });

      it('shows a toast when the container element is not found', async () => {
        const host = await openToolbar();

        const locateButton = host.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Locate #chat"]'
        );
        expect(locateButton).not.toBeNull();
        locateButton!.click();

        // Wait for Preact to re-render after setToast
        await new Promise((resolve) => setTimeout(resolve, 100));

        const allText = host.shadowRoot?.innerHTML ?? '';
        expect(allText).toContain('Container "#chat" not found on page.');
      });
    });
  });
});
