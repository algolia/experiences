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
  vi.resetModules();

  delete window.__ALGOLIA_EXPERIENCES_TOOLBAR_CONFIG__;
  document.body.innerHTML = '';
  document.head.querySelectorAll('style').forEach((el) => {
    return el.remove();
  });
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
        http.get(
          'https://experiences.algolia.com/1/experiences/exp-123',
          () => {
            return HttpResponse.json(MOCK_EXPERIENCE);
          }
        )
      );
    });

    it('creates a shadow DOM host element', async () => {
      await import('../src/index');

      // Wait for async mount
      await new Promise((resolve) => {
        return setTimeout(resolve, 50);
      });

      const host = document.getElementById('algolia-experiences-toolbar');
      expect(host).not.toBeNull();
      expect(host?.shadowRoot).not.toBeNull();
    });

    it('injects CSS into the shadow root', async () => {
      await import('../src/index');
      await new Promise((resolve) => {
        return setTimeout(resolve, 50);
      });

      const host = document.getElementById('algolia-experiences-toolbar');
      const style = host?.shadowRoot?.querySelector('style');
      expect(style?.textContent).toContain('box-sizing');
    });

    it('renders the pill (collapsed state) by default', async () => {
      await import('../src/index');
      await new Promise((resolve) => {
        return setTimeout(resolve, 50);
      });

      const host = document.getElementById('algolia-experiences-toolbar');
      const pill = host?.shadowRoot?.querySelector(
        'button[aria-label="Open Algolia Experiences toolbar"]'
      );
      expect(pill).not.toBeNull();
    });

    describe('add widget', () => {
      beforeEach(() => {
        sessionStorage.setItem('experiences.exp-123.key', 'ADMIN_KEY');
      });

      afterEach(() => {
        sessionStorage.clear();
      });

      async function openToolbar() {
        await import('../src/index');
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        const host = document.getElementById('algolia-experiences-toolbar');
        const pill = host?.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Open Algolia Experiences toolbar"]'
        );
        pill?.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        return host!;
      }

      it('shows a popover with widget options when clicking "Add widget"', async () => {
        const host = await openToolbar();

        const addButton = host.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Add widget"]'
        );
        expect(addButton).not.toBeNull();
        addButton!.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

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
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        // The popover renders enabled items as buttons directly inside the
        // popover container (the div with the border/shadow). These buttons
        // have trimmed textContent like "Autocomplete" (icon + span).
        // Block card triggers live deeper in the tree and contain badges, etc.
        // We find the popover's own Autocomplete button by matching on
        // textContent being exactly the label (possibly with whitespace).
        const buttons = Array.from(
          host.shadowRoot?.querySelectorAll('button') ?? []
        );
        const autocompleteOption = buttons.find((btn) => {
          return (
            btn.textContent?.trim() === 'Autocomplete' && btn !== addButton
          );
        });
        expect(autocompleteOption).not.toBeUndefined();
        autocompleteOption!.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 100);
        });

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
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        // Disabled items are rendered as <div> elements, not <button>
        // Check that "Hits" is not a button
        const buttons = Array.from(
          host.shadowRoot?.querySelectorAll('button') ?? []
        );
        const recommendationsButton = buttons.find((btn) => {
          return btn.textContent?.includes('Hits') && btn !== addButton;
        });
        expect(recommendationsButton).toBeUndefined();

        // Verify the text is still rendered (as a div)
        const popoverText = host.shadowRoot?.innerHTML ?? '';
        expect(popoverText).toContain('Hits');
      });
    });

    describe('block cards', () => {
      beforeEach(() => {
        sessionStorage.setItem('experiences.exp-123.key', 'ADMIN_KEY');
      });

      afterEach(() => {
        sessionStorage.clear();
      });

      async function openToolbar() {
        await import('../src/index');
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        const host = document.getElementById('algolia-experiences-toolbar');
        const pill = host?.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Open Algolia Experiences toolbar"]'
        );
        pill?.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        return host!;
      }

      it('shows the correct widget count', async () => {
        const host = await openToolbar();
        const text = host.shadowRoot?.innerHTML ?? '';
        expect(text).toContain('2 widgets configured');
      });

      it('uses singular "widget" for a single block', async () => {
        server.use(
          http.get(
            'https://experiences.algolia.com/1/experiences/exp-123',
            () => {
              return HttpResponse.json({
                blocks: [MOCK_EXPERIENCE.blocks[0]],
              });
            }
          )
        );

        const host = await openToolbar();
        const text = host.shadowRoot?.innerHTML ?? '';
        expect(text).toContain('1 widget configured');
        expect(text).not.toContain('1 widgets');
      });

      it('expands a block card when clicking its header', async () => {
        const host = await openToolbar();

        const triggers =
          host.shadowRoot?.querySelectorAll<HTMLButtonElement>(
            '[aria-expanded]'
          );
        expect(triggers!.length).toBeGreaterThanOrEqual(2);

        // All collapsed initially
        const firstTrigger = triggers![0]!;
        expect(firstTrigger.getAttribute('aria-expanded')).toBe('false');

        firstTrigger.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        expect(firstTrigger.getAttribute('aria-expanded')).toBe('true');
      });

      it('collapses a block card when clicking its header again', async () => {
        const host = await openToolbar();

        const trigger =
          host.shadowRoot?.querySelector<HTMLButtonElement>('[aria-expanded]')!;

        // Expand
        trigger.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });
        expect(trigger.getAttribute('aria-expanded')).toBe('true');

        // Collapse
        trigger.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
      });

      it('collapses the previous block when expanding another', async () => {
        const host = await openToolbar();

        const triggers = Array.from(
          host.shadowRoot?.querySelectorAll<HTMLButtonElement>(
            '[aria-expanded]'
          ) ?? []
        );

        // Expand first block
        triggers[0]!.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });
        expect(triggers[0]!.getAttribute('aria-expanded')).toBe('true');

        // Expand second block
        triggers[1]!.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });
        expect(triggers[0]!.getAttribute('aria-expanded')).toBe('false');
        expect(triggers[1]!.getAttribute('aria-expanded')).toBe('true');
      });

      it('removes a block card when clicking delete', async () => {
        const host = await openToolbar();

        const cardsBefore =
          host.shadowRoot?.querySelectorAll('[data-slot="card"]') ?? [];
        expect(cardsBefore.length).toBe(2);

        const deleteButton = host.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Delete block"]'
        );
        expect(deleteButton).not.toBeNull();
        deleteButton!.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        const cardsAfter =
          host.shadowRoot?.querySelectorAll('[data-slot="card"]') ?? [];
        expect(cardsAfter.length).toBe(1);
      });

      it('updates widget count after deleting a block', async () => {
        const host = await openToolbar();

        const deleteButton = host.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Delete block"]'
        );
        deleteButton!.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        const text = host.shadowRoot?.innerHTML ?? '';
        expect(text).toContain('1 widget configured');
      });
    });

    describe('close button', () => {
      beforeEach(() => {
        sessionStorage.setItem('experiences.exp-123.key', 'ADMIN_KEY');
      });

      afterEach(() => {
        sessionStorage.clear();
      });

      async function openToolbar() {
        await import('../src/index');
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        const host = document.getElementById('algolia-experiences-toolbar');
        const pill = host?.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Open Algolia Experiences toolbar"]'
        );
        pill?.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        return host!;
      }

      it('closes the panel and shows the pill again', async () => {
        const host = await openToolbar();

        // Panel should be open (not aria-hidden)
        const panel = host.shadowRoot?.querySelector('[aria-hidden]');
        expect(panel).toBeNull();

        const closeButton = host.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Close toolbar"]'
        );
        expect(closeButton).not.toBeNull();
        closeButton!.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        // Panel should now have aria-hidden
        const hiddenPanel = host.shadowRoot?.querySelector(
          '[aria-hidden="true"]'
        );
        expect(hiddenPanel).not.toBeNull();

        // Pill should be visible again
        const pill = host.shadowRoot?.querySelector(
          'button[aria-label="Open Algolia Experiences toolbar"]'
        );
        expect(pill).not.toBeNull();
      });
    });

    describe('save flow', () => {
      beforeEach(() => {
        sessionStorage.setItem('experiences.exp-123.key', 'ADMIN_KEY');
      });

      afterEach(() => {
        sessionStorage.clear();
      });

      async function openToolbar() {
        await import('../src/index');
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        const host = document.getElementById('algolia-experiences-toolbar');
        const pill = host?.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Open Algolia Experiences toolbar"]'
        );
        pill?.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        return host!;
      }

      function findSaveButton(host: HTMLElement) {
        const buttons = Array.from(
          host.shadowRoot?.querySelectorAll('button') ?? []
        );
        return buttons.find((btn) => {
          return btn.textContent?.trim() === 'Save';
        });
      }

      it('disables the save button when there are no changes', async () => {
        const host = await openToolbar();
        const saveButton = findSaveButton(host);
        expect(saveButton).not.toBeUndefined();
        expect(saveButton!.disabled).toBe(true);
      });

      it('enables the save button after deleting a block', async () => {
        const host = await openToolbar();

        // Delete a block to make the experience dirty
        const deleteButton = host.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Delete block"]'
        );
        deleteButton!.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        const saveButton = findSaveButton(host);
        expect(saveButton!.disabled).toBe(false);
      });

      it('sends the updated experience to the API on save', async () => {
        let savedBody: unknown;

        server.use(
          http.post(
            'https://experiences.algolia.com/1/experiences',
            async ({ request }) => {
              savedBody = await request.json();
              return HttpResponse.json({});
            }
          )
        );

        const host = await openToolbar();

        // Delete first block to make dirty
        const deleteButton = host.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Delete block"]'
        );
        deleteButton!.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        const saveButton = findSaveButton(host)!;
        saveButton.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 100);
        });

        // Should have sent only the remaining block
        expect(savedBody).toEqual({
          blocks: [MOCK_EXPERIENCE.blocks[1]],
        });
      });

      it('shows "Saved" text after successful save', async () => {
        server.use(
          http.post('https://experiences.algolia.com/1/experiences', () => {
            return HttpResponse.json({});
          })
        );

        const host = await openToolbar();

        // Make dirty
        const deleteButton = host.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Delete block"]'
        );
        deleteButton!.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        findSaveButton(host)!.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 100);
        });

        const text = host.shadowRoot?.innerHTML ?? '';
        expect(text).toContain('Saved');
      });

      it('shows an error toast when save fails', async () => {
        server.use(
          http.post('https://experiences.algolia.com/1/experiences', () => {
            return HttpResponse.json(null, { status: 500 });
          })
        );

        const host = await openToolbar();

        // Make dirty
        const deleteButton = host.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Delete block"]'
        );
        deleteButton!.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        findSaveButton(host)!.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 100);
        });

        const toast = host.shadowRoot?.querySelector('[role="alert"]');
        expect(toast).not.toBeNull();
        expect(toast?.textContent).toContain('Failed to save experience');
      });
    });

    describe('locate button', () => {
      beforeEach(() => {
        sessionStorage.setItem('experiences.exp-123.key', 'ADMIN_KEY');

        // jsdom does not implement Web Animations API
        Element.prototype.animate = vi.fn(() => {
          return {
            onfinish: null,
            cancel: vi.fn(),
            finished: Promise.resolve(),
          };
        }) as unknown as typeof Element.prototype.animate;
      });

      afterEach(() => {
        sessionStorage.clear();
      });

      async function openToolbar() {
        await import('../src/index');
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

        const host = document.getElementById('algolia-experiences-toolbar');
        const pill = host?.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[aria-label="Open Algolia Experiences toolbar"]'
        );
        pill?.click();
        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

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

        await new Promise((resolve) => {
          return setTimeout(resolve, 50);
        });

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
        await new Promise((resolve) => {
          return setTimeout(resolve, 100);
        });

        const allText = host.shadowRoot?.innerHTML ?? '';
        expect(allText).toContain('Container "#chat" not found on page.');
      });
    });
  });
});
