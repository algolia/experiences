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
    it('selects the default option when absent', () => {
      const { container } = render();
      const selected = container.querySelector(
        '[data-slot="tabs-trigger"][aria-selected="true"]'
      );
      expect(selected?.textContent).toBe('or');
    });

    it('calls onParameterChange with "and" when selecting "and"', () => {
      const { container, onParameterChange } = render();
      const triggers = Array.from(
        container.querySelectorAll<HTMLButtonElement>(
          '[data-slot="tabs-trigger"]'
        )
      );
      const andTrigger = triggers.find((el) => {
        return el.textContent === 'and';
      })!;
      andTrigger.click();

      expect(onParameterChange).toHaveBeenCalledWith('operator', 'and');
    });

    it('calls onParameterChange with undefined when selecting the default', () => {
      const { container, onParameterChange } = render({ operator: 'and' });
      const triggers = Array.from(
        container.querySelectorAll<HTMLButtonElement>(
          '[data-slot="tabs-trigger"]'
        )
      );
      const orTrigger = triggers.find((el) => {
        return el.textContent === 'or';
      })!;
      orTrigger.click();

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

    it('clears showMoreLimit when toggled off', () => {
      const { container, onParameterChange } = render({
        showMore: true,
        showMoreLimit: 50,
      });
      const switchEl = getSwitch(container, 'Show more');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('showMore', false);
      expect(onParameterChange).toHaveBeenCalledWith(
        'showMoreLimit',
        undefined
      );
    });
  });

  describe('showMoreLimit', () => {
    it('is hidden when showMore is false', () => {
      const { container } = render();
      const labels = Array.from(container.querySelectorAll('label'));
      const label = labels.find((el) => {
        return el.textContent?.trim() === 'Show more limit';
      });
      expect(label).toBeUndefined();
    });

    it('renders with placeholder when showMore is true', () => {
      const { container } = render({ showMore: true });
      const input = getInput(container, 'Show more limit');
      expect(input.placeholder).toBe('20');
    });

    it('calls onParameterChange with number when set', () => {
      const { container, onParameterChange } = render({ showMore: true });
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

    it('clears dependent params when toggled off', () => {
      const { container, onParameterChange } = render({
        searchable: true,
        searchablePlaceholder: 'Find...',
        searchableIsAlwaysActive: true,
        searchableEscapeFacetValues: true,
      });
      const switchEl = getSwitch(container, 'Searchable');
      switchEl.click();

      expect(onParameterChange).toHaveBeenCalledWith('searchable', false);
      expect(onParameterChange).toHaveBeenCalledWith(
        'searchablePlaceholder',
        undefined
      );
      expect(onParameterChange).toHaveBeenCalledWith(
        'searchableIsAlwaysActive',
        undefined
      );
      expect(onParameterChange).toHaveBeenCalledWith(
        'searchableEscapeFacetValues',
        undefined
      );
      expect(onParameterChange).toHaveBeenCalledWith(
        'searchableSelectOnSubmit',
        undefined
      );
    });
  });

  describe('searchablePlaceholder', () => {
    it('is hidden when searchable is false', () => {
      const { container } = render();
      const labels = Array.from(container.querySelectorAll('label'));
      const label = labels.find((el) => {
        return el.textContent?.trim() === 'Search placeholder';
      });
      expect(label).toBeUndefined();
    });

    it('renders with placeholder when searchable is true', () => {
      const { container } = render({ searchable: true });
      const input = getInput(container, 'Search placeholder');
      expect(input.placeholder).toBe('Search...');
    });

    it('calls onParameterChange with undefined when cleared', () => {
      const { container, onParameterChange } = render({
        searchable: true,
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

  describe('searchableIsAlwaysActive', () => {
    it('is hidden when searchable is false', () => {
      const { container } = render();
      const labels = Array.from(container.querySelectorAll('label'));
      const label = labels.find((el) => {
        return el.textContent?.trim() === 'Search always active';
      });
      expect(label).toBeUndefined();
    });

    it('renders a switch on when the parameter is true', () => {
      const { container } = render({
        searchable: true,
        searchableIsAlwaysActive: true,
      });
      const switchEl = getSwitch(container, 'Search always active');
      expect(switchEl.getAttribute('aria-checked')).toBe('true');
    });
  });

  describe('searchableEscapeFacetValues', () => {
    it('is hidden when searchable is false', () => {
      const { container } = render();
      const labels = Array.from(container.querySelectorAll('label'));
      const label = labels.find((el) => {
        return el.textContent?.trim() === 'Escape search facet values';
      });
      expect(label).toBeUndefined();
    });

    it('renders a switch on when the parameter is true', () => {
      const { container } = render({
        searchable: true,
        searchableEscapeFacetValues: true,
      });
      const switchEl = getSwitch(container, 'Escape search facet values');
      expect(switchEl.getAttribute('aria-checked')).toBe('true');
    });
  });

  describe('searchableSelectOnSubmit', () => {
    it('is hidden when searchable is false', () => {
      const { container } = render();
      const labels = Array.from(container.querySelectorAll('label'));
      const label = labels.find((el) => {
        return el.textContent?.trim() === 'Select on submit';
      });
      expect(label).toBeUndefined();
    });

    it('renders a switch when searchable is true', () => {
      const { container } = render({ searchable: true });
      const switchEl = getSwitch(container, 'Select on submit');
      expect(switchEl).not.toBeNull();
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
