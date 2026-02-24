import type { JSX } from 'preact';
import type { ExperienceApiBlockParameters } from './types';

type FieldOverrideBase = {
  visibleIf?: { key: string; value: unknown };
};

export type FieldOverride = FieldOverrideBase &
  (
    | { type: 'switch'; label: string }
    | { type: 'number'; label: string; placeholder?: string }
    | { type: 'text'; label: string; placeholder?: string; picker?: boolean }
    | { type: 'facet-value'; label: string; placeholder?: string }
    | {
        type: 'toggleable-text';
        label: string;
        placeholder?: string;
        picker?: boolean;
      }
    | {
        type: 'select';
        label: string;
        options: Array<{ value: string; label: string }>;
        defaultValue: string;
      }
    | {
        type: 'object';
        label: string;
        defaultValue: Record<string, unknown>;
        disabledValue?: false | undefined;
        fields: Array<{ key: string; label: string }>;
      }
    | { type: 'json'; label: string }
    | {
        type: 'items-list';
        label: string;
        fields: Array<{
          key: string;
          label: string;
          placeholder?: string;
          inputType?: 'text' | 'number';
        }>;
      }
    | { type: 'list'; label: string; placeholder?: string; excludes?: string }
    | {
        type: 'select-list';
        label: string;
        options: Array<{ value: string; label: string }>;
      }
  );

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

const HASH_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="4" x2="20" y1="9" y2="9" />
    <line x1="4" x2="20" y1="15" y2="15" />
    <line x1="10" x2="8" y1="3" y2="21" />
    <line x1="16" x2="14" y1="3" y2="21" />
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

