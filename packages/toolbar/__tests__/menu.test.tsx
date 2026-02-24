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
  return renderEditor(params, 'ais.menu');
}

describe('ais.menu fields', () => {
  describe('attribute', () => {
    it('renders an empty text input by default', () => {
      const { container } = render({ attribute: '' });
      const input = getInput(container, 'Attribute');
      expect(input.value).toBe('');
    });

    it('calls onParameterChange when editing', () => {
      const { container, onParameterChange } = render({ attribute: '' });
      const input = getInput(container, 'Attribute');
      fireInput(input, 'category');

      expect(onParameterChange).toHaveBeenCalledWith('attribute', 'category');
    });
  });

  describe('limit', () => {
    it('renders with placeholder when absent', () => {
      const { container } = render();
      const input = getInput(container, 'Limit');
      expect(input.value).toBe('');
      expect(input.placeholder).toBe('10');
    });

    it('calls onParameterChange with number when set', () => {
      const { container, onParameterChange } = render();
      const input = getInput(container, 'Limit');
      fireInput(input, '5');

      expect(onParameterChange).toHaveBeenCalledWith('limit', 5);
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({ limit: 5 });
      const input = getInput(container, 'Limit');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('limit', undefined);
    });
  });

  describe('showMore', () => {
    it('renders a switch off by default', () => {
      const { container } = render();
      const switchEl = getSwitch(container, 'Show more');
      expect(switchEl.getAttribute('aria-checked')).toBe('false');
    });

    it('calls onParameterChange when toggled on', () => {
      const { container, onParameterChange } = render();
      const switchEl = getSwitch(container, 'Show more');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('showMore', true);
    });

    it('clears showMoreLimit when toggled off', () => {
      const { container, onParameterChange } = render({
        showMore: true,
        showMoreLimit: 50,
      });
      const switchEl = getSwitch(container, 'Show more');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('showMore', false);
      expect(onParameterChange).toHaveBeenCalledWith(
        'showMoreLimit',
        undefined
      );
    });
  });

  describe('showMoreLimit', () => {
    it('is hidden when showMore is false', () => {
      const { container } = render();
      const labels = Array.from(container.querySelectorAll('label'));
      const label = labels.find((el) => {
        return el.textContent?.trim() === 'Show more limit';
      });
      expect(label).toBeUndefined();
    });

    it('renders with placeholder when showMore is true', () => {
      const { container } = render({ showMore: true });
      const input = getInput(container, 'Show more limit');
      expect(input.placeholder).toBe('20');
    });

    it('calls onParameterChange with number when set', () => {
      const { container, onParameterChange } = render({ showMore: true });
      const input = getInput(container, 'Show more limit');
      fireInput(input, '50');

      expect(onParameterChange).toHaveBeenCalledWith('showMoreLimit', 50);
    });
  });

  describe('sortBy', () => {
    it('renders a toggle off by default', () => {
      const { container } = render();
      const switchEl = getSwitch(container, 'Sort by');
      expect(switchEl.getAttribute('aria-checked')).toBe('false');
    });

    it('calls onParameterChange with first option when toggled on', () => {
      const { container, onParameterChange } = render();
      const switchEl = getSwitch(container, 'Sort by');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('sortBy', ['count:asc']);
    });

    it('calls onParameterChange with undefined when toggled off', () => {
      const { container, onParameterChange } = render({
        sortBy: ['name:asc'],
      });
      const switchEl = getSwitch(container, 'Sort by');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('sortBy', undefined);
    });

    it('adds a criterion when clicking Add', () => {
      const { container, onParameterChange } = render({
        sortBy: ['count:asc'],
      });
      const addButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => {
          return btn.textContent?.includes('Add');
        }
      )!;
      addButton.click();

      expect(onParameterChange).toHaveBeenCalledWith('sortBy', [
        'count:asc',
        'count:desc',
      ]);
    });

    it('removes a criterion and toggles off when last item is removed', () => {
      const { container, onParameterChange } = render({
        sortBy: ['name:asc'],
      });
      const removeButton = container.querySelector(
        'button[aria-label="Remove item"]'
      ) as HTMLButtonElement;
      removeButton.click();

      expect(onParameterChange).toHaveBeenCalledWith('sortBy', undefined);
    });

    it('removes a criterion from a multi-item list', () => {
      const { container, onParameterChange } = render({
        sortBy: ['count:asc', 'name:desc'],
      });
      const removeButtons = Array.from(
        container.querySelectorAll<HTMLButtonElement>(
          'button[aria-label="Remove item"]'
        )
      );
      removeButtons[0].click();

      expect(onParameterChange).toHaveBeenCalledWith('sortBy', ['name:desc']);
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
        noRefinementRoot: '',
        list: '',
        item: '',
        selectedItem: '',
        link: '',
        label: '',
        count: '',
        showMore: '',
        disabledShowMore: '',
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
