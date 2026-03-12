import type { Hit, TemplateParams } from 'instantsearch.js/es/types';

import { renderListItem } from './list-item';

export function renderAutocompleteItem(template: Record<string, string>) {
  const listItem = renderListItem(template);

  return function item(
    data: { item: Hit; onSelect: () => void },
    params: TemplateParams
  ) {
    return listItem(data.item, params);
  };
}
