import { afterEach, describe, expect, it } from 'vitest';

import { fireInput, getInput, renderEditor } from './widget-test-utils';

afterEach(() => {
  document.body.innerHTML = '';
});

function render(params: Record<string, unknown> = {}) {
  return renderEditor(params, 'ais.index');
}

describe('ais.index field behavior', () => {
  describe('text field (indexName)', () => {
    it('sends the value when indexName changes', () => {
      const { onParameterChange, container } = render({ indexName: '' });
      const input = getInput(container, 'Index Name');

      fireInput(input, 'products');

      expect(onParameterChange).toHaveBeenCalledWith('indexName', 'products');
    });
  });

  describe('optional text field with override (indexId)', () => {
    it('renders the field even when indexId is absent from parameters', () => {
      const { container } = render({ indexName: '' });
      const input = getInput(container, 'Index ID');

      expect(input).not.toBeNull();
    });

    it('sends undefined when indexId is cleared', () => {
      const { onParameterChange, container } = render({
        indexName: '',
        indexId: 'my-index',
      });
      const input = getInput(container, 'Index ID');

      fireInput(input, '');

      expect(onParameterChange).toHaveBeenCalledWith('indexId', undefined);
    });

    it('sends the value when indexId is filled', () => {
      const { onParameterChange, container } = render({ indexName: '' });
      const input = getInput(container, 'Index ID');

      fireInput(input, 'my-index');

      expect(onParameterChange).toHaveBeenCalledWith('indexId', 'my-index');
    });
  });
});
