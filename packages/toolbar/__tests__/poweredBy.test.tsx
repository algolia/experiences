import { afterEach, describe, expect, it } from 'vitest';

import { getSwitch, renderEditor } from './widget-test-utils';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('poweredBy', () => {
  describe('theme', () => {
    it('renders the select with light active by default', () => {
      const { container } = renderEditor({}, 'ais.poweredBy');
      const tabs = container.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBe(2);

      const light = Array.from(tabs).find((tab) => {
        return tab.textContent?.trim() === 'Light';
      });
      const dark = Array.from(tabs).find((tab) => {
        return tab.textContent?.trim() === 'Dark';
      });

      expect(light?.getAttribute('aria-selected')).toBe('true');
      expect(dark?.getAttribute('aria-selected')).toBe('false');
    });

    it('sends undefined when selecting the default value', () => {
      const { container, onParameterChange } = renderEditor(
        { theme: 'dark' },
        'ais.poweredBy'
      );
      const tabs = container.querySelectorAll('[role="tab"]');
      const light = Array.from(tabs).find((tab) => {
        return tab.textContent?.trim() === 'Light';
      }) as HTMLButtonElement;

      light.click();

      expect(onParameterChange).toHaveBeenCalledWith('theme', undefined);
    });

    it('sends the value when selecting a non-default option', () => {
      const { container, onParameterChange } = renderEditor(
        {},
        'ais.poweredBy'
      );
      const tabs = container.querySelectorAll('[role="tab"]');
      const dark = Array.from(tabs).find((tab) => {
        return tab.textContent?.trim() === 'Dark';
      }) as HTMLButtonElement;

      dark.click();

      expect(onParameterChange).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  describe('cssClasses', () => {
    it('renders cssClasses toggle off by default', () => {
      const { container } = renderEditor({}, 'ais.poweredBy');
      const toggle = getSwitch(container, 'CSS classes');
      expect(toggle.getAttribute('aria-checked')).toBe('false');
    });

    it('sends default value when toggling on', () => {
      const { container, onParameterChange } = renderEditor(
        {},
        'ais.poweredBy'
      );
      const toggle = getSwitch(container, 'CSS classes');
      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('cssClasses', {
        root: '',
        link: '',
        logo: '',
      });
    });

    it('sends false when toggling off', () => {
      const { container, onParameterChange } = renderEditor(
        { cssClasses: { root: 'my-class', link: '', logo: '' } },
        'ais.poweredBy'
      );
      const toggle = getSwitch(container, 'CSS classes');
      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('cssClasses', false);
    });
  });
});
