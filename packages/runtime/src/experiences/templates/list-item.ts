import type { Hit, TemplateParams } from 'instantsearch.js/es/types';

export const SKELETON_CSS = `
@keyframes shimmer {
  0% { background-position-x: 200%; }
  100% { background-position-x: 0%; }
}
.algolia-experiences-skeleton {
  border-radius: 4px;
  background: linear-gradient(100deg, #e8e8e8, #e8e8e8 50%, #fff 60%, #e8e8e8 70%);
  background-size: 200% 100%;
  background-attachment: fixed;
  animation: shimmer 2s ease-out infinite;
}
`;

function getByPath(hit: Hit, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    return current != null && typeof current === 'object'
      ? (current as Record<string, unknown>)[segment]
      : undefined;
  }, hit);
}

function hasAttributes(template: Record<string, string>): boolean {
  return Object.entries(template).some(([key, value]) => {
    return key !== 'currency' && value !== '';
  });
}

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
