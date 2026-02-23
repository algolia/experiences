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

describe('toggleRefinement', () => {
  describe('attribute', () => {
    it('renders the attribute text field', () => {
      const { container } = renderEditor(
        { attribute: '' },
        'ais.toggleRefinement'
      );
      const input = getInput(container, 'Attribute');
      expect(input.value).toBe('');
    });

    it('sends the value on input', () => {
      const { container, onParameterChange } = renderEditor(
        { attribute: '' },
        'ais.toggleRefinement'
      );
      const input = getInput(container, 'Attribute');
      fireInput(input, 'free_shipping');

      expect(onParameterChange).toHaveBeenCalledWith(
        'attribute',
        'free_shipping'
      );
    });
  });

  describe('on', () => {
    it('renders empty by default with placeholder', () => {
      const { container } = renderEditor({}, 'ais.toggleRefinement');
      const input = getInput(container, 'On Value');
      expect(input.value).toBe('');
      expect(input.placeholder).toBe('true');
    });

    it('sends a string value as-is', () => {
      const { container, onParameterChange } = renderEditor(
        {},
        'ais.toggleRefinement'
      );
      const input = getInput(container, 'On Value');
      fireInput(input, 'Apple');

      expect(onParameterChange).toHaveBeenCalledWith('on', 'Apple');
    });

    it('coerces "true" to boolean true', () => {
      const { container, onParameterChange } = renderEditor(
        {},
        'ais.toggleRefinement'
      );
      const input = getInput(container, 'On Value');
      fireInput(input, 'true');

      expect(onParameterChange).toHaveBeenCalledWith('on', true);
    });

    it('coerces "false" to boolean false', () => {
      const { container, onParameterChange } = renderEditor(
        {},
        'ais.toggleRefinement'
      );
      const input = getInput(container, 'On Value');
      fireInput(input, 'false');

      expect(onParameterChange).toHaveBeenCalledWith('on', false);
    });

    it('trims whitespace before coercing', () => {
      const { container, onParameterChange } = renderEditor(
        {},
        'ais.toggleRefinement'
      );
      const input = getInput(container, 'On Value');
      fireInput(input, ' Apple ');

      expect(onParameterChange).toHaveBeenCalledWith('on', 'Apple');
    });

    it('coerces numeric strings to numbers', () => {
      const { container, onParameterChange } = renderEditor(
        {},
        'ais.toggleRefinement'
      );
      const input = getInput(container, 'On Value');
      fireInput(input, '5');

      expect(onParameterChange).toHaveBeenCalledWith('on', 5);
    });

    it('sends undefined when cleared', () => {
      const { container, onParameterChange } = renderEditor(
        // oxlint-disable-next-line id-length
        { on: 'yes' },
        'ais.toggleRefinement'
      );
      const input = getInput(container, 'On Value');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('on', undefined);
    });

    it('displays a boolean value from the API', () => {
      const { container } = renderEditor(
        // oxlint-disable-next-line id-length
        { on: true },
        'ais.toggleRefinement'
      );
      const input = getInput(container, 'On Value');
      expect(input.value).toBe('true');
    });

    it('displays a numeric value from the API', () => {
      const { container } = renderEditor(
        // oxlint-disable-next-line id-length
        { on: 5 },
        'ais.toggleRefinement'
      );
      const input = getInput(container, 'On Value');
      expect(input.value).toBe('5');
    });
  });

  describe('off', () => {
    it('renders empty by default', () => {
      const { container } = renderEditor({}, 'ais.toggleRefinement');
      const input = getInput(container, 'Off Value');
      expect(input.value).toBe('');
    });

    it('sends the value on input', () => {
      const { container, onParameterChange } = renderEditor(
        {},
        'ais.toggleRefinement'
      );
      const input = getInput(container, 'Off Value');
      fireInput(input, 'no');

      expect(onParameterChange).toHaveBeenCalledWith('off', 'no');
    });

    it('sends undefined when cleared', () => {
      const { container, onParameterChange } = renderEditor(
        { off: 'no' },
        'ais.toggleRefinement'
      );
      const input = getInput(container, 'Off Value');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('off', undefined);
    });
  });

  describe('cssClasses', () => {
    it('renders cssClasses toggle off by default', () => {
      const { container } = renderEditor({}, 'ais.toggleRefinement');
      const toggle = getSwitch(container, 'CSS classes');
      expect(toggle.getAttribute('aria-checked')).toBe('false');
    });

    it('sends default value when toggling on', () => {
      const { container, onParameterChange } = renderEditor(
        {},
        'ais.toggleRefinement'
      );
      const toggle = getSwitch(container, 'CSS classes');
      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('cssClasses', {
        root: '',
        label: '',
        checkbox: '',
        labelText: '',
      });
    });

    it('sends false when toggling off', () => {
      const { container, onParameterChange } = renderEditor(
        {
          cssClasses: {
            root: 'my-class',
            label: '',
            checkbox: '',
            labelText: '',
          },
        },
        'ais.toggleRefinement'
      );
      const toggle = getSwitch(container, 'CSS classes');
      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('cssClasses', false);
    });
  });
});
