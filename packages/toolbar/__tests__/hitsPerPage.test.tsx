import { afterEach, describe, expect, it } from 'vitest';

import { fireInput, getSwitch, renderEditor } from './widget-test-utils';

function render(params: Record<string, unknown> = {}) {
  return renderEditor({ items: [], ...params }, 'ais.hitsPerPage');
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
  const pageSizesLabel = labels.find((el) => {
    return el.textContent?.trim() === 'Page sizes';
  });

  if (!pageSizesLabel) {
    return [];
  }

  const section = pageSizesLabel.closest('.space-y-1\\.5');

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

describe('ais.hitsPerPage', () => {
  describe('items', () => {
    it('renders with no items and shows the add button', () => {
      const { container } = render({ items: [] });
      const addButton = getAddButton(container);
      expect(addButton).not.toBeNull();
      expect(getItemInputs(container)).toHaveLength(0);
    });

    it('renders the value input as type number', () => {
      const { container } = render({
        items: [{ value: '20', label: '20 per page' }],
      });
      const pairs = getItemInputs(container);
      expect(pairs[0]!.value.type).toBe('number');
      expect(pairs[0]!.label.type).toBe('text');
    });

    it('does not lock the first item', () => {
      const { container } = render({
        items: [{ value: '20', label: '20 per page' }],
      });
      const pairs = getItemInputs(container);
      expect(pairs[0]!.value.disabled).toBe(false);
      const removeButtons = getRemoveButtons(container);
      expect(removeButtons).toHaveLength(1);
    });

    it('renders default first item', () => {
      const { container } = render({
        items: [{ value: '20', label: '20 per page' }],
      });
      const addButton = getAddButton(container);

      expect(addButton).not.toBeNull();
      expect(getItemInputs(container)).toHaveLength(1);
      expect(getItemInputs(container)[0]!.value.value).toBe('20');
      expect(getItemInputs(container)[0]!.label.value).toBe('20 per page');
    });

    it('adds an empty item after the default', () => {
      const { container, onParameterChange } = render({
        items: [{ value: '20', label: '20 per page' }],
      });

      getAddButton(container).click();

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { value: '20', label: '20 per page' },
        { value: '', label: '' },
      ]);
    });

    it('renders existing items', () => {
      const { container } = render({
        items: [
          { value: '20', label: '20 per page' },
          { value: '50', label: '50 per page' },
        ],
      });

      const pairs = getItemInputs(container);
      expect(pairs).toHaveLength(2);
      expect(pairs[0]!.value.value).toBe('20');
      expect(pairs[0]!.label.value).toBe('20 per page');
      expect(pairs[1]!.value.value).toBe('50');
      expect(pairs[1]!.label.value).toBe('50 per page');
    });

    it('updates the value field of an item', () => {
      const { container, onParameterChange } = render({
        items: [{ value: '', label: '' }],
      });

      const pairs = getItemInputs(container);
      fireInput(pairs[0]!.value, '100');

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { value: '100', label: '' },
      ]);
    });

    it('updates the label field of an item', () => {
      const { container, onParameterChange } = render({
        items: [{ value: '20', label: '' }],
      });

      const pairs = getItemInputs(container);
      fireInput(pairs[0]!.label, '20 per page');

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { value: '20', label: '20 per page' },
      ]);
    });

    it('removes an item when clicking remove', () => {
      const { container, onParameterChange } = render({
        items: [
          { value: '20', label: '20 per page' },
          { value: '50', label: '50 per page' },
        ],
      });

      const removeButtons = getRemoveButtons(container);
      expect(removeButtons).toHaveLength(2);

      removeButtons[0]!.click();

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { value: '50', label: '50 per page' },
      ]);
    });

    it('adds a new item after existing ones', () => {
      const { container, onParameterChange } = render({
        items: [{ value: '20', label: '20 per page' }],
      });

      getAddButton(container).click();

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { value: '20', label: '20 per page' },
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
