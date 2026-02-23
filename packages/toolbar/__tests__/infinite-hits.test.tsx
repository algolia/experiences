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
  return renderEditor(params, 'ais.infiniteHits');
}

describe('ais.infiniteHits field behavior', () => {
  describe('switch fields (escapeHTML, showPrevious)', () => {
    it('sends false when escapeHTML is toggled off', () => {
      const { onParameterChange, container } = render({
        escapeHTML: true,
      });
      const toggle = getSwitch(container, 'Escape HTML');

      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('escapeHTML', false);
    });

    it('sends true when showPrevious is toggled on', () => {
      const { onParameterChange, container } = render({
        showPrevious: false,
      });
      const toggle = getSwitch(container, 'Show previous');

      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('showPrevious', true);
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
        expect.objectContaining({ root: '', list: '', item: '' })
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
