import type { Hit, TemplateParams } from 'instantsearch.js/es/types';

import { getByPath, hasAttributes } from './utils';

export { SKELETON_CSS } from './utils';

export function renderCarouselItem(template: Record<string, string>) {
  return function item(hit: Hit, { html }: TemplateParams) {
    if (!hasAttributes(template)) {
      return html`
        <div
          style="display:flex;flex-direction:column;width:100%;gap:8px;padding:0 8px"
        >
          <div
            class="algolia-experiences-skeleton"
            style="width:100%;aspect-ratio:1;border-radius:5px"
          ></div>
          <div
            class="algolia-experiences-skeleton"
            style="width:70%;height:14px"
          ></div>
          <div
            class="algolia-experiences-skeleton"
            style="width:50%;height:12px"
          ></div>
          <div
            class="algolia-experiences-skeleton"
            style="width:40%;height:14px"
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

    return html`
      <div style="display:flex;flex-direction:column;width:100%;padding:0 8px">
        ${image &&
        html`<img
          src=${image}
          style="width:100%;aspect-ratio:1;object-fit:contain;border-radius:5px"
        />`}
        ${name &&
        html`<span
          style="font-weight:bold;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden"
          >${name}</span
        >`}
        ${category &&
        html`<span style="color:#6b7280;font-size:0.875em">${category}</span>`}
        ${description &&
        html`<span
          style="font-size:0.875em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden"
          >${description}</span
        >`}
        ${price &&
        html`<span style="margin-top:8px;font-weight:bold"
          >${currency}${price}</span
        >`}
      </div>
    `;
  };
}
