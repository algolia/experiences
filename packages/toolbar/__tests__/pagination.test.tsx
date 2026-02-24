import { afterEach, describe, expect, it } from 'vitest';

import {
  fireInput,
  getInput,
  getSwitch,
  getToggleableInput,
  renderEditor,
} from './widget-test-utils';

afterEach(() => {
  document.body.innerHTML = '';
});

function render(params: Record<string, unknown> = {}) {
  return renderEditor(params, 'ais.pagination');
}

describe('ais.pagination field behavior', () => {
  describe('number fields (totalPages, padding)', () => {
    it('sends undefined when the field is empty (unset)', () => {
      const { onParameterChange, container } = render();
      const input = getInput(container, 'Total Pages');

      expect(input).not.toBeNull();
      expect(input.type).toBe('number');
      expect(input.value).toBe('');

      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('totalPages', undefined);
    });

    it('sends a number when a value is entered', () => {
      const { onParameterChange, container } = render();
      const input = getInput(container, 'Total Pages');

      fireInput(input, '10');

      expect(onParameterChange).toHaveBeenCalledWith('totalPages', 10);
    });

    it('sends undefined when cleared after having a value', () => {
      const { onParameterChange, container } = render({
        totalPages: 10,
      });
      const input = getInput(container, 'Total Pages');

      expect(input.value).toBe('10');

      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('totalPages', undefined);
    });

    it('displays the placeholder when unset', () => {
      const { container } = render();
      const input = getInput(container, 'Padding');

      expect(input.placeholder).toBe('3');
      expect(input.value).toBe('');
    });

    it('renders even when the parameter is absent from the API response', () => {
      // Simulates a saved pagination widget where totalPages was never set
      const { container } = render({ showFirst: true });
      const input = getInput(container, 'Total Pages');

      expect(input).not.toBeNull();
    });
  });

  describe('toggleable text field with picker (scrollTo)', () => {
    it('sends false when toggled off', () => {
      const { onParameterChange, container } = render();
      const toggle = getSwitch(container, 'Scroll to');

      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('scrollTo', false);
    });

    it('sends undefined when toggled on (uses library default)', () => {
      const { onParameterChange, container } = render({
        scrollTo: false,
      });
      const toggle = getSwitch(container, 'Scroll to');

      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('scrollTo', undefined);
    });

    it('sends a string when a value is entered', () => {
      const { onParameterChange, container } = render();
      const input = getToggleableInput(container, 'Scroll to');

      fireInput(input, '#results');

      expect(onParameterChange).toHaveBeenCalledWith('scrollTo', '#results');
    });

    it('sends undefined when the text field is cleared', () => {
      const { onParameterChange, container } = render({
        scrollTo: '#results',
      });
      const input = getToggleableInput(container, 'Scroll to');

      expect(input.value).toBe('#results');

      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('scrollTo', undefined);
    });

    it('displays the placeholder when enabled with no value', () => {
      const { container } = render();
      const input = getToggleableInput(container, 'Scroll to');

      expect(input.placeholder).toBe('body');
      expect(input.value).toBe('');
    });

    it('collapses the text field when toggled off', () => {
      const { container } = render({ scrollTo: false });
      const collapsible = container.querySelector(
        '[data-slot="collapsible-content"][data-state="closed"]'
      );

      expect(collapsible).not.toBeNull();
    });

    it('renders the element picker button when enabled', () => {
      const { container } = render();
      const button = container.querySelector('button[title="Pick an element"]');

      expect(button).not.toBeNull();
    });
  });

  describe('switch fields (showFirst, showLast, etc.)', () => {
    it('sends false when toggled off', () => {
      const { onParameterChange, container } = render({
        showFirst: true,
      });
      const toggle = getSwitch(container, 'Show first page');

      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('showFirst', false);
    });

    it('sends true when toggled on', () => {
      const { onParameterChange, container } = render({
        showFirst: false,
      });
      const toggle = getSwitch(container, 'Show first page');

      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('showFirst', true);
    });
  });

  describe('object field with disabledValue undefined (cssClasses)', () => {
    it('renders the toggle even when cssClasses is absent from parameters', () => {
      const { container } = render();
      const toggle = getSwitch(container, 'CSS classes');

      expect(toggle).not.toBeNull();
    });

    it('sends the default object when toggled on', () => {
      const { onParameterChange, container } = render();
      const toggle = getSwitch(container, 'CSS classes');

      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith(
        'cssClasses',
        expect.objectContaining({ root: '', list: '', link: '' })
      );
    });

    it('sends undefined (not false) when toggled off', () => {
      const { onParameterChange, container } = render({
        cssClasses: { root: 'my-root' },
      });
      const toggle = getSwitch(container, 'CSS classes');

      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('cssClasses', undefined);
    });

    it('sends the updated object when a sub-field changes', () => {
      const { onParameterChange, container } = render({
        cssClasses: { root: '', list: '' },
      });
      const input = getInput(container, 'Root');

      fireInput(input, 'my-root');

      expect(onParameterChange).toHaveBeenCalledWith(
        'cssClasses',
        expect.objectContaining({ root: 'my-root' })
      );
    });
  });
});
