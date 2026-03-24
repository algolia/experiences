import type { Hit, TemplateParams } from 'instantsearch.js/es/types';

import { getByPath, hasAttributes } from './utils';

export function renderListItem(template: Record<string, string>) {
  return function item(hit: Hit, { html, components }: TemplateParams) {
    if (!hasAttributes(template)) {
      return html`
        <div class="ais-AutocompleteListItem">
          <div class="ais-AutocompleteListItemImageContainer">
            <div
              class="algolia-experiences-skeleton ais-AutocompleteListItemImage"
            ></div>
          </div>
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
            <div
              class="algolia-experiences-skeleton"
              style="width:48px;height:14px"
            ></div>
          </div>
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
      <div class="ais-AutocompleteListItem">
        ${image &&
        html`<div class="ais-AutocompleteListItemImageContainer">
          <img class="ais-AutocompleteListItemImage" src=${image} />
        </div>`}
        <div class="ais-AutocompleteListItemInfo">
          ${category &&
          html`<span class="ais-AutocompleteListItemCategory"
            >${highlight(template.category!)}</span
          >`}
          ${name &&
          html`<span class="ais-AutocompleteListItemName"
            >${highlight(template.name!)}</span
          >`}
          ${description &&
          html`<span class="ais-AutocompleteListItemDescription"
            >${highlight(template.description!)}</span
          >`}
          ${price &&
          html`<span class="ais-AutocompleteListItemPrice"
            >${currency}${price}</span
          >`}
        </div>
      </div>
    `;
  };
}
