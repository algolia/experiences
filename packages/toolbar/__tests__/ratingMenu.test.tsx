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
  return renderEditor(params, 'ais.ratingMenu');
}

describe('ais.ratingMenu fields', () => {
  describe('attribute', () => {
    it('renders an empty text input by default', () => {
      const { container } = render({ attribute: '' });
      const input = getInput(container, 'Attribute');
      expect(input.value).toBe('');
    });

    it('calls onParameterChange when editing', () => {
      const { container, onParameterChange } = render({ attribute: '' });
      const input = getInput(container, 'Attribute');
      fireInput(input, 'rating');

      expect(onParameterChange).toHaveBeenCalledWith('attribute', 'rating');
    });
  });

  describe('max', () => {
    it('renders with placeholder when absent', () => {
      const { container } = render();
      const input = getInput(container, 'Max rating');
      expect(input.value).toBe('');
      expect(input.placeholder).toBe('5');
    });

    it('calls onParameterChange with number when set', () => {
      const { container, onParameterChange } = render();
      const input = getInput(container, 'Max rating');
      fireInput(input, '10');

      expect(onParameterChange).toHaveBeenCalledWith('max', 10);
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({ max: 10 });
      const input = getInput(container, 'Max rating');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('max', undefined);
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
        noRefinementRoot: '',
        list: '',
        item: '',
        selectedItem: '',
        disabledItem: '',
        link: '',
        starIcon: '',
        fullStarIcon: '',
        emptyStarIcon: '',
        label: '',
        count: '',
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
