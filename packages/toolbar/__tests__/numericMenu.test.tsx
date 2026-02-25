import { afterEach, describe, expect, it } from 'vitest';

import { fireInput, getSwitch, renderEditor } from './widget-test-utils';

function render(params: Record<string, unknown> = {}) {
  return renderEditor({ items: [], ...params }, 'ais.numericMenu');
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

function getItemInputs(container: HTMLElement): Array<{
  label: HTMLInputElement;
  start: HTMLInputElement;
  end: HTMLInputElement;
}> {
  const labels = Array.from(container.querySelectorAll('label'));
  const rangesLabel = labels.find((el) => {
    return el.textContent?.trim() === 'Ranges';
  });

  if (!rangesLabel) {
    return [];
  }

  const section = rangesLabel.closest('.space-y-1\\.5');

  if (!section) {
    return [];
  }

  const inputs = Array.from(section.querySelectorAll('input'));
  const triples: Array<{
    label: HTMLInputElement;
    start: HTMLInputElement;
    end: HTMLInputElement;
  }> = [];

  for (let idx = 0; idx < inputs.length; idx += 3) {
    triples.push({
      label: inputs[idx]!,
      start: inputs[idx + 1]!,
      end: inputs[idx + 2]!,
    });
  }

  return triples;
}

function getInput(container: HTMLElement, label: string): HTMLInputElement {
  const labels = Array.from(container.querySelectorAll('label'));
  const target = labels.find((el) => {
    return el.textContent?.trim() === label;
  });

  if (!target) {
    throw new Error(`No label found with text "${label}"`);
  }

  const id = target.getAttribute('for');
  const input = container.querySelector(`#${id}`);

  if (!input) {
    throw new Error(`No input found for label "${label}" (for="${id}")`);
  }

  return input as HTMLInputElement;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ais.numericMenu', () => {
  describe('attribute', () => {
    it('renders an empty text input by default', () => {
      const { container } = render({ attribute: '' });
      const input = getInput(container, 'Attribute');
      expect(input.value).toBe('');
    });

    it('calls onParameterChange when editing', () => {
      const { container, onParameterChange } = render({ attribute: '' });
      const input = getInput(container, 'Attribute');
      fireInput(input, 'price');

      expect(onParameterChange).toHaveBeenCalledWith('attribute', 'price');
    });
  });

  describe('items', () => {
    it('renders empty state with add button', () => {
      const { container } = render({ items: [] });
      const addButton = getAddButton(container);

      expect(addButton).not.toBeNull();
      expect(getItemInputs(container)).toHaveLength(0);
    });

    it('adds an empty item', () => {
      const { container, onParameterChange } = render({ items: [] });

      getAddButton(container).click();

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { label: '', start: '', end: '' },
      ]);
    });

    it('renders existing items', () => {
      const { container } = render({
        items: [
          { label: 'All', start: '', end: '' },
          { label: 'Under $50', start: '', end: '50' },
          { label: '$50 and above', start: '50', end: '' },
        ],
      });

      const triples = getItemInputs(container);
      expect(triples).toHaveLength(3);
      expect(triples[0]!.label.value).toBe('All');
      expect(triples[0]!.start.value).toBe('');
      expect(triples[0]!.end.value).toBe('');
      expect(triples[1]!.label.value).toBe('Under $50');
      expect(triples[1]!.start.value).toBe('');
      expect(triples[1]!.end.value).toBe('50');
      expect(triples[2]!.label.value).toBe('$50 and above');
      expect(triples[2]!.start.value).toBe('50');
      expect(triples[2]!.end.value).toBe('');
    });

    it('updates the label field of an item', () => {
      const { container, onParameterChange } = render({
        items: [{ label: '', start: '', end: '' }],
      });

      const triples = getItemInputs(container);
      fireInput(triples[0]!.label, 'All');

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { label: 'All', start: '', end: '' },
      ]);
    });

    it('updates the start field of an item', () => {
      const { container, onParameterChange } = render({
        items: [{ label: 'Range', start: '', end: '' }],
      });

      const triples = getItemInputs(container);
      fireInput(triples[0]!.start, '10');

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { label: 'Range', start: '10', end: '' },
      ]);
    });

    it('updates the end field of an item', () => {
      const { container, onParameterChange } = render({
        items: [{ label: 'Range', start: '', end: '' }],
      });

      const triples = getItemInputs(container);
      fireInput(triples[0]!.end, '100');

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { label: 'Range', start: '', end: '100' },
      ]);
    });

    it('removes an item when clicking remove', () => {
      const { container, onParameterChange } = render({
        items: [
          { label: 'All', start: '', end: '' },
          { label: 'Under $50', start: '', end: '50' },
        ],
      });

      const removeButtons = getRemoveButtons(container);
      expect(removeButtons).toHaveLength(2);

      removeButtons[0]!.click();

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { label: 'Under $50', start: '', end: '50' },
      ]);
    });

    it('adds a new item after existing ones', () => {
      const { container, onParameterChange } = render({
        items: [{ label: 'All', start: '', end: '' }],
      });

      getAddButton(container).click();

      expect(onParameterChange).toHaveBeenCalledWith('items', [
        { label: 'All', start: '', end: '' },
        { label: '', start: '', end: '' },
      ]);
    });
  });

  describe('cssClasses', () => {
    it('toggles cssClasses on with default value', () => {
      const { container, onParameterChange } = render({
        cssClasses: undefined,
      });

      const toggle = getSwitch(container, 'CSS classes');
      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('cssClasses', {
        root: '',
        noRefinementRoot: '',
        list: '',
        item: '',
        selectedItem: '',
        label: '',
        labelText: '',
        radio: '',
      });
    });

    it('toggles cssClasses off', () => {
      const { container, onParameterChange } = render({
        cssClasses: { root: 'my-root' },
      });

      const toggle = getSwitch(container, 'CSS classes');
      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('cssClasses', undefined);
    });
  });
});
