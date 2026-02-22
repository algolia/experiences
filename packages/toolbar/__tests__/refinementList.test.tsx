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
  return renderEditor(params, 'ais.refinementList');
}

describe('ais.refinementList fields', () => {
  describe('attribute', () => {
    it('renders an empty text input by default', () => {
      const { container } = render({ attribute: '' });
      const input = getInput(container, 'Attribute');
      expect(input.value).toBe('');
    });

    it('calls onParameterChange when editing', () => {
      const { container, onParameterChange } = render({ attribute: '' });
      const input = getInput(container, 'Attribute');
      fireInput(input, 'brand');

      expect(onParameterChange).toHaveBeenCalledWith('attribute', 'brand');
    });
  });

  describe('operator', () => {
    it('renders with placeholder when absent', () => {
      const { container } = render();
      const input = getInput(container, 'Operator');
      expect(input.value).toBe('');
      expect(input.placeholder).toBe('and');
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({ operator: 'or' });
      const input = getInput(container, 'Operator');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('operator', undefined);
    });
  });

  describe('limit', () => {
    it('renders with placeholder when absent', () => {
      const { container } = render();
      const input = getInput(container, 'Limit');
      expect(input.value).toBe('');
      expect(input.placeholder).toBe('10');
    });

    it('calls onParameterChange with number when set', () => {
      const { container, onParameterChange } = render();
      const input = getInput(container, 'Limit');
      fireInput(input, '5');

      expect(onParameterChange).toHaveBeenCalledWith('limit', 5);
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({ limit: 5 });
      const input = getInput(container, 'Limit');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('limit', undefined);
    });
  });

  describe('showMore', () => {
    it('renders a switch off by default', () => {
      const { container } = render();
      const switchEl = getSwitch(container, 'Show more');
      expect(switchEl.getAttribute('aria-checked')).toBe('false');
    });

    it('calls onParameterChange when toggled on', () => {
      const { container, onParameterChange } = render();
      const switchEl = getSwitch(container, 'Show more');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('showMore', true);
    });
  });

  describe('showMoreLimit', () => {
    it('renders with placeholder when absent', () => {
      const { container } = render();
      const input = getInput(container, 'Show more limit');
      expect(input.placeholder).toBe('20');
    });

    it('calls onParameterChange with number when set', () => {
      const { container, onParameterChange } = render();
      const input = getInput(container, 'Show more limit');
      fireInput(input, '50');

      expect(onParameterChange).toHaveBeenCalledWith('showMoreLimit', 50);
    });
  });

  describe('searchable', () => {
    it('renders a switch off by default', () => {
      const { container } = render();
      const switchEl = getSwitch(container, 'Searchable');
      expect(switchEl.getAttribute('aria-checked')).toBe('false');
    });

    it('calls onParameterChange when toggled on', () => {
      const { container, onParameterChange } = render();
      const switchEl = getSwitch(container, 'Searchable');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('searchable', true);
    });
  });

  describe('searchablePlaceholder', () => {
    it('renders with placeholder when absent', () => {
      const { container } = render();
      const input = getInput(container, 'Search placeholder');
      expect(input.placeholder).toBe('Search...');
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({
        searchablePlaceholder: 'Find...',
      });
      const input = getInput(container, 'Search placeholder');
      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith(
        'searchablePlaceholder',
        undefined
      );
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
        label: '',
        checkbox: '',
        labelText: '',
        showMore: '',
        disabledShowMore: '',
        count: '',
        searchBox: '',
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
