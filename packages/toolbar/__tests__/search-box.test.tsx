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
  return renderEditor(params, 'ais.searchBox');
}

describe('ais.searchBox field behavior', () => {
  describe('text field (placeholder)', () => {
    it('sends undefined when the field is empty', () => {
      const { onParameterChange, container } = render();
      const input = getInput(container, 'Placeholder');

      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('placeholder', undefined);
    });

    it('sends a string when a value is entered', () => {
      const { onParameterChange, container } = render();
      const input = getInput(container, 'Placeholder');

      fireInput(input, 'Search products...');

      expect(onParameterChange).toHaveBeenCalledWith(
        'placeholder',
        'Search products...'
      );
    });

    it('sends undefined when cleared after having a value', () => {
      const { onParameterChange, container } = render({
        placeholder: 'Search...',
      });
      const input = getInput(container, 'Placeholder');

      expect(input.value).toBe('Search...');

      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('placeholder', undefined);
    });

    it('renders even when the parameter is absent from the API response', () => {
      const { container } = render({ autofocus: false });
      const input = getInput(container, 'Placeholder');

      expect(input).not.toBeNull();
      expect(input.value).toBe('');
    });
  });

  describe('switch fields (autofocus, searchAsYouType, etc.)', () => {
    it('sends false when toggled off', () => {
      const { onParameterChange, container } = render({
        searchAsYouType: true,
      });
      const toggle = getSwitch(container, 'Search as you type');

      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('searchAsYouType', false);
    });

    it('sends true when toggled on', () => {
      const { onParameterChange, container } = render({
        autofocus: false,
      });
      const toggle = getSwitch(container, 'Autofocus');

      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('autofocus', true);
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
        expect.objectContaining({ root: '', form: '', input: '' })
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
        cssClasses: { root: '', form: '' },
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