const CONFIGURE_ICON = (
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

const STAR_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
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

const X_ICON = (
  <svg
    class="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
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
    icon: CONFIGURE_ICON,
    defaultParameters: {
      container: '',
      placement: 'body',
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
    description:
      'Displays the list of search results (hits) matching the current query.',
    enabled: true,
    icon: GRID_ICON,
    defaultParameters: {
      container: '',
      escapeHTML: true,
      cssClasses: undefined,
    },
    fieldOrder: ['container', 'placement', 'escapeHTML', 'cssClasses'],
    fieldOverrides: {
      escapeHTML: { type: 'switch', label: 'Escape HTML' },
      cssClasses: {
        type: 'object',
        label: 'CSS classes',
        disabledValue: undefined,
        defaultValue: {
          root: '',
          emptyRoot: '',
          list: '',
          item: '',
          bannerRoot: '',
          bannerImage: '',
          bannerLink: '',
        },
        fields: [
          { key: 'root', label: 'Root' },
          { key: 'emptyRoot', label: 'Empty root' },
          { key: 'list', label: 'List' },
          { key: 'item', label: 'Item' },
          { key: 'bannerRoot', label: 'Banner root' },
          { key: 'bannerImage', label: 'Banner image' },
          { key: 'bannerLink', label: 'Banner link' },
        ],
      },
    },
    paramLabels: {
      container: 'Container',
    },
    paramDescriptions: {
      container:
        'CSS selector for the DOM element to render into (e.g. "#hits").',
      escapeHTML:
        'When enabled, escapes HTML tags in hit string values to prevent XSS.',
      cssClasses:
        'Custom CSS classes to apply to specific parts of the widget.',
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
    description:
      'A filterable list of facet values that lets users refine search results by selecting one or more attributes.',
    enabled: true,
    icon: LIST_ICON,
    defaultParameters: {
      container: '',
      attribute: '',
      operator: undefined,
      sortBy: undefined,
      limit: undefined,
      showMore: false,
      showMoreLimit: undefined,
      searchable: false,
      searchablePlaceholder: undefined,
      searchableIsAlwaysActive: true,
      searchableEscapeFacetValues: true,
      searchableSelectOnSubmit: undefined,
      cssClasses: undefined,
    },
    fieldOrder: [
      'container',
      'placement',
      'attribute',
      'operator',
      'sortBy',
      'limit',
      'showMore',
      'showMoreLimit',
      'searchable',
      'searchablePlaceholder',
      'searchableIsAlwaysActive',
      'searchableEscapeFacetValues',
      'searchableSelectOnSubmit',
      'cssClasses',
    ],
    fieldOverrides: {
      operator: {
        type: 'select',
        label: 'Operator',
        options: [
          { value: 'or', label: 'or' },
          { value: 'and', label: 'and' },
        ],
        defaultValue: 'or',
      },
      sortBy: {
        type: 'select-list',
        label: 'Sort by',
        options: [
          { value: 'count:asc', label: 'Count (asc)' },
          { value: 'count:desc', label: 'Count (desc)' },
          { value: 'name:asc', label: 'Name (asc)' },
          { value: 'name:desc', label: 'Name (desc)' },
          { value: 'isRefined:asc', label: 'Is refined (asc)' },
          { value: 'isRefined:desc', label: 'Is refined (desc)' },
        ],
      },
      limit: { type: 'number', label: 'Limit', placeholder: '10' },
      showMore: { type: 'switch', label: 'Show more' },
      showMoreLimit: {
        type: 'number',
        label: 'Show more limit',
        placeholder: '20',
        visibleIf: { key: 'showMore', value: true },
      },
      searchable: { type: 'switch', label: 'Searchable' },
      searchablePlaceholder: {
        type: 'text',
        label: 'Search placeholder',
        placeholder: 'Search...',
        visibleIf: { key: 'searchable', value: true },
      },
      searchableIsAlwaysActive: {
        type: 'switch',
        label: 'Search always active',
        visibleIf: { key: 'searchable', value: true },
      },
      searchableEscapeFacetValues: {
        type: 'switch',
        label: 'Escape search facet values',
        visibleIf: { key: 'searchable', value: true },
      },
      searchableSelectOnSubmit: {
        type: 'switch',
        label: 'Select on submit',
        visibleIf: { key: 'searchable', value: true },
      },
      cssClasses: {
        type: 'object',
        label: 'CSS classes',
        defaultValue: {
          root: '',
          noRefinementRoot: '',
          list: '',
          item: '',
          selectedItem: '',
          label: '',
          checkbox: '',
          labelText: '',
          showMore: '',
          disabledShowMore: '',
          count: '',
          searchBox: '',
        },
        disabledValue: undefined,
        fields: [
          { key: 'root', label: 'Root' },
          { key: 'noRefinementRoot', label: 'No refinement root' },
          { key: 'list', label: 'List' },
          { key: 'item', label: 'Item' },
          { key: 'selectedItem', label: 'Selected item' },
          { key: 'label', label: 'Label' },
          { key: 'checkbox', label: 'Checkbox' },
          { key: 'labelText', label: 'Label text' },
          { key: 'showMore', label: 'Show more' },
          { key: 'disabledShowMore', label: 'Disabled show more' },
          { key: 'count', label: 'Count' },
          { key: 'searchBox', label: 'Search box' },
        ],
      },
    },
    paramLabels: {
      container: 'Container',
      attribute: 'Attribute',
    },
    paramDescriptions: {
      container:
        'CSS selector for the DOM element to render into (e.g. "#refinement-list").',
      attribute: 'The facet attribute to display (e.g. "brand").',
      operator:
        'How multiple selections combine: "and" requires all, "or" requires any. Defaults to "or".',
      sortBy:
        'Ordered list of sort criteria. Available values: "count:asc", "count:desc", "name:asc", "name:desc", "isRefined:asc", "isRefined:desc".',
      limit: 'Maximum number of facet values to display. Defaults to 10.',
      showMore:
        'When enabled, shows a "Show more" button to reveal additional facet values.',
      showMoreLimit:
        'Maximum number of facet values when "Show more" is expanded. Defaults to 20.',
      searchable:
        'When enabled, adds a search field to filter within the facet values.',
      searchablePlaceholder:
        'Placeholder text for the search field. Defaults to "Search...".',
      searchableIsAlwaysActive:
        'When disabled, the search field becomes inactive if fewer items are shown than the limit.',
      searchableEscapeFacetValues:
        'When enabled, escapes the facet values returned from Algolia during search.',
      searchableSelectOnSubmit:
        'When enabled, submitting the search selects the first item in the list.',
      cssClasses:
        'Custom CSS classes to apply to the widget elements for styling.',
    },
  },
  'ais.menu': {
    label: 'Menu',
    description:
      'A single-select facet list that lets users filter results by choosing one value from a given attribute.',
    enabled: true,
    icon: LIST_ICON,
    defaultParameters: {
      container: '',
      attribute: '',
      limit: undefined,
      showMore: false,
      showMoreLimit: undefined,
      sortBy: undefined,
      cssClasses: undefined,
    },
    fieldOrder: [
      'container',
      'placement',
      'attribute',
      'limit',
      'showMore',
      'showMoreLimit',
      'sortBy',
      'cssClasses',
    ],
    fieldOverrides: {
      limit: { type: 'number', label: 'Limit', placeholder: '10' },
      showMore: { type: 'switch', label: 'Show more' },
      showMoreLimit: {
        type: 'number',
        label: 'Show more limit',
        placeholder: '20',
        visibleIf: { key: 'showMore', value: true },
      },
      sortBy: {
        type: 'select-list',
        label: 'Sort by',
        options: [
          { value: 'count:asc', label: 'Count (asc)' },
          { value: 'count:desc', label: 'Count (desc)' },
          { value: 'name:asc', label: 'Name (asc)' },
          { value: 'name:desc', label: 'Name (desc)' },
          { value: 'isRefined:asc', label: 'Is refined (asc)' },
          { value: 'isRefined:desc', label: 'Is refined (desc)' },
        ],
      },
      cssClasses: {
        type: 'object',
        label: 'CSS classes',
        defaultValue: {
          root: '',
          noRefinementRoot: '',
          list: '',
          item: '',
          selectedItem: '',
          link: '',
          label: '',
          count: '',
          showMore: '',
          disabledShowMore: '',
        },
        disabledValue: undefined,
        fields: [
          { key: 'root', label: 'Root' },
          { key: 'noRefinementRoot', label: 'No refinement root' },
          { key: 'list', label: 'List' },
          { key: 'item', label: 'Item' },
          { key: 'selectedItem', label: 'Selected item' },
          { key: 'link', label: 'Link' },
          { key: 'label', label: 'Label' },
          { key: 'count', label: 'Count' },
          { key: 'showMore', label: 'Show more' },
          { key: 'disabledShowMore', label: 'Disabled show more' },
        ],
      },
    },
    paramLabels: {
      container: 'Container',
      attribute: 'Attribute',
    },
    paramDescriptions: {
      container:
        'CSS selector for the DOM element to render into (e.g. "#menu").',
      attribute: 'The facet attribute to display (e.g. "category").',
      limit: 'Maximum number of facet values to display. Defaults to 10.',
      showMore:
        'When enabled, shows a "Show more" button to reveal additional facet values.',
      showMoreLimit:
        'Maximum number of facet values when "Show more" is expanded. Defaults to 20.',
      sortBy:
        'Ordered list of sort criteria. Available values: "count:asc", "count:desc", "name:asc", "name:desc", "isRefined:asc", "isRefined:desc".',
      cssClasses:
        'Custom CSS classes to apply to the widget elements for styling.',
    },
  },
  'ais.pagination': {
    label: 'Pagination',
    description:
      'A page navigation widget that lets users browse through paginated search results.',
    enabled: true,
    icon: CHEVRON_LEFT_ICON,
    defaultParameters: {
      container: '',
      totalPages: undefined,
      padding: undefined,
      scrollTo: undefined,
      showFirst: true,
      showLast: true,
      showNext: true,
      showPrevious: true,
      cssClasses: undefined,
    },
    fieldOrder: [
      'container',
      'placement',
      'totalPages',
      'padding',
      'scrollTo',
      'showFirst',
      'showLast',
      'showPrevious',
      'showNext',
      'cssClasses',
    ],
    fieldOverrides: {
      totalPages: { type: 'number', label: 'Total Pages' },
      padding: { type: 'number', label: 'Padding', placeholder: '3' },
      scrollTo: {
        type: 'toggleable-text',
        label: 'Scroll to',
        placeholder: 'body',
        picker: true,
      },
      showFirst: { type: 'switch', label: 'Show first page' },
      showLast: { type: 'switch', label: 'Show last page' },
      showNext: { type: 'switch', label: 'Show next page' },
      showPrevious: { type: 'switch', label: 'Show previous page' },
      cssClasses: {
        type: 'object',
        label: 'CSS classes',
        disabledValue: undefined,
        defaultValue: {
          root: '',
          noRefinementRoot: '',
          list: '',
          item: '',
          firstPageItem: '',
          lastPageItem: '',
          previousPageItem: '',
          nextPageItem: '',
          pageItem: '',
          selectedItem: '',
          disabledItem: '',
          link: '',
        },
        fields: [
          { key: 'root', label: 'Root' },
          { key: 'noRefinementRoot', label: 'No refinement root' },
          { key: 'list', label: 'List' },
          { key: 'item', label: 'Item' },
          { key: 'firstPageItem', label: 'First page item' },
          { key: 'lastPageItem', label: 'Last page item' },
          { key: 'previousPageItem', label: 'Previous page item' },
          { key: 'nextPageItem', label: 'Next page item' },
          { key: 'pageItem', label: 'Page item' },
          { key: 'selectedItem', label: 'Selected item' },
          { key: 'disabledItem', label: 'Disabled item' },
          { key: 'link', label: 'Link' },
        ],
      },
    },
    paramLabels: {
      container: 'Container',
    },
    paramDescriptions: {
      container:
        'CSS selector for the DOM element to render into (e.g. "#pagination").',
      totalPages: 'Maximum number of pages to browse.',
      padding: 'Number of pages to display on each side of the current page.',
      scrollTo:
        'CSS selector to scroll to after a page click. When enabled without a value, scrolls to body. Disable to prevent scrolling.',
      showFirst: 'When enabled, shows a link to the first page.',
      showLast: 'When enabled, shows a link to the last page.',
      showNext: 'When enabled, shows a link to the next page.',
      showPrevious: 'When enabled, shows a link to the previous page.',
      cssClasses: 'Custom CSS classes for pagination elements.',
    },
  },
  'ais.infiniteHits': {
    label: 'Infinite Hits',
    description:
      'Displays search results with a "Show more" button to load additional pages incrementally.',
    enabled: true,
    icon: ARROW_DOWN_ICON,
    defaultParameters: {
      container: '',
      escapeHTML: true,
      showPrevious: false,
      cssClasses: undefined,
    },
    fieldOrder: [
      'container',
      'placement',
      'escapeHTML',
      'showPrevious',
      'cssClasses',
    ],
    fieldOverrides: {
      escapeHTML: { type: 'switch', label: 'Escape HTML' },
      showPrevious: { type: 'switch', label: 'Show previous' },
      cssClasses: {
        type: 'object',
        label: 'CSS classes',
        disabledValue: undefined,
        defaultValue: {
          root: '',
          emptyRoot: '',
          list: '',
          item: '',
          loadPrevious: '',
          disabledLoadPrevious: '',
          loadMore: '',
          disabledLoadMore: '',
          bannerRoot: '',
          bannerImage: '',
          bannerLink: '',
        },
        fields: [
          { key: 'root', label: 'Root' },
          { key: 'emptyRoot', label: 'Empty root' },
          { key: 'list', label: 'List' },
          { key: 'item', label: 'Item' },
          { key: 'loadPrevious', label: 'Load previous' },
          { key: 'disabledLoadPrevious', label: 'Disabled load previous' },
          { key: 'loadMore', label: 'Load more' },
          { key: 'disabledLoadMore', label: 'Disabled load more' },
          { key: 'bannerRoot', label: 'Banner root' },
          { key: 'bannerImage', label: 'Banner image' },
          { key: 'bannerLink', label: 'Banner link' },
        ],
      },
    },
    paramLabels: {
      container: 'Container',
    },
    paramDescriptions: {
      container:
        'CSS selector for the DOM element to render into (e.g. "#infinite-hits").',
      escapeHTML:
        'When enabled, escapes HTML entities in hit string values for safety.',
      showPrevious:
        'When enabled, shows a button to load previous results above the list.',
      cssClasses: 'Custom CSS classes to apply to the widget elements.',
    },
  },
  'ais.sortBy': {
    label: 'Sort By',
    description:
      'A dropdown selector that lets the user switch between different sort orders (replica indices or sorting strategies).',
    enabled: true,
    icon: SORT_ICON,
    defaultParameters: {
      container: '',
      items: [{ value: '', label: 'Default' }],
      cssClasses: false,
    },
    fieldOrder: ['container', 'placement', 'items', 'cssClasses'],
    fieldOverrides: {
      items: {
        type: 'items-list',
        label: 'Sort options',
        fields: [
          {
            key: 'value',
            label: 'Index name',
            placeholder: 'e.g. products_price_asc',
          },
          {
            key: 'label',
            label: 'Label',
            placeholder: 'e.g. Price (ascending)',
          },
        ],
      },
      cssClasses: {
        type: 'object',
        label: 'CSS classes',
        defaultValue: { root: '', select: '', option: '' },
        fields: [
          { key: 'root', label: 'Root' },
          { key: 'select', label: 'Select' },
          { key: 'option', label: 'Option' },
        ],
      },
    },
    paramLabels: {
      container: 'Container',
    },
    paramDescriptions: {
      container:
        'CSS selector for the DOM element to render into (e.g. "#sort").',
      items:
        'List of sort options, each mapping a replica index name to a display label. The first item always targets the parent index (default sort) and its value is auto-synced.',
      cssClasses: 'Custom CSS classes for the widget markup.',
    },
  },
  'ais.hitsPerPage': {
    label: 'Hits Per Page',
    description:
      'A dropdown selector that lets the user choose how many results to display per page.',
    enabled: true,
    icon: HASH_ICON,
    defaultParameters: {
      container: '',
      items: [],
      cssClasses: false,
    },
    fieldOrder: ['container', 'placement', 'items', 'cssClasses'],
    fieldOverrides: {
      items: {
        type: 'items-list',
        label: 'Page sizes',
        fields: [
          {
            key: 'value',
            label: 'Hits per page',
            placeholder: 'e.g. 20',
            inputType: 'number',
          },
          {
            key: 'label',
            label: 'Label',
            placeholder: 'e.g. 20 per page',
          },
        ],
      },
      cssClasses: {
        type: 'object',
        label: 'CSS classes',
        defaultValue: { root: '', select: '', option: '' },
        fields: [
          { key: 'root', label: 'Root' },
          { key: 'select', label: 'Select' },
          { key: 'option', label: 'Option' },
        ],
      },
    },
    paramLabels: {
      container: 'Container',
    },
    paramDescriptions: {
      container:
        'CSS selector for the DOM element to render into (e.g. "#hits-per-page").',
      items:
        'List of page size options, each mapping a number of hits to a display label. The first item is automatically marked as the default.',
      cssClasses: 'Custom CSS classes for the widget markup.',
    },
  },
  'ais.ratingMenu': {
    label: 'Rating Menu',
    description:
      'A star-based rating filter that lets users refine results by minimum rating value.',
    enabled: true,
    icon: STAR_ICON,
    defaultParameters: {
      container: '',
      attribute: '',
      max: undefined,
      cssClasses: undefined,
    },
    fieldOrder: ['container', 'placement', 'attribute', 'max', 'cssClasses'],
    fieldOverrides: {
      max: { type: 'number', label: 'Max rating', placeholder: '5' },
      cssClasses: {
        type: 'object',
        label: 'CSS classes',
        disabledValue: undefined,
        defaultValue: {
          root: '',
          noRefinementRoot: '',
          list: '',
          item: '',
          selectedItem: '',
          disabledItem: '',
          link: '',
          starIcon: '',
          fullStarIcon: '',
          emptyStarIcon: '',
          label: '',
          count: '',
        },
        fields: [
          { key: 'root', label: 'Root' },
          { key: 'noRefinementRoot', label: 'No refinement root' },
          { key: 'list', label: 'List' },
          { key: 'item', label: 'Item' },
          { key: 'selectedItem', label: 'Selected item' },
          { key: 'disabledItem', label: 'Disabled item' },
          { key: 'link', label: 'Link' },
          { key: 'starIcon', label: 'Star icon' },
          { key: 'fullStarIcon', label: 'Full star icon' },
          { key: 'emptyStarIcon', label: 'Empty star icon' },
          { key: 'label', label: 'Label' },
          { key: 'count', label: 'Count' },
        ],
      },
    },
    paramLabels: {
      container: 'Container',
      attribute: 'Attribute',
    },
    paramDescriptions: {
      container:
        'CSS selector for the DOM element to render into (e.g. "#rating").',
      attribute:
        'The name of the numeric attribute that contains ratings (e.g. "rating").',
      max: 'The maximum rating value. Defaults to 5.',
      cssClasses:
        'Custom CSS classes to apply to the widget elements for styling.',
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
    description:
      'A checkbox toggle that filters results by a single faceted boolean attribute (e.g., free shipping).',
    enabled: true,
    icon: TOGGLE_ICON,
    defaultParameters: {
      container: '',
      attribute: '',
      // oxlint-disable-next-line id-length
      on: undefined,
      off: undefined,
      cssClasses: false,
    },
    fieldOrder: [
      'container',
      'placement',
      'attribute',
      'on',
      'off',
      'cssClasses',
    ],
    fieldOverrides: {
      // oxlint-disable-next-line id-length
      on: { type: 'facet-value', label: 'On Value', placeholder: 'true' },
      off: { type: 'facet-value', label: 'Off Value' },
      cssClasses: {
        type: 'object',
        label: 'CSS classes',
        defaultValue: { root: '', label: '', checkbox: '', labelText: '' },
        fields: [
          { key: 'root', label: 'Root' },
          { key: 'label', label: 'Label' },
          { key: 'checkbox', label: 'Checkbox' },
          { key: 'labelText', label: 'Label Text' },
        ],
      },
    },
    paramLabels: {
      container: 'Container',
      attribute: 'Attribute',
      // oxlint-disable-next-line id-length
      on: 'On Value',
      off: 'Off Value',
    },
    paramDescriptions: {
      container:
        'CSS selector for the DOM element to render into (e.g. "#toggle").',
      attribute:
        'The name of the faceted boolean attribute to toggle (e.g. "free_shipping").',
      // oxlint-disable-next-line id-length
      on: 'Value to filter on when the toggle is checked (defaults to "true").',
      off: 'Value to filter on when the toggle is unchecked (defaults to no refinement).',
      cssClasses: 'Custom CSS classes for the widget markup.',
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
  'ais.clearRefinements': {
    label: 'Clear Refinements',
    description:
      'A button that lets users remove all active filters and refinements at once.',
    enabled: true,
    icon: X_ICON,
    defaultParameters: {
      container: '',
      includedAttributes: undefined,
      excludedAttributes: undefined,
      cssClasses: undefined,
    },
    fieldOrder: [
      'container',
      'placement',
      'includedAttributes',
      'excludedAttributes',
      'cssClasses',
    ],
    fieldOverrides: {
      includedAttributes: {
        type: 'list',
        label: 'Included attributes',
        placeholder: 'e.g. brand',
        excludes: 'excludedAttributes',
      },
      excludedAttributes: {
        type: 'list',
        label: 'Excluded attributes',
        placeholder: 'e.g. query',
        excludes: 'includedAttributes',
      },
      cssClasses: {
        type: 'object',
        label: 'CSS classes',
        defaultValue: {
          root: '',
          button: '',
          disabledButton: '',
        },
        disabledValue: undefined,
        fields: [
          { key: 'root', label: 'Root' },
          { key: 'button', label: 'Button' },
          { key: 'disabledButton', label: 'Disabled button' },
        ],
      },
    },
    paramLabels: {
      container: 'Container',
      includedAttributes: 'Included attributes',
      excludedAttributes: 'Excluded attributes',
    },
    paramDescriptions: {
      container:
        'CSS selector for the DOM element to render into (e.g. "#clear-refinements").',
      includedAttributes:
        'Only clear refinements from these attributes. When empty, all refinements are clearable.',
      excludedAttributes: 'Never clear refinements from these attributes.',
      cssClasses:
        'Custom CSS classes to apply to the widget elements for styling.',
    },
  },
  'ais.stats': {
    label: 'Stats',
    description:
      'Displays search result statistics such as the number of hits and processing time.',
    enabled: true,
    icon: TRENDING_ICON,
    defaultParameters: {
      container: '',
      cssClasses: undefined,
    },
    fieldOrder: ['container', 'placement', 'cssClasses'],
    fieldOverrides: {
      cssClasses: {
        type: 'object',
        label: 'CSS classes',
        disabledValue: undefined,
        defaultValue: {
          root: '',
          text: '',
        },
        fields: [
          { key: 'root', label: 'Root' },
          { key: 'text', label: 'Text' },
        ],
      },
    },
    paramLabels: {
      container: 'Container',
    },
    paramDescriptions: {
      container:
        'CSS selector for the DOM element to render into (e.g. "#stats").',
      cssClasses: 'Custom CSS classes to apply to the widget elements.',
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
