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
  return renderEditor(params, 'ais.stats');
}

describe('ais.stats field behavior', () => {
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
        expect.objectContaining({ root: '', text: '' })
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
        cssClasses: { root: '', text: '' },
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
