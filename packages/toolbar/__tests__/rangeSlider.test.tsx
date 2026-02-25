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
  return renderEditor(params, 'ais.rangeSlider');
}

describe('ais.rangeSlider fields', () => {
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
      fireInput(input, '0');

      expect(onParameterChange).toHaveBeenCalledWith('min', 0);
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({ min: 0 });
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
      fireInput(input, '1000');

      expect(onParameterChange).toHaveBeenCalledWith('max', 1000);
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({ max: 1000 });
      const input = getInput(container, 'Max');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('max', undefined);
    });
  });

  describe('step', () => {
    it('renders with placeholder when absent', () => {
      const { container } = render();
      const input = getInput(container, 'Step');
      expect(input.value).toBe('');
      expect(input.placeholder).toBe('1');
    });

    it('calls onParameterChange with number when set', () => {
      const { container, onParameterChange } = render();
      const input = getInput(container, 'Step');
      fireInput(input, '5');

      expect(onParameterChange).toHaveBeenCalledWith('step', 5);
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({ step: 5 });
      const input = getInput(container, 'Step');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('step', undefined);
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

  describe('pips', () => {
    it('renders as checked by default', () => {
      const { container } = render({ pips: true });
      const switchEl = getSwitch(container, 'Show pips');
      expect(switchEl.getAttribute('aria-checked')).toBe('true');
    });

    it('calls onParameterChange when toggling off', () => {
      const { container, onParameterChange } = render({ pips: true });
      const switchEl = getSwitch(container, 'Show pips');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('pips', false);
    });
  });

  describe('tooltips', () => {
    it('renders as checked by default', () => {
      const { container } = render({ tooltips: true });
      const switchEl = getSwitch(container, 'Show tooltips');
      expect(switchEl.getAttribute('aria-checked')).toBe('true');
    });

    it('calls onParameterChange when toggling off', () => {
      const { container, onParameterChange } = render({ tooltips: true });
      const switchEl = getSwitch(container, 'Show tooltips');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('tooltips', false);
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
        disabledRoot: '',
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
