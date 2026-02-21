import type { JSX } from 'preact';
import type { ExperienceApiBlockParameters } from './types';

export type FieldOverride =
  | { type: 'switch'; label: string }
  | { type: 'number'; label: string; placeholder?: string }
  | { type: 'text'; label: string; placeholder?: string; picker?: boolean }
  | {
      type: 'toggleable-text';
      label: string;
      placeholder?: string;
      picker?: boolean;
    }
  | {
      type: 'object';
      label: string;
      defaultValue: Record<string, unknown>;
      disabledValue?: false | undefined;
      fields: Array<{ key: string; label: string }>;
    }
  | { type: 'json'; label: string };

export type WidgetTypeConfig = {
  label: string;
  description?: string;
  icon: JSX.Element;
  enabled: boolean;
  indexIndependent?: boolean;
  defaultParameters: ExperienceApiBlockParameters;
  columns?: number;
  fieldOrder?: string[];
  fieldOverrides?: Record<string, FieldOverride>;
  paramLabels?: Record<string, string>;
  paramDescriptions?: Record<string, string>;
};

const SEARCH_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const CHAT_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

const DATABASE_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
);

const GRID_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
  </svg>
);

const LIST_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="8" x2="21" y1="6" y2="6" />
    <line x1="8" x2="21" y1="12" y2="12" />
    <line x1="8" x2="21" y1="18" y2="18" />
    <line x1="3" x2="3.01" y1="6" y2="6" />
    <line x1="3" x2="3.01" y1="12" y2="12" />
    <line x1="3" x2="3.01" y1="18" y2="18" />
  </svg>
);

const CHEVRON_LEFT_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const CHEVRON_RIGHT_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const ARROW_DOWN_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M12 2v20" />
    <path d="m17 17-5 5-5-5" />
  </svg>
);

const SORT_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m3 16 4 4 4-4" />
    <path d="M7 20V4" />
    <path d="m21 8-4-4-4 4" />
    <path d="M17 4v16" />
  </svg>
);

const SLIDER_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M21 12H9" />
    <path d="M3 12h2" />
    <circle cx="7" cy="12" r="2" />
    <path d="M15 6H3" />
    <path d="M21 6h-2" />
    <circle cx="17" cy="6" r="2" />
  </svg>
);

const TOGGLE_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect width="20" height="12" x="2" y="6" rx="6" />
    <circle cx="16" cy="12" r="2" />
  </svg>
);

const TRENDING_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const CART_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

