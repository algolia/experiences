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
  return renderEditor(params, 'ais.rangeInput');
}

describe('ais.rangeInput fields', () => {
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

  describe('min', () => {
    it('renders with placeholder when absent', () => {
      const { container } = render();
      const input = getInput(container, 'Min');
      expect(input.value).toBe('');
      expect(input.placeholder).toBe('Auto');
    });

    it('calls onParameterChange with number when set', () => {
      const { container, onParameterChange } = render();
      const input = getInput(container, 'Min');
      fireInput(input, '10');

      expect(onParameterChange).toHaveBeenCalledWith('min', 10);
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({ min: 10 });
      const input = getInput(container, 'Min');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('min', undefined);
    });
  });

  describe('max', () => {
    it('renders with placeholder when absent', () => {
      const { container } = render();
      const input = getInput(container, 'Max');
      expect(input.value).toBe('');
      expect(input.placeholder).toBe('Auto');
    });

    it('calls onParameterChange with number when set', () => {
      const { container, onParameterChange } = render();
      const input = getInput(container, 'Max');
      fireInput(input, '100');

      expect(onParameterChange).toHaveBeenCalledWith('max', 100);
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({ max: 100 });
      const input = getInput(container, 'Max');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('max', undefined);
    });
  });

  describe('precision', () => {
    it('renders with placeholder when absent', () => {
      const { container } = render();
      const input = getInput(container, 'Precision');
      expect(input.value).toBe('');
      expect(input.placeholder).toBe('0');
    });

    it('calls onParameterChange with number when set', () => {
      const { container, onParameterChange } = render();
      const input = getInput(container, 'Precision');
      fireInput(input, '2');

      expect(onParameterChange).toHaveBeenCalledWith('precision', 2);
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({ precision: 2 });
      const input = getInput(container, 'Precision');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('precision', undefined);
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
        noRefinement: '',
        form: '',
        label: '',
        input: '',
        inputMin: '',
        separator: '',
        inputMax: '',
        submit: '',
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
