import type { Hit, TemplateParams } from 'instantsearch.js/es/types';

import { renderListItem } from './list-item';

export function renderAutocompleteItem(template: Record<string, string>) {
  const listItem = renderListItem(template);

  // `onSelect` is provided by autocomplete.js but selection is handled by the
  // autocomplete widget itself, so we only need the `item` for rendering.
  return function item(
    data: { item: Hit; onSelect: () => void },
    params: TemplateParams
  ) {
    return listItem(data.item, params);
  };
}
