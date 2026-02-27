import type { Hit, TemplateParams } from 'instantsearch.js/es/types';

import { getByPath, hasAttributes } from './utils';

export { SKELETON_CSS } from './utils';

export function renderListItem(template: Record<string, string>) {
  return function item(hit: Hit, { html, components }: TemplateParams) {
    if (!hasAttributes(template)) {
      return html`
        <div style="display:flex;width:100%;align-items:center;gap:12px">
          <div
            class="algolia-experiences-skeleton"
            style="width:80px;height:80px;border-radius:5px;flex-shrink:0"
          ></div>
          <div
            style="display:flex;flex-direction:column;justify-content:center;gap:8px;flex:1"
          >
            <div
              class="algolia-experiences-skeleton"
              style="width:60%;height:14px"
            ></div>
            <div
              class="algolia-experiences-skeleton"
              style="width:40%;height:12px"
            ></div>
            <div
              class="algolia-experiences-skeleton"
              style="width:80%;height:12px"
            ></div>
          </div>
          <div
            class="algolia-experiences-skeleton"
            style="width:48px;height:14px;flex-shrink:0"
          ></div>
        </div>
      `;
    }

    const { name, category, description, image, price } = Object.entries(
      template
    ).reduce(
      (acc, [key, attr]) => {
        acc[key] =
          key === 'currency' ? attr : attr ? getByPath(hit, attr) : undefined;

        return acc;
      },
      {} as Record<string, unknown>
    );
    const currency = template.currency || '';

    const highlight = (attribute: string) => {
      if (getByPath(hit, `_highlightResult.${attribute}`)) {
        return components.Highlight({ hit, attribute });
      }

      return getByPath(hit, attribute);
    };

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
            >${highlight(template.name!)}</span
          >`}
          ${category &&
          html`<span style="color:#6b7280"
            >${highlight(template.category!)}</span
          >`}
          ${description &&
          html`<span
            style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden"
            >${highlight(template.description!)}</span
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
