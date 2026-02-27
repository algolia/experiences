import { afterEach, describe, expect, it } from 'vitest';

import { fireInput, getInput, renderEditor } from './widget-test-utils';

afterEach(() => {
  document.body.innerHTML = '';
});

function render(params: Record<string, unknown> = {}) {
  return renderEditor(params, 'ais.chat');
}

describe('ais.chat fields', () => {
  describe('item-template field (template)', () => {
    it('sends the updated object when a sub-field changes', () => {
      const { onParameterChange, container } = render({
        template: {
          name: '',
          category: '',
          description: '',
          image: '',
          price: '',
          currency: '',
        },
      });
      const input = getInput(container, 'Name');

      fireInput(input, 'product_name');

      expect(onParameterChange).toHaveBeenCalledWith(
        'template',
        expect.objectContaining({ name: 'product_name' })
      );
    });

    it('sends the updated object when currency changes', () => {
      const { onParameterChange, container } = render({
        template: {
          name: '',
          category: '',
          description: '',
          image: '',
          price: '',
          currency: '',
        },
      });
      const input = getInput(container, 'Currency');

      fireInput(input, '$');

      expect(onParameterChange).toHaveBeenCalledWith(
        'template',
        expect.objectContaining({ currency: '$' })
      );
    });
  });
});
