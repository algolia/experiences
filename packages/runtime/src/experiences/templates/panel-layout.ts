import type { TemplateParams } from 'instantsearch.js/es/types';

type PanelElements = Partial<
  Record<'recent' | 'suggestions' | (string & {}), preact.JSX.Element>
>;

type PanelData = {
  elements: PanelElements;
  indices: Array<{ indexName: string }>;
};

export function renderTwoColumnsPanel() {
  return function panel(data: PanelData, { html }: TemplateParams) {
    const leftKeys = ['recent', 'suggestions'];
    const leftElements = leftKeys
      .filter((key) => {
        return key in data.elements;
      })
      .map((key) => {
        return data.elements[key];
      });

    const rightElements = Object.keys(data.elements)
      .filter((key) => {
        return !leftKeys.includes(key);
      })
      .map((key) => {
        return data.elements[key];
      });

    if (leftElements.length === 0 || rightElements.length === 0) {
      return html`${Object.keys(data.elements).map((key) => {
        return data.elements[key];
      })}`;
    }

    return html`<div class="ais-AutocompletePanelTwoColumns">
      <div class="ais-AutocompletePanelTwoColumns-left">${leftElements}</div>
      <div class="ais-AutocompletePanelTwoColumns-right">${rightElements}</div>
    </div>`;
  };
}
