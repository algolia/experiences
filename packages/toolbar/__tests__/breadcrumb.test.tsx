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
  return renderEditor(params, 'ais.breadcrumb');
}

describe('ais.breadcrumb fields', () => {
  describe('attributes', () => {
    it('renders without a toggle switch', () => {
      const { container } = render({ attributes: [] });
      const switches = Array.from(
        container.querySelectorAll('button[role="switch"]')
      );
      const attributesSwitch = switches.find((btn) => {
        const label = btn
          .closest('div')
          ?.querySelector('label')
          ?.textContent?.trim();
        return label === 'Attributes';
      });
      expect(attributesSwitch).toBeUndefined();
    });

    it('renders the Add button when empty', () => {
      const { container } = render({ attributes: [] });
      const addButtons = Array.from(
        container.querySelectorAll('button')
      ).filter((btn) => {
        return btn.textContent?.trim() === 'Add';
      });
      expect(addButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('renders existing items', () => {
      const { container } = render({
        attributes: [
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
        ],
      });
      const inputs = Array.from(container.querySelectorAll('input')).filter(
        (input) => {
          return (
            input.value === 'hierarchicalCategories.lvl0' ||
            input.value === 'hierarchicalCategories.lvl1'
          );
        }
      );
      expect(inputs).toHaveLength(2);
    });

    it('calls onParameterChange with updated array when editing an item', () => {
      const { container, onParameterChange } = render({
        attributes: ['hierarchicalCategories.lvl0'],
      });
      const inputs = Array.from(container.querySelectorAll('input'));
      const attrInput = inputs.find((input) => {
        return input.value === 'hierarchicalCategories.lvl0';
      })!;
      fireInput(attrInput, 'categories.lvl0');

      expect(onParameterChange).toHaveBeenCalledWith('attributes', [
        'categories.lvl0',
      ]);
    });

    it('calls onParameterChange with a new item when clicking Add', () => {
      const { container, onParameterChange } = render({
        attributes: ['hierarchicalCategories.lvl0'],
      });
      const addButtons = Array.from(
        container.querySelectorAll('button')
      ).filter((btn) => {
        return btn.textContent?.trim() === 'Add';
      });
      addButtons[0]!.click();

      expect(onParameterChange).toHaveBeenCalledWith('attributes', [
        'hierarchicalCategories.lvl0',
        '',
      ]);
    });

    it('calls onParameterChange without the item when clicking Remove', () => {
      const { container, onParameterChange } = render({
        attributes: [
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
        ],
      });
      const removeButtons = Array.from(
        container.querySelectorAll('button[aria-label="Remove item"]')
      );
      removeButtons[0]!.click();

      expect(onParameterChange).toHaveBeenCalledWith('attributes', [
        'hierarchicalCategories.lvl1',
      ]);
    });
  });

  describe('separator', () => {
    it('renders with placeholder when absent', () => {
      const { container } = render();
      const input = getInput(container, 'Separator');
      expect(input.value).toBe('');
      expect(input.placeholder).toBe(' > ');
    });

    it('calls onParameterChange with string when set', () => {
      const { container, onParameterChange } = render();
      const input = getInput(container, 'Separator');
      fireInput(input, ' / ');

      expect(onParameterChange).toHaveBeenCalledWith('separator', ' / ');
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({ separator: ' > ' });
      const input = getInput(container, 'Separator');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('separator', undefined);
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
        separator: '',
        link: '',
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
