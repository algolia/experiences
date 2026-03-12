import { afterEach, describe, expect, it } from 'vitest';

import { getSwitch, renderEditor } from './widget-test-utils';

afterEach(() => {
  document.body.innerHTML = '';
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

    it('handles legacy boolean true value', () => {
      const { container } = render({ showRecent: true });

      const toggle = getSwitch(container, 'Recent Searches');

      expect(toggle.getAttribute('aria-checked')).toBe('true');
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
});
