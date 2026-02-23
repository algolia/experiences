import { afterEach, describe, expect, it } from 'vitest';

import { renderEditor } from './widget-test-utils';

afterEach(() => {
  document.body.innerHTML = '';
});

function render(params: Record<string, unknown> = {}) {
  return renderEditor(params, 'ais.configure');
}

function getTextarea(
  container: HTMLElement,
  label: string
): HTMLTextAreaElement {
  const labels = Array.from(container.querySelectorAll('label'));
  const target = labels.find((el) => {
    return el.textContent?.trim() === label;
  });

  if (!target) {
    throw new Error(`No label found with text "${label}"`);
  }

  const id = target.getAttribute('for');
  const textarea = container.querySelector(`#${id}`);

  if (!textarea) {
    throw new Error(`No textarea found for label "${label}" (for="${id}")`);
  }

  return textarea as HTMLTextAreaElement;
}

function fireTextareaInput(textarea: HTMLTextAreaElement, value: string) {
  Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    'value'
  )!.set!.call(textarea, value);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('ais.configure field behavior', () => {
  describe('json field (searchParameters)', () => {
    it('renders the textarea with serialized JSON', () => {
      const { container } = render({
        searchParameters: { hitsPerPage: 20 },
      });
      const textarea = getTextarea(container, 'Search parameters');

      expect(textarea.value).toContain('"hitsPerPage": 20');
    });

    it('sends the parsed object when valid JSON is entered', () => {
      const { onParameterChange, container } = render({
        searchParameters: {},
      });
      const textarea = getTextarea(container, 'Search parameters');

      fireTextareaInput(textarea, '{"hitsPerPage": 10}');

      expect(onParameterChange).toHaveBeenCalledWith('searchParameters', {
        hitsPerPage: 10,
      });
    });

    it('does not call onChange when invalid JSON is entered', () => {
      const { onParameterChange, container } = render({
        searchParameters: {},
      });
      const textarea = getTextarea(container, 'Search parameters');

      fireTextareaInput(textarea, '{invalid}');

      expect(onParameterChange).not.toHaveBeenCalled();
    });

    it('shows an error message for invalid JSON', async () => {
      const { container } = render({ searchParameters: {} });
      const textarea = getTextarea(container, 'Search parameters');

      fireTextareaInput(textarea, '{invalid}');

      // Wait for Preact to flush the state update
      await new Promise((resolve) => {
        return setTimeout(resolve, 10);
      });

      const errorText = container.textContent ?? '';

      expect(errorText).toContain('Invalid JSON');
    });

    it('renders an empty object when searchParameters is absent', () => {
      const { container } = render();
      const textarea = getTextarea(container, 'Search parameters');

      expect(textarea.value).toBe('{}');
    });
  });
});