export const WIDGET_TYPES: Record<string, WidgetTypeConfig> = {
  'ais.autocomplete': {
    label: 'Autocomplete',
    description:
      'A search-as-you-type dropdown that shows results, suggestions, and recent searches as the user types.',
    enabled: true,
    indexIndependent: true,
    icon: SEARCH_ICON,
    defaultParameters: {
      container: '',
      cssVariables: { 'primary-color-rgb': '#003dff' },
      showRecent: false,
      showSuggestions: false,
    },
    fieldOrder: [
      'cssVariables',
      'container',
      'placement',
      'indexName',
      'showRecent',
      'showSuggestions',
    ],
    fieldOverrides: {
      showRecent: { type: 'switch', label: 'Recent Searches' },
      showSuggestions: {
        type: 'object',
        label: 'Suggestions',
        // oxlint-disable-next-line id-length
        defaultValue: { indexName: '', searchPageUrl: '', q: 'q' },
        fields: [
          { key: 'indexName', label: 'Index Name' },
          { key: 'searchPageUrl', label: 'Search Page URL' },
          { key: 'q', label: 'Query Parameter' },
        ],
      },
    },
    paramLabels: {
      container: 'Container',
      indexName: 'Index Name',
    },
    paramDescriptions: {
      container:
        'CSS selector for the DOM element to render into (e.g. "#search").',
      cssVariables: 'CSS variables for theming.',
      showRecent:
        "When enabled, shows the user's recent searches below the input.",
      showSuggestions:
        'When enabled, shows query suggestions from a dedicated suggestions index. Requires an indexName, a searchPageUrl, and a query parameter name.',
    },
  },
  'ais.chat': {
    label: 'Chat',
    description:
      'A conversational AI chat widget powered by an Algolia Agent Studio agent.',
    enabled: true,
    indexIndependent: true,
    icon: CHAT_ICON,
    defaultParameters: {
      container: '',
      placement: 'body',
      agentId: '',
    },
    paramLabels: {
      container: 'Container',
      agentId: 'Agent ID',
    },
    paramDescriptions: {
      container:
        'CSS selector for the DOM element to render into (e.g. "#chat").',
      agentId: 'The ID of the Algolia Agent Studio agent to power the chat.',
    },
  },
  'ais.index': {
    label: 'Index',
    description:
      'Scopes child widgets to a specific Algolia index. Required for search widgets.',
    enabled: true,
    indexIndependent: true,
    icon: DATABASE_ICON,
    defaultParameters: {
      indexName: '',
      indexId: undefined,
    },
    columns: 2,
    fieldOrder: ['indexName', 'indexId'],
    fieldOverrides: {
      indexId: { type: 'text', label: 'Index ID' },
    },
    paramLabels: {
      indexName: 'Index Name',
    },
    paramDescriptions: {
      indexName: 'The Algolia index or composition ID to search.',
      indexId:
        'Optional identifier when using multiple indices with the same name.',
    },
  },
  'ais.configure': {
    label: 'Configure',
    description:
      'A headless widget that sets default Algolia search parameters without rendering any UI.',
    enabled: true,
    icon: () => {
      return (
        <svg
          class="size-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    },
    defaultParameters: {
      container: '',
      searchParameters: {},
    },
    fieldOrder: ['searchParameters'],
    fieldOverrides: {
      searchParameters: { type: 'json', label: 'Search parameters' },
    },
    paramDescriptions: {
      searchParameters:
        'Algolia search parameters as JSON (e.g. {"hitsPerPage": 20, "filters": "category:Books"}).',
    },
  },
  'ais.hits': {
    label: 'Hits',
    enabled: false,
    icon: GRID_ICON,
    defaultParameters: {
      container: '',
    },
  },
  'ais.searchBox': {
    label: 'Search Box',
    enabled: true,
    description: 'A search input with submit, reset, and loading indicators.',
    icon: SEARCH_ICON,
    defaultParameters: {
      container: '',
      placeholder: undefined,
      autofocus: false,
      showLoadingIndicator: true,
      showSubmit: true,
      showReset: true,
      searchAsYouType: true,
      ignoreCompositionEvents: false,
      cssClasses: undefined,
    },
    fieldOrder: [
      'container',
      'placement',
      'placeholder',
      'autofocus',
      'searchAsYouType',
      'ignoreCompositionEvents',
      'showLoadingIndicator',
      'showSubmit',
      'showReset',
      'cssClasses',
    ],
    fieldOverrides: {
      placeholder: { type: 'text', label: 'Placeholder' },
      autofocus: { type: 'switch', label: 'Autofocus' },
      searchAsYouType: { type: 'switch', label: 'Search as you type' },
      ignoreCompositionEvents: {
        type: 'switch',
        label: 'Ignore composition events',
      },
      showLoadingIndicator: { type: 'switch', label: 'Show loading indicator' },
      showSubmit: { type: 'switch', label: 'Show submit button' },
      showReset: { type: 'switch', label: 'Show reset button' },
      cssClasses: {
        type: 'object',
        label: 'CSS classes',
        disabledValue: undefined,
        defaultValue: {
          root: '',
          form: '',
          input: '',
          submit: '',
          submitIcon: '',
          reset: '',
          resetIcon: '',
          loadingIndicator: '',
          loadingIcon: '',
        },
        fields: [
          { key: 'root', label: 'Root' },
          { key: 'form', label: 'Form' },
          { key: 'input', label: 'Input' },
          { key: 'submit', label: 'Submit' },
          { key: 'submitIcon', label: 'Submit icon' },
          { key: 'reset', label: 'Reset' },
          { key: 'resetIcon', label: 'Reset icon' },
          { key: 'loadingIndicator', label: 'Loading indicator' },
          { key: 'loadingIcon', label: 'Loading icon' },
        ],
      },
    },
    paramLabels: {
      container: 'Container',
    },
    paramDescriptions: {
      container:
        'CSS selector for the DOM element to render into (e.g. "#search-box").',
      placeholder: 'Placeholder text shown in the search input.',
      autofocus: 'Whether the input should be focused on page load.',
      searchAsYouType:
        'When enabled, triggers a search on each keystroke. When disabled, searches only on submit.',
      ignoreCompositionEvents:
        'When enabled, ignores IME composition events for CJK input.',
      showLoadingIndicator:
        'Whether to show a loading indicator while results are being fetched.',
      showSubmit: 'Whether to show the submit button.',
      showReset: 'Whether to show the reset button.',
      cssClasses: 'CSS classes to apply to the widget DOM elements.',
    },
  },
  'ais.refinementList': {
    label: 'Refinement List',
    enabled: false,
    icon: LIST_ICON,
    defaultParameters: {
      container: '',
    },
  },
  'ais.pagination': {
    label: 'Pagination',
    enabled: false,
    icon: CHEVRON_LEFT_ICON,
    defaultParameters: {
      container: '',
    },
  },
  'ais.infiniteHits': {
    label: 'Infinite Hits',
    enabled: false,
    icon: ARROW_DOWN_ICON,
    defaultParameters: {
      container: '',
    },
  },
  'ais.sortBy': {
    label: 'Sort By',
    enabled: false,
    icon: SORT_ICON,
    defaultParameters: {
      container: '',
    },
  },
  'ais.hierarchicalMenu': {
    label: 'Hierarchical Menu',
    enabled: false,
    icon: CHEVRON_RIGHT_ICON,
    defaultParameters: {
      container: '',
    },
  },
  'ais.rangeSlider': {
    label: 'Range Slider',
    enabled: false,
    icon: SLIDER_ICON,
    defaultParameters: {
      container: '',
    },
  },
  'ais.toggleRefinement': {
    label: 'Toggle Refinement',
    enabled: false,
    icon: TOGGLE_ICON,
    defaultParameters: {
      container: '',
    },
  },
  'ais.trendingItems': {
    label: 'Trending Items',
    enabled: false,
    icon: TRENDING_ICON,
    defaultParameters: {
      container: '',
    },
  },
  'ais.frequentlyBoughtTogether': {
    label: 'Frequently Bought Together',
    enabled: false,
    icon: CART_ICON,
    defaultParameters: {
      container: '',
    },
  },
};
