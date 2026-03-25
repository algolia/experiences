import type { Hit, TemplateParams } from 'instantsearch.js/es/types';

import { renderListItem } from './list-item';
import { getByPath } from './utils';

export function renderAutocompleteItem(
  template: Record<string, string>,
  { urlAttribute }: { urlAttribute?: string } = {}
) {
  const listItem = renderListItem(template);

  return function item(
    data: { item: Hit; onSelect: () => void },
    params: TemplateParams
  ) {
    const content = listItem(data.item, params);

    if (urlAttribute) {
      const href = getByPath(data.item, urlAttribute);

      if (typeof href === 'string' && href) {
        return params.html`<a class="ais-AutocompleteIndexItemLink" href=${href}>${content}</a>`;
      }
    }

    return content;
  };
}
