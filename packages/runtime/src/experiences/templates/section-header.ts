import type { TemplateParams } from 'instantsearch.js/es/types';

export function renderSectionHeader(label: string) {
  return function header(
    _data: { items: unknown[] },
    { html }: TemplateParams
  ) {
    return html`<span>${label}</span>`;
  };
}
