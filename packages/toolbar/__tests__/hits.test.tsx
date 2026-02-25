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
  return renderEditor(params, 'ais.hits');
}

describe('ais.hits field behavior', () => {
  describe('switch field (escapeHTML)', () => {
    it('sends false when toggled off', () => {
      const { onParameterChange, container } = render({
        escapeHTML: true,
      });
      const toggle = getSwitch(container, 'Escape HTML');

      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('escapeHTML', false);
    });

    it('sends true when toggled on', () => {
      const { onParameterChange, container } = render({
        escapeHTML: false,
      });
      const toggle = getSwitch(container, 'Escape HTML');

      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('escapeHTML', true);
    });
  });

  describe('object field (template)', () => {
    it('renders the toggle when template is present', () => {
      const { container } = render({
        template: {
          name: '',
          brand: '',
          description: '',
          image: '',
          price: '',
        },
      });
      const toggle = getSwitch(container, 'Template');

      expect(toggle).not.toBeNull();
    });

    it('sends undefined when toggled off', () => {
      const { onParameterChange, container } = render({
        template: {
          name: 'title',
          brand: '',
          description: '',
          image: '',
          price: '',
        },
      });
      const toggle = getSwitch(container, 'Template');

      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith('template', undefined);
    });

    it('sends the default object merged with existing values when toggled on', () => {
      const { onParameterChange, container } = render();
      const toggle = getSwitch(container, 'Template');

      toggle.click();

      expect(onParameterChange).toHaveBeenCalledWith(
        'template',
        expect.objectContaining({
          name: '',
          brand: '',
          description: '',
          image: '',
          price: '',
        })
      );
    });

    it('sends the updated object when a sub-field changes', () => {
      const { onParameterChange, container } = render({
        template: {
          name: '',
          brand: '',
          description: '',
          image: '',
          price: '',
        },
      });
      const input = getInput(container, 'Name');

      fireInput(input, 'product_name');

      expect(onParameterChange).toHaveBeenCalledWith(
        'template',
        expect.objectContaining({ name: 'product_name' })
      );
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
