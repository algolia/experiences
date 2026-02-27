import { afterEach, describe, expect, it } from 'vitest';

import {
  fireInput,
  getInput,
  getSwitch,
  renderEditor,
} from './widget-test-utils';

afterEach(() => {
  document.body.innerHTML = '';
});

function render(params: Record<string, unknown> = {}) {
  return renderEditor(params, 'ais.trendingItems');
}

function getTextarea(
  container: HTMLElement,
  label: string
): HTMLTextAreaElement {
  const labels = Array.from(container.querySelectorAll('label'));
  const target = labels.find((el) => {
    return el.textContent?.trim() === label;
  });

  if (!target) {
    throw new Error(`No label found with text "${label}"`);
  }

  const fieldRoot = target.closest('.group');
  const textarea = fieldRoot?.querySelector('textarea');

  if (!textarea) {
    throw new Error(`No textarea found for label "${label}"`);
  }

  return textarea as HTMLTextAreaElement;
}

function fireTextareaInput(textarea: HTMLTextAreaElement, value: string) {
  Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    'value'
  )!.set!.call(textarea, value);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('ais.trendingItems fields', () => {
  describe('limit', () => {
    it('renders with placeholder when absent', () => {
      const { container } = render();
      const input = getInput(container, 'Limit');
      expect(input.value).toBe('');
      expect(input.placeholder).toBe('Auto');
    });

    it('calls onParameterChange with number when set', () => {
      const { container, onParameterChange } = render();
      const input = getInput(container, 'Limit');
      fireInput(input, '10');

      expect(onParameterChange).toHaveBeenCalledWith('limit', 10);
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({ limit: 10 });
      const input = getInput(container, 'Limit');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('limit', undefined);
    });
  });

  describe('threshold', () => {
    it('renders with placeholder when absent', () => {
      const { container } = render();
      const input = getInput(container, 'Threshold');
      expect(input.value).toBe('');
      expect(input.placeholder).toBe('0');
    });

    it('calls onParameterChange with number when set', () => {
      const { container, onParameterChange } = render();
      const input = getInput(container, 'Threshold');
      fireInput(input, '50');

      expect(onParameterChange).toHaveBeenCalledWith('threshold', 50);
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({ threshold: 50 });
      const input = getInput(container, 'Threshold');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('threshold', undefined);
    });
  });

  describe('facetName', () => {
    it('renders an empty text input by default', () => {
      const { container } = render();
      const input = getInput(container, 'Facet name');
      expect(input.value).toBe('');
      expect(input.placeholder).toBe('e.g. category');
    });

    it('calls onParameterChange when editing', () => {
      const { container, onParameterChange } = render();
      const input = getInput(container, 'Facet name');
      fireInput(input, 'category');

      expect(onParameterChange).toHaveBeenCalledWith('facetName', 'category');
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({
        facetName: 'category',
      });
      const input = getInput(container, 'Facet name');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('facetName', undefined);
    });
  });

  describe('facetValue', () => {
    it('renders an empty text input by default', () => {
      const { container } = render();
      const input = getInput(container, 'Facet value');
      expect(input.value).toBe('');
      expect(input.placeholder).toBe('e.g. Shoes');
    });

    it('calls onParameterChange when editing', () => {
      const { container, onParameterChange } = render();
      const input = getInput(container, 'Facet value');
      fireInput(input, 'Shoes');

      expect(onParameterChange).toHaveBeenCalledWith('facetValue', 'Shoes');
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({
        facetValue: 'Shoes',
      });
      const input = getInput(container, 'Facet value');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('facetValue', undefined);
    });
  });

  describe('escapeHTML', () => {
    it('renders a switch on by default', () => {
      const { container } = render({ escapeHTML: true });
      const switchEl = getSwitch(container, 'Escape HTML');
      expect(switchEl.getAttribute('aria-checked')).toBe('true');
    });

    it('calls onParameterChange when toggling off', () => {
      const { container, onParameterChange } = render({ escapeHTML: true });
      const switchEl = getSwitch(container, 'Escape HTML');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('escapeHTML', false);
    });
  });

  describe('queryParameters', () => {
    it('renders a toggle off by default', () => {
      const { container } = render();
      const switchEl = getSwitch(container, 'Query parameters');
      expect(switchEl.getAttribute('aria-checked')).toBe('false');
    });

    it('calls onParameterChange with empty object when toggling on', () => {
      const { container, onParameterChange } = render();
      const switchEl = getSwitch(container, 'Query parameters');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('queryParameters', {});
    });

    it('calls onParameterChange with undefined when toggling off', () => {
      const { container, onParameterChange } = render({
        queryParameters: { filters: 'brand:Apple' },
      });
      const switchEl = getSwitch(container, 'Query parameters');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith(
        'queryParameters',
        undefined
      );
    });

    it('sends the parsed object when valid JSON is entered', () => {
      const { onParameterChange, container } = render({
        queryParameters: {},
      });
      const textarea = getTextarea(container, 'Query parameters');

      fireTextareaInput(textarea, '{"filters": "brand:Apple"}');

      expect(onParameterChange).toHaveBeenCalledWith('queryParameters', {
        filters: 'brand:Apple',
      });
    });
  });

  describe('fallbackParameters', () => {
    it('renders a toggle off by default', () => {
      const { container } = render();
      const switchEl = getSwitch(container, 'Fallback parameters');
      expect(switchEl.getAttribute('aria-checked')).toBe('false');
    });

    it('calls onParameterChange with empty object when toggling on', () => {
      const { container, onParameterChange } = render();
      const switchEl = getSwitch(container, 'Fallback parameters');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('fallbackParameters', {});
    });

    it('calls onParameterChange with undefined when toggling off', () => {
      const { container, onParameterChange } = render({
        fallbackParameters: { hitsPerPage: 5 },
      });
      const switchEl = getSwitch(container, 'Fallback parameters');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith(
        'fallbackParameters',
        undefined
      );
    });

    it('sends the parsed object when valid JSON is entered', () => {
      const { onParameterChange, container } = render({
        fallbackParameters: {},
      });
      const textarea = getTextarea(container, 'Fallback parameters');

      fireTextareaInput(textarea, '{"hitsPerPage": 10}');

      expect(onParameterChange).toHaveBeenCalledWith('fallbackParameters', {
        hitsPerPage: 10,
      });
    });
  });

  describe('item-template field (template)', () => {
    it('sends the updated object when a sub-field changes', () => {
      const { onParameterChange, container } = render({
        template: {
          name: '',
          category: '',
          description: '',
          image: '',
          price: '',
          currency: '',
        },
      });
      const input = getInput(container, 'Name');

      fireInput(input, 'product_name');

      expect(onParameterChange).toHaveBeenCalledWith(
        'template',
        expect.objectContaining({ name: 'product_name' })
      );
    });

    it('sends the updated object when currency changes', () => {
      const { onParameterChange, container } = render({
        template: {
          name: '',
          category: '',
          description: '',
          image: '',
          price: '',
          currency: '',
        },
      });
      const input = getInput(container, 'Currency');

      fireInput(input, '$');

      expect(onParameterChange).toHaveBeenCalledWith(
        'template',
        expect.objectContaining({ currency: '$' })
      );
    });
  });

  describe('cssClasses', () => {
    it('renders a toggle off by default', () => {
      const { container } = render();
      const switchEl = getSwitch(container, 'CSS classes');
      expect(switchEl.getAttribute('aria-checked')).toBe('false');
    });

    it('calls onParameterChange with default value when toggling on', () => {
      const { container, onParameterChange } = render();
      const switchEl = getSwitch(container, 'CSS classes');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('cssClasses', {
        root: '',
        emptyRoot: '',
        title: '',
        container: '',
        list: '',
        item: '',
      });
    });

    it('calls onParameterChange with undefined when toggling off', () => {
      const { container, onParameterChange } = render({
        cssClasses: { root: 'my-root' },
      });
      const switchEl = getSwitch(container, 'CSS classes');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('cssClasses', undefined);
    });
  });
});
