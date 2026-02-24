import { afterEach, describe, expect, it } from 'vitest';

import { fireInput, getSwitch, renderEditor } from './widget-test-utils';

afterEach(() => {
  document.body.innerHTML = '';
});

function render(params: Record<string, unknown> = {}) {
  return renderEditor(params, 'ais.clearRefinements');
}

describe('ais.clearRefinements fields', () => {
  describe('includedAttributes', () => {
    it('renders a toggle switch off by default', () => {
      const { container } = render();
      const switchEl = getSwitch(container, 'Included attributes');
      expect(switchEl.getAttribute('aria-checked')).toBe('false');
    });

    it('calls onParameterChange with empty array when toggling on', () => {
      const { container, onParameterChange } = render();
      const switchEl = getSwitch(container, 'Included attributes');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('includedAttributes', []);
    });

    it('clears excludedAttributes when toggling on', () => {
      const { container, onParameterChange } = render({
        excludedAttributes: ['query'],
      });
      const switchEl = getSwitch(container, 'Included attributes');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('includedAttributes', []);
      expect(onParameterChange).toHaveBeenCalledWith(
        'excludedAttributes',
        undefined
      );
    });

    it('calls onParameterChange with undefined when toggling off', () => {
      const { container, onParameterChange } = render({
        includedAttributes: ['brand'],
      });
      const switchEl = getSwitch(container, 'Included attributes');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith(
        'includedAttributes',
        undefined
      );
    });

    it('renders existing items when enabled', () => {
      const { container } = render({
        includedAttributes: ['brand', 'color'],
      });
      const inputs = Array.from(container.querySelectorAll('input')).filter(
        (input) => {
          return input.value === 'brand' || input.value === 'color';
        }
      );
      expect(inputs).toHaveLength(2);
    });

    it('calls onParameterChange with updated array when editing an item', () => {
      const { container, onParameterChange } = render({
        includedAttributes: ['brand'],
      });
      const inputs = Array.from(container.querySelectorAll('input'));
      const brandInput = inputs.find((input) => {
        return input.value === 'brand';
      })!;
      fireInput(brandInput, 'category');

      expect(onParameterChange).toHaveBeenCalledWith('includedAttributes', [
        'category',
      ]);
    });

    it('calls onParameterChange with a new item when clicking Add', () => {
      const { container, onParameterChange } = render({
        includedAttributes: ['brand'],
      });
      const addButtons = Array.from(
        container.querySelectorAll('button')
      ).filter((btn) => {
        return btn.textContent?.trim() === 'Add';
      });
      addButtons[0]!.click();

      expect(onParameterChange).toHaveBeenCalledWith('includedAttributes', [
        'brand',
        '',
      ]);
    });

    it('calls onParameterChange without the item when clicking Remove', () => {
      const { container, onParameterChange } = render({
        includedAttributes: ['brand', 'color'],
      });
      const removeButtons = Array.from(
        container.querySelectorAll('button[aria-label="Remove item"]')
      );
      removeButtons[0]!.click();

      expect(onParameterChange).toHaveBeenCalledWith('includedAttributes', [
        'color',
      ]);
    });
  });

  describe('excludedAttributes', () => {
    it('renders a toggle switch off by default', () => {
      const { container } = render();
      const switchEl = getSwitch(container, 'Excluded attributes');
      expect(switchEl.getAttribute('aria-checked')).toBe('false');
    });

    it('clears includedAttributes when toggling on', () => {
      const { container, onParameterChange } = render({
        includedAttributes: ['brand'],
      });
      const switchEl = getSwitch(container, 'Excluded attributes');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('excludedAttributes', []);
      expect(onParameterChange).toHaveBeenCalledWith(
        'includedAttributes',
        undefined
      );
    });

    it('calls onParameterChange with undefined when toggling off', () => {
      const { container, onParameterChange } = render({
        excludedAttributes: ['query'],
      });
      const switchEl = getSwitch(container, 'Excluded attributes');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith(
        'excludedAttributes',
        undefined
      );
    });

    it('calls onParameterChange with updated array when editing an item', () => {
      const { container, onParameterChange } = render({
        excludedAttributes: ['query'],
      });
      const inputs = Array.from(container.querySelectorAll('input'));
      const queryInput = inputs.find((input) => {
        return input.value === 'query';
      })!;
      fireInput(queryInput, 'price');

      expect(onParameterChange).toHaveBeenCalledWith('excludedAttributes', [
        'price',
      ]);
    });
  });

  describe('cssClasses', () => {
    it('renders a toggle for CSS classes', () => {
      const { container } = render();
      const switchEl = getSwitch(container, 'CSS classes');
      expect(switchEl).not.toBeNull();
    });

    it('calls onParameterChange with default value when toggling on', () => {
      const { container, onParameterChange } = render();
      const switchEl = getSwitch(container, 'CSS classes');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('cssClasses', {
        root: '',
        button: '',
        disabledButton: '',
      });
    });

    it('calls onParameterChange with undefined when toggling off', () => {
      const { container, onParameterChange } = render({
        cssClasses: { root: 'my-root', button: '', disabledButton: '' },
      });
      const switchEl = getSwitch(container, 'CSS classes');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('cssClasses', undefined);
    });
  });
});
