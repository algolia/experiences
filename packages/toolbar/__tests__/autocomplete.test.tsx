import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { getSwitch, renderEditor } from './widget-test-utils';

const server = setupServer(
  http.get('https://TEST_APP-dsn.algolia.net/1/indexes', () => {
    return HttpResponse.json({ items: [] });
  }),
  http.get('https://query-suggestions.*.algolia.com/1/configs', () => {
    return HttpResponse.json([]);
  })
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});
afterEach(() => {
  server.resetHandlers();
  document.body.innerHTML = '';
});
afterAll(() => {
  server.close();
});

function render(params: Record<string, unknown> = {}) {
  return renderEditor(params, 'ais.autocomplete');
}

describe('ais.autocomplete field behavior', () => {
  describe('recent-config field', () => {
    it('renders disabled state when showRecent is false', () => {
      const { container } = render({ showRecent: false });

      const toggle = getSwitch(container, 'Recent Searches');

      expect(toggle.getAttribute('aria-checked')).toBe('false');
    });

    it('renders card with header field when enabled', () => {
      const { container } = render({
        showRecent: { templates: { header: 'Recent' } },
      });

      const toggle = getSwitch(container, 'Recent Searches');

      expect(toggle.getAttribute('aria-checked')).toBe('true');
      expect(container.textContent).toContain('Header');
    });

    it('creates default config object when toggled on', () => {
      const { onParameterChange, container } = render({
        showRecent: false,
      });

      const toggle = getSwitch(container, 'Recent Searches');
      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('showRecent', {
        templates: { header: '' },
      });
    });

    it('sets value to false when toggled off', () => {
      const { onParameterChange, container } = render({
        showRecent: { templates: { header: 'Recent' } },
      });

      const toggle = getSwitch(container, 'Recent Searches');
      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('showRecent', false);
    });
  });

  describe('suggestions-config field', () => {
    it('renders disabled state when showSuggestions is false', () => {
      const { container } = render({ showSuggestions: false });

      const toggle = getSwitch(container, 'Suggestions');

      expect(toggle.getAttribute('aria-checked')).toBe('false');
    });

    it('renders card with fields when enabled', () => {
      const { container } = render({
        showSuggestions: {
          indexName: 'products_qs',
          searchPageUrl: '/search',
          queryParam: 'q',
          templates: { header: 'Suggestions' },
        },
      });

      const toggle = getSwitch(container, 'Suggestions');

      expect(toggle.getAttribute('aria-checked')).toBe('true');
      expect(container.textContent).toContain('Index Name');
      expect(container.textContent).toContain('Header');
      expect(container.textContent).toContain('Search Page URL');
      expect(container.textContent).toContain('Query Parameter');
    });

    it('creates default config object when toggled on', () => {
      const { onParameterChange, container } = render({
        showSuggestions: false,
      });

      const toggle = getSwitch(container, 'Suggestions');
      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('showSuggestions', {
        indexName: '',
        searchPageUrl: '',
        queryParam: 'q',
        templates: { header: '' },
      });
    });

    it('sets value to false when toggled off', () => {
      const { onParameterChange, container } = render({
        showSuggestions: {
          indexName: 'products_qs',
          searchPageUrl: '/search',
          queryParam: 'q',
          templates: { header: 'Suggestions' },
        },
      });

      const toggle = getSwitch(container, 'Suggestions');
      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('showSuggestions', false);
    });
  });

  describe('indices-config field', () => {
    it('renders empty state when indices is an empty array', () => {
      const { container } = render({ indices: [] });

      expect(container.textContent).toContain(
        'No additional indices configured.'
      );
    });

    it('renders the "Add Index" button', () => {
      const { container } = render({ indices: [] });

      const addButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => {
          return btn.textContent?.includes('Add Index');
        }
      );

      expect(addButton).toBeDefined();
    });

    it('calls onParameterChange with a new entry when adding an index', () => {
      const { onParameterChange, container } = render({ indices: [] });

      const addButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => {
          return btn.textContent?.includes('Add Index');
        }
      );

      addButton!.click();

      expect(onParameterChange).toHaveBeenCalledWith('indices', [
        { indexName: '', hitsPerPage: 5 },
      ]);
    });

    it('renders entry cards for populated indices', () => {
      const { container } = render({
        indices: [
          {
            indexName: 'products',
            hitsPerPage: 5,
            templates: { header: 'Products' },
          },
          {
            indexName: 'articles',
            hitsPerPage: 3,
            templates: { header: 'Articles' },
          },
        ],
      });

      expect(container.textContent).toContain('Products');
      expect(container.textContent).toContain('Articles');
    });

    it('calls onParameterChange without the removed entry when deleting', () => {
      const { onParameterChange, container } = render({
        indices: [
          {
            indexName: 'products',
            hitsPerPage: 5,
            templates: { header: 'Products' },
          },
          {
            indexName: 'articles',
            hitsPerPage: 3,
            templates: { header: 'Articles' },
          },
        ],
      });

      const removeButtons = Array.from(
        container.querySelectorAll('button[aria-label="Remove index"]')
      );

      removeButtons[0]!.click();

      expect(onParameterChange).toHaveBeenCalledWith('indices', [
        {
          indexName: 'articles',
          hitsPerPage: 3,
          templates: { header: 'Articles' },
        },
      ]);
    });
  });
});
