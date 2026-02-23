import { afterEach, describe, expect, it } from 'vitest';

import { fireInput, getSwitch, renderEditor } from './widget-test-utils';

function render(params: Record<string, unknown> = {}) {
  return renderEditor({ items: [], ...params }, 'ais.sortBy');
}

function getAddButton(container: HTMLElement): HTMLButtonElement {
  const buttons = Array.from(container.querySelectorAll('button'));
  const button = buttons.find((btn) => {
    return btn.textContent?.trim() === 'Add item';
  });

  if (!button) {
    throw new Error('No "Add item" button found');
  }

  return button;
}

function getRemoveButtons(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(
    container.querySelectorAll('button[aria-label="Remove item"]')
  );
}

function getItemInputs(
  container: HTMLElement
): Array<{ value: HTMLInputElement; label: HTMLInputElement }> {
  const labels = Array.from(container.querySelectorAll('label'));
  const sortOptionsLabel = labels.find((el) => {
    return el.textContent?.trim() === 'Sort options';
  });

  if (!sortOptionsLabel) {
    return [];
  }

  const section = sortOptionsLabel.closest('.space-y-2');

  if (!section) {
    return [];
  }

  const inputs = Array.from(section.querySelectorAll('input'));
  const pairs: Array<{ value: HTMLInputElement; label: HTMLInputElement }> = [];

  for (let idx = 0; idx < inputs.length; idx += 2) {
    pairs.push({ value: inputs[idx]!, label: inputs[idx + 1]! });
  }

  return pairs;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ais.sortBy', () => {
  describe('items', () => {
    it('renders empty state with add button', () => {
      const { container } = render();
      const addButton = getAddButton(container);

      expect(addButton).not.toBeNull();
      expect(getItemInputs(container)).toHaveLength(0);
    });

    it('adds an empty item when clicking add', () => {
      const { container, onParameterChange } = render();

      getAddButton(container).click();

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { value: '', label: '' },
      ]);
    });

    it('renders existing items', () => {
      const { container } = render({
        items: [
          { value: 'products', label: 'Featured' },
          { value: 'products_price_asc', label: 'Price (asc)' },
        ],
      });

      const pairs = getItemInputs(container);
      expect(pairs).toHaveLength(2);
      expect(pairs[0]!.value.value).toBe('products');
      expect(pairs[0]!.label.value).toBe('Featured');
      expect(pairs[1]!.value.value).toBe('products_price_asc');
      expect(pairs[1]!.label.value).toBe('Price (asc)');
    });

    it('updates the value field of an item', () => {
      const { container, onParameterChange } = render({
        items: [{ value: '', label: '' }],
      });

      const pairs = getItemInputs(container);
      fireInput(pairs[0]!.value, 'products_price_desc');

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { value: 'products_price_desc', label: '' },
      ]);
    });

    it('updates the label field of an item', () => {
      const { container, onParameterChange } = render({
        items: [{ value: 'products', label: '' }],
      });

      const pairs = getItemInputs(container);
      fireInput(pairs[0]!.label, 'Featured');

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { value: 'products', label: 'Featured' },
      ]);
    });

    it('removes an item when clicking remove', () => {
      const { container, onParameterChange } = render({
        items: [
          { value: 'products', label: 'Featured' },
          { value: 'products_price_asc', label: 'Price (asc)' },
        ],
      });

      const removeButtons = getRemoveButtons(container);
      expect(removeButtons).toHaveLength(2);

      removeButtons[0]!.click();

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { value: 'products_price_asc', label: 'Price (asc)' },
      ]);
    });

    it('adds a new item after existing ones', () => {
      const { container, onParameterChange } = render({
        items: [{ value: 'products', label: 'Featured' }],
      });

      getAddButton(container).click();

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { value: 'products', label: 'Featured' },
        { value: '', label: '' },
      ]);
    });
  });

  describe('cssClasses', () => {
    it('toggles cssClasses on with default value', () => {
      const { container, onParameterChange } = render({
        cssClasses: false,
      });

      const toggle = getSwitch(container, 'CSS classes');
      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('cssClasses', {
        root: '',
        select: '',
        option: '',
      });
    });

    it('toggles cssClasses off', () => {
      const { container, onParameterChange } = render({
        cssClasses: { root: 'my-root', select: '', option: '' },
      });

      const toggle = getSwitch(container, 'CSS classes');
      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('cssClasses', false);
    });
  });
});
