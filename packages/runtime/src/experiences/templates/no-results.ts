import type { TemplateParams } from 'instantsearch.js/es/types';

export function renderNoResults(message: string) {
  return function noResults(
    _data: Record<string, never>,
    { html }: TemplateParams
  ) {
    return html`<span>${message}</span>`;
  };
}
