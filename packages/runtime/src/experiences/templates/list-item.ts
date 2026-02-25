import type { TemplateParams } from 'instantsearch.js';

export function renderListItem(template: Record<string, string>) {
  return function item(hit: any, { html, components }: TemplateParams) {
    const { name, brand, description, image, price } = Object.entries(
      template
    ).reduce(
      (acc, [key, attr]) => {
        acc[key] = key === 'currency' ? attr : attr ? hit[attr] : undefined;

        return acc;
      },
      {} as Record<string, unknown>
    );
    const currency = template.currency || '';

    return html`
      <div style="display:flex;width:100%;align-items:center;gap:12px">
        ${image &&
        html`<img
          src=${image}
          style="width:80px;height:80px;object-fit:contain;border-radius:5px;flex-shrink:0"
        />`}
        <div style="display:flex;flex-direction:column;justify-content:center">
          ${name &&
          html`<span style="font-weight:bold"
            >${components.Highlight({
              hit,
              attribute: template.name!,
            })}</span
          >`}
          ${brand && html`<span style="color:#6b7280">${brand}</span>`}
          ${description &&
          html`<span
            style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden"
            >${components.Highlight({
              hit,
              attribute: template.description!,
            })}</span
          >`}
        </div>
        <div style="flex-grow:1"></div>
        ${price &&
        html`<span style="flex-shrink:0;font-weight:bold"
          >${currency}${price}</span
        >`}
      </div>
    `;
  };
}
