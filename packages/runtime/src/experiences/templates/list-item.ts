import type { TemplateParams } from 'instantsearch.js';

const SKELETON_STYLE =
  'border-radius:4px;background:linear-gradient(100deg,#e8e8e8,#e8e8e8 50%,#fff 60%,#e8e8e8 70%);background-size:200% 100%;background-attachment:fixed;animation:shimmer 2s ease-out infinite';

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    return current != null && typeof current === 'object'
      ? (current as Record<string, unknown>)[segment]
      : undefined;
  }, obj);
}

function hasAttributes(template: Record<string, string>): boolean {
  return Object.entries(template).some(([key, value]) => {
    return key !== 'currency' && value !== '';
  });
}

export function renderListItem(template: Record<string, string>) {
  return function item(hit: any, { html, components }: TemplateParams) {
    if (!hasAttributes(template)) {
      return html`
        <style>
          @keyframes shimmer {
            0% {
              background-position-x: 200%;
            }
            100% {
              background-position-x: 0%;
            }
          }
        </style>
        <div style="display:flex;width:100%;align-items:center;gap:12px">
          <div
            style="width:80px;height:80px;border-radius:5px;flex-shrink:0;${SKELETON_STYLE}"
          ></div>
          <div
            style="display:flex;flex-direction:column;justify-content:center;gap:8px;flex:1"
          >
            <div style="width:60%;height:14px;${SKELETON_STYLE}"></div>
            <div style="width:40%;height:12px;${SKELETON_STYLE}"></div>
            <div style="width:80%;height:12px;${SKELETON_STYLE}"></div>
          </div>
          <div
            style="width:48px;height:14px;flex-shrink:0;${SKELETON_STYLE}"
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
          ${category && html`<span style="color:#6b7280">${category}</span>`}
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
