import type { TemplateParams } from 'instantsearch.js/es/types';

type PanelElements = Partial<
  Record<'recent' | 'suggestions' | (string & {}), preact.JSX.Element>
>;

type PanelIndex = {
  indexName: string;
  hits: Array<{ objectID: string }>;
  results: { query: string };
};

type PanelData = {
  elements: PanelElements;
  indices: Array<PanelIndex>;
};

type PanelTemplate = (data: PanelData, params: TemplateParams) => unknown;

type GlobalNoResultsConfig = {
  title?: string;
  description?: string;
  clearLabel?: string;
};

function defaultPanel(data: PanelData, { html }: TemplateParams) {
  return html`${Object.keys(data.elements).map((key) => {
    return data.elements[key];
  })}`;
}

export function withGlobalNoResults(
  config: GlobalNoResultsConfig,
  inner?: PanelTemplate
): PanelTemplate {
  const innerPanel = inner ?? defaultPanel;

  return function panel(data: PanelData, { html }: TemplateParams) {
    const allEmpty =
      data.indices.length > 0 &&
      data.indices.every((index) => {
        return index.hits.length === 0;
      });

    if (!allEmpty) {
      return innerPanel(data, { html } as TemplateParams);
    }

    const query = data.indices[0]?.results?.query ?? '';
    const title = config.title
      ? config.title.replaceAll('{{query}}', query)
      : undefined;
    const { description, clearLabel } = config;

    return html`<div class="ais-AutocompleteNoResults">
      <svg
        class="ais-AutocompleteNoResults-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M16.041 15.856c-0.034 0.026-0.067 0.055-0.099 0.087s-0.060 0.064-0.087 0.099c-1.258 1.213-2.969 1.958-4.855 1.958-1.933 0-3.682-0.782-4.95-2.050s-2.050-3.017-2.050-4.95 0.782-3.682 2.050-4.95 3.017-2.050 4.95-2.050 3.682 0.782 4.95 2.050 2.050 3.017 2.050 4.95c0 1.886-0.745 3.597-1.959 4.856zM21.707 20.293l-3.675-3.675c1.231-1.54 1.968-3.493 1.968-5.618 0-2.485-1.008-4.736-2.636-6.364s-3.879-2.636-6.364-2.636-4.736 1.008-6.364 2.636-2.636 3.879-2.636 6.364 1.008 4.736 2.636 6.364 3.879 2.636 6.364 2.636c2.125 0 4.078-0.737 5.618-1.968l3.675 3.675c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414z"
        ></path>
      </svg>

      ${title && html`<p class="ais-AutocompleteNoResults-title">${title}</p>`}
      ${description &&
      html`<p class="ais-AutocompleteNoResults-description">${description}</p>`}
      ${clearLabel &&
      html`<button
        type="button"
        class="ais-AutocompleteNoResults-clear"
        onClick=${() => {
          const root = document.querySelector('.ais-Autocomplete');
          const input = root?.querySelector<HTMLInputElement>(
            'input[type="search"]'
          );
          if (input) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              HTMLInputElement.prototype,
              'value'
            )?.set;
            nativeInputValueSetter?.call(input, '');
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
          }
        }}
      >
        ${clearLabel}
      </button>`}
    </div>`;
  };
}

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
