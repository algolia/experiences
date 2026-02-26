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
  return renderEditor(params, 'ais.hierarchicalMenu');
}

describe('ais.hierarchicalMenu fields', () => {
  describe('attributes', () => {
    it('does not render a toggle switch', () => {
      const { container } = render({ attributes: [] });
      const labels = Array.from(container.querySelectorAll('label'));
      const label = labels.find((el) => {
        return el.textContent?.trim() === 'Attributes';
      });
      expect(label).toBeDefined();

      const switches = Array.from(
        container.querySelectorAll('button[role="switch"]')
      );
      const attrSwitch = switches.find((btn) => {
        return btn.id === label?.getAttribute('for');
      });
      expect(attrSwitch).toBeUndefined();
    });

    it('renders existing items', () => {
      const { container } = render({
        attributes: ['categories.lvl0', 'categories.lvl1'],
      });
      const inputs = Array.from(container.querySelectorAll('input'));
      const attrInputs = inputs.filter((input) => {
        return input.placeholder === 'e.g. categories.lvl0';
      });
      expect(attrInputs.length).toBe(2);
      expect(attrInputs[0].value).toBe('categories.lvl0');
      expect(attrInputs[1].value).toBe('categories.lvl1');
    });

    it('calls onParameterChange when adding an item', () => {
      const { container, onParameterChange } = render({
        attributes: ['categories.lvl0'],
      });
      const addButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => {
          return btn.textContent?.includes('Add');
        }
      )!;
      addButton.click();

      expect(onParameterChange).toHaveBeenCalledWith('attributes', [
        'categories.lvl0',
        '',
      ]);
    });

    it('calls onParameterChange when editing an item', () => {
      const { container, onParameterChange } = render({
        attributes: ['categories.lvl0'],
      });
      const inputs = Array.from(
        container.querySelectorAll<HTMLInputElement>('input')
      ).filter((input) => {
        return input.placeholder === 'e.g. categories.lvl0';
      });
      fireInput(inputs[0], 'tags.lvl0');

      expect(onParameterChange).toHaveBeenCalledWith('attributes', [
        'tags.lvl0',
      ]);
    });

    it('calls onParameterChange when removing an item', () => {
      const { container, onParameterChange } = render({
        attributes: ['categories.lvl0', 'categories.lvl1'],
      });
      const removeButtons = Array.from(
        container.querySelectorAll<HTMLButtonElement>(
          'button[aria-label="Remove item"]'
        )
      );
      removeButtons[0].click();

      expect(onParameterChange).toHaveBeenCalledWith('attributes', [
        'categories.lvl1',
      ]);
    });

    it('results in an empty array when removing the last item', () => {
      const { container, onParameterChange } = render({
        attributes: ['categories.lvl0'],
      });
      const removeButton = container.querySelector(
        'button[aria-label="Remove item"]'
      ) as HTMLButtonElement;
      removeButton.click();

      expect(onParameterChange).toHaveBeenCalledWith('attributes', []);
    });
  });

  describe('separator', () => {
    it('renders with placeholder when absent', () => {
      const { container } = render();
      const input = getInput(container, 'Separator');
      expect(input.value).toBe('');
      expect(input.placeholder).toBe(' > ');
    });

    it('calls onParameterChange with value when set', () => {
      const { container, onParameterChange } = render();
      const input = getInput(container, 'Separator');
      fireInput(input, ' / ');

      expect(onParameterChange).toHaveBeenCalledWith('separator', ' / ');
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({ separator: ' / ' });
      const input = getInput(container, 'Separator');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('separator', undefined);
    });
  });

  describe('showParentLevel', () => {
    it('renders a switch on by default', () => {
      const { container } = render({ showParentLevel: true });
      const switchEl = getSwitch(container, 'Show parent level');
      expect(switchEl.getAttribute('aria-checked')).toBe('true');
    });

    it('calls onParameterChange when toggled off', () => {
      const { container, onParameterChange } = render({
        showParentLevel: true,
      });
      const switchEl = getSwitch(container, 'Show parent level');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('showParentLevel', false);
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
        childList: '',
        item: '',
        selectedItem: '',
        parentItem: '',
        link: '',
        selectedItemLink: '',
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
