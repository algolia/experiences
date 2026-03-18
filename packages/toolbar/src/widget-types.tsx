import type { JSX } from 'preact';
import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Hash,
  LayoutGrid,
  List,
  MessageCircle,
  Search,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  ToggleRight,
  TrendingUp,
  ArrowUpDown,
  X,
} from 'lucide-preact';

export type IndexSuggestKind =
  | 'indices'
  | 'indices:replicas'
  | 'indices:qs'
  | 'agentStudioAgents'
  | 'facetAttributes'
  | 'indexAttributes';

export type FieldConfig =
  | { type: 'switch' }
  | { type: 'number'; placeholder?: string }
  | {
      type: 'text';
      placeholder?: string;
      picker?: boolean;
      suggest?: IndexSuggestKind;
    }
  | { type: 'facet-value'; placeholder?: string }
  | { type: 'toggleable-text'; placeholder?: string; picker?: boolean }
  | {
      type: 'select';
      options: Array<{ value: string; label: string }>;
      defaultValue: string;
    }
  | {
      type: 'object';
      defaultValue: Record<string, unknown>;
      disabledValue?: false | undefined;
      fields: Array<{
        key: string;
        label: string;
        suggest?: IndexSuggestKind;
      }>;
    }
  | { type: 'json'; disabledValue?: false | undefined }
  | {
      type: 'items-list';
      fields: Array<{
        key: string;
        label: string;
        placeholder?: string;
        inputType?: 'text' | 'number';
        suggest?: IndexSuggestKind;
      }>;
    }
  | {
      type: 'list';
      placeholder?: string;
      excludes?: string;
      required?: boolean;
      suggest?: IndexSuggestKind;
    }
  | {
      type: 'select-list';
      options: Array<{ value: string; label: string }>;
    }
  | {
      type: 'item-template';
      defaultValue: Record<string, unknown>;
      fields: Array<{ key: string; label: string }>;
    }
  | { type: 'indices-config' }
  | { type: 'suggestions-config' }
  | { type: 'recent-config' };

export type ParamConfig = {
  key: string;
  label?: string;
  description?: string;
  default?: unknown;
  field?: FieldConfig;
  visibleIf?: { key: string; value: unknown };
  hidden?: boolean;
};

export type WidgetTypeConfig = {
  label: string;
  description?: string;
  icon: JSX.Element;
  enabled: boolean;
  indexIndependent?: boolean;
  columns?: number;
  params: ParamConfig[];
};

const ICON_CLASS = 'size-4 shrink-0';

const SEARCH_ICON = <Search class={ICON_CLASS} />;
const CHAT_ICON = <MessageCircle class={ICON_CLASS} />;
const DATABASE_ICON = <Database class={ICON_CLASS} />;
const GRID_ICON = <LayoutGrid class={ICON_CLASS} />;
const LIST_ICON = <List class={ICON_CLASS} />;
const CHEVRON_LEFT_ICON = <ChevronLeft class={ICON_CLASS} />;
const CHEVRON_RIGHT_ICON = <ChevronRight class={ICON_CLASS} />;
const ARROW_DOWN_ICON = <ArrowDown class={ICON_CLASS} />;
const SORT_ICON = <ArrowUpDown class={ICON_CLASS} />;
const HASH_ICON = <Hash class={ICON_CLASS} />;
const SLIDER_ICON = <SlidersHorizontal class={ICON_CLASS} />;
const TOGGLE_ICON = <ToggleRight class={ICON_CLASS} />;
const TRENDING_ICON = <TrendingUp class={ICON_CLASS} />;
const CONFIGURE_ICON = <Settings class={ICON_CLASS} />;
const STAR_ICON = <Star class={ICON_CLASS} />;
const CART_ICON = <ShoppingCart class={ICON_CLASS} />;
const X_ICON = <X class={ICON_CLASS} />;

const ITEM_TEMPLATE_DEFAULT = {
  name: '',
  category: '',
  description: '',
  image: '',
  price: '',
  currency: '',
};

const ITEM_TEMPLATE_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'image', label: 'Image' },
  { key: 'price', label: 'Price' },
  { key: 'currency', label: 'Currency' },
];

export const WIDGET_TYPES: Record<string, WidgetTypeConfig> = {
  'ais.autocomplete': {
    label: 'Autocomplete',
    description:
      'A search-as-you-type dropdown that shows results, suggestions, and recent searches as the user types.',
    enabled: true,
    indexIndependent: true,
    icon: SEARCH_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#search").',
        default: '',
      },
      {
        key: 'showRecent',
        label: 'Recent Searches',
        description:
          "When enabled, shows the user's recent searches below the input.",
        default: false,
        field: { type: 'recent-config' },
      },
      {
        key: 'showQuerySuggestions',
        label: 'Suggestions',
        description:
          'When enabled, shows query suggestions from a dedicated suggestions index. Requires an indexName, a searchPageUrl, and a query parameter name.',
        default: false,
        field: { type: 'suggestions-config' },
      },
      {
        key: 'indices',
        label: 'Indices',
        description:
          'Additional indices to search, each rendered as a separate section in the dropdown.',
        default: [],
        field: { type: 'indices-config' },
      },
      {
        key: 'detachedMediaQuery',
        label: 'Display mode',
        description:
          'Dropdown shows results below the search input. Dialog opens a full overlay, always using detached mode.',
        field: {
          type: 'select',
          options: [
            { value: '', label: 'Dropdown' },
            { value: '(min-width: 0)', label: 'Dialog' },
          ],
          defaultValue: '',
        },
      },
      {
        key: 'panelLayout',
        label: 'Panel layout',
        description:
          'Controls the panel layout. Two columns puts suggestions and recent searches on the left, and indices on the right.',
        default: 'one-column',
        field: {
          type: 'select',
          options: [
            { value: 'one-column', label: 'One column' },
            { value: 'two-columns', label: 'Two columns' },
          ],
          defaultValue: 'one-column',
        },
      },
    ],
  },
  'ais.chat': {
    label: 'Chat',
    description:
      'A conversational AI chat widget powered by an Algolia Agent Studio agent.',
    enabled: true,
    indexIndependent: true,
    icon: CHAT_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#chat").',
        default: '',
      },
      { key: 'placement', default: 'body' },
      {
        key: 'agentId',
        label: 'Agent ID',
        description:
          'The ID of the Algolia Agent Studio agent to power the chat.',
        default: '',
        field: { type: 'text', suggest: 'agentStudioAgents' },
      },
      {
        key: 'template',
        label: 'Template',
        description:
          'Maps Algolia record attributes to display roles for rendering items.',
        default: ITEM_TEMPLATE_DEFAULT,
        field: {
          type: 'item-template',
          defaultValue: ITEM_TEMPLATE_DEFAULT,
          fields: ITEM_TEMPLATE_FIELDS,
        },
      },
    ],
  },
  'ais.index': {
    label: 'Index',
    description:
      'Scopes child widgets to a specific Algolia index. Required for search widgets.',
    enabled: true,
    indexIndependent: true,
    icon: DATABASE_ICON,
    columns: 2,
    params: [
      {
        key: 'indexName',
        label: 'Index Name',
        description: 'The Algolia index or composition ID to search.',
        default: '',
        field: { type: 'text', suggest: 'indices' },
      },
      {
        key: 'indexId',
        label: 'Index ID',
        description:
          'Optional identifier when using multiple indices with the same name.',
        default: undefined,
        field: { type: 'text' },
      },
    ],
  },
  'ais.configure': {
    label: 'Configure',
    description:
      'A headless widget that sets default Algolia search parameters without rendering any UI.',
    enabled: true,
    icon: CONFIGURE_ICON,
    params: [
      { key: 'container', default: '', hidden: true },
      { key: 'placement', default: 'body', hidden: true },
      {
        key: 'searchParameters',
        label: 'Search parameters',
        description:
          'Algolia search parameters as JSON (e.g. {"hitsPerPage": 20, "filters": "category:Books"}).',
        default: {},
        field: { type: 'json' },
      },
    ],
  },
  'ais.hits': {
    label: 'Hits',
    description:
      'Displays the list of search results (hits) matching the current query.',
    enabled: true,
    icon: GRID_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#hits").',
        default: '',
      },
      {
        key: 'escapeHTML',
        label: 'Escape HTML',
        description:
          'When enabled, escapes HTML tags in hit string values to prevent XSS.',
        default: true,
        field: { type: 'switch' },
      },
      {
        key: 'template',
        label: 'Template',
        description:
          'Maps Algolia record attributes to display roles for rendering items.',
        default: ITEM_TEMPLATE_DEFAULT,
        field: {
          type: 'item-template',
          defaultValue: ITEM_TEMPLATE_DEFAULT,
          fields: ITEM_TEMPLATE_FIELDS,
        },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description:
          'Custom CSS classes to apply to specific parts of the widget.',
        default: undefined,
        field: {
          type: 'object',
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
    ],
  },
  'ais.searchBox': {
    label: 'Search Box',
    description: 'A search input with submit, reset, and loading indicators.',
    enabled: true,
    icon: SEARCH_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#search-box").',
        default: '',
      },
      {
        key: 'placeholder',
        label: 'Placeholder',
        description: 'Placeholder text shown in the search input.',
        default: undefined,
        field: { type: 'text' },
      },
      {
        key: 'autofocus',
        label: 'Autofocus',
        description: 'Whether the input should be focused on page load.',
        default: false,
        field: { type: 'switch' },
      },
      {
        key: 'searchAsYouType',
        label: 'Search as you type',
        description:
          'When enabled, triggers a search on each keystroke. When disabled, searches only on submit.',
        default: true,
        field: { type: 'switch' },
      },
      {
        key: 'ignoreCompositionEvents',
        label: 'Ignore composition events',
        description:
          'When enabled, ignores IME composition events for CJK input.',
        default: false,
        field: { type: 'switch' },
      },
      {
        key: 'showLoadingIndicator',
        label: 'Show loading indicator',
        description:
          'Whether to show a loading indicator while results are being fetched.',
        default: true,
        field: { type: 'switch' },
      },
      {
        key: 'showSubmit',
        label: 'Show submit button',
        description: 'Whether to show the submit button.',
        default: true,
        field: { type: 'switch' },
      },
      {
        key: 'showReset',
        label: 'Show reset button',
        description: 'Whether to show the reset button.',
        default: true,
        field: { type: 'switch' },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description: 'CSS classes to apply to the widget DOM elements.',
        default: undefined,
        field: {
          type: 'object',
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
    ],
  },
  'ais.refinementList': {
    label: 'Refinement List',
    description:
      'A filterable list of facet values that lets users refine search results by selecting one or more attributes.',
    enabled: true,
    icon: LIST_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#refinement-list").',
        default: '',
      },
      {
        key: 'attribute',
        label: 'Attribute',
        description: 'The facet attribute to display (e.g. "brand").',
        default: '',
        field: {
          type: 'text',
          placeholder: 'e.g. brand',
          suggest: 'facetAttributes',
        },
      },
      {
        key: 'operator',
        label: 'Operator',
        description:
          'How multiple selections combine: "and" requires all, "or" requires any. Defaults to "or".',
        default: undefined,
        field: {
          type: 'select',
          options: [
            { value: 'or', label: 'or' },
            { value: 'and', label: 'and' },
          ],
          defaultValue: 'or',
        },
      },
      {
        key: 'sortBy',
        label: 'Sort by',
        description:
          'Ordered list of sort criteria. Available values: "count:asc", "count:desc", "name:asc", "name:desc", "isRefined:asc", "isRefined:desc".',
        default: undefined,
        field: {
          type: 'select-list',
          options: [
            { value: 'count:asc', label: 'Count (asc)' },
            { value: 'count:desc', label: 'Count (desc)' },
            { value: 'name:asc', label: 'Name (asc)' },
            { value: 'name:desc', label: 'Name (desc)' },
            { value: 'isRefined:asc', label: 'Is refined (asc)' },
            { value: 'isRefined:desc', label: 'Is refined (desc)' },
          ],
        },
      },
      {
        key: 'limit',
        label: 'Limit',
        description:
          'Maximum number of facet values to display. Defaults to 10.',
        default: undefined,
        field: { type: 'number', placeholder: '10' },
      },
      {
        key: 'showMore',
        label: 'Show more',
        description:
          'When enabled, shows a "Show more" button to reveal additional facet values.',
        default: false,
        field: { type: 'switch' },
      },
      {
        key: 'showMoreLimit',
        label: 'Show more limit',
        description:
          'Maximum number of facet values when "Show more" is expanded. Defaults to 20.',
        default: undefined,
        field: { type: 'number', placeholder: '20' },
        visibleIf: { key: 'showMore', value: true },
      },
      {
        key: 'searchable',
        label: 'Searchable',
        description:
          'When enabled, adds a search field to filter within the facet values.',
        default: false,
        field: { type: 'switch' },
      },
      {
        key: 'searchablePlaceholder',
        label: 'Search placeholder',
        description:
          'Placeholder text for the search field. Defaults to "Search...".',
        default: undefined,
        field: { type: 'text', placeholder: 'Search...' },
        visibleIf: { key: 'searchable', value: true },
      },
      {
        key: 'searchableIsAlwaysActive',
        label: 'Search always active',
        description:
          'When disabled, the search field becomes inactive if fewer items are shown than the limit.',
        default: true,
        field: { type: 'switch' },
        visibleIf: { key: 'searchable', value: true },
      },
      {
        key: 'searchableEscapeFacetValues',
        label: 'Escape search facet values',
        description:
          'When enabled, escapes the facet values returned from Algolia during search.',
        default: true,
        field: { type: 'switch' },
        visibleIf: { key: 'searchable', value: true },
      },
      {
        key: 'searchableSelectOnSubmit',
        label: 'Select on submit',
        description:
          'When enabled, submitting the search selects the first item in the list.',
        default: undefined,
        field: { type: 'switch' },
        visibleIf: { key: 'searchable', value: true },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description:
          'Custom CSS classes to apply to the widget elements for styling.',
        default: undefined,
        field: {
          type: 'object',
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
    ],
  },
  'ais.menu': {
    label: 'Menu',
    description:
      'A single-select facet list that lets users filter results by choosing one value from a given attribute.',
    enabled: true,
    icon: LIST_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#menu").',
        default: '',
      },
      {
        key: 'attribute',
        label: 'Attribute',
        description: 'The facet attribute to display (e.g. "category").',
        default: '',
        field: {
          type: 'text',
          placeholder: 'e.g. categories',
          suggest: 'facetAttributes',
        },
      },
      {
        key: 'limit',
        label: 'Limit',
        description:
          'Maximum number of facet values to display. Defaults to 10.',
        default: undefined,
        field: { type: 'number', placeholder: '10' },
      },
      {
        key: 'showMore',
        label: 'Show more',
        description:
          'When enabled, shows a "Show more" button to reveal additional facet values.',
        default: false,
        field: { type: 'switch' },
      },
      {
        key: 'showMoreLimit',
        label: 'Show more limit',
        description:
          'Maximum number of facet values when "Show more" is expanded. Defaults to 20.',
        default: undefined,
        field: { type: 'number', placeholder: '20' },
        visibleIf: { key: 'showMore', value: true },
      },
      {
        key: 'sortBy',
        label: 'Sort by',
        description:
          'Ordered list of sort criteria. Available values: "count:asc", "count:desc", "name:asc", "name:desc", "isRefined:asc", "isRefined:desc".',
        default: undefined,
        field: {
          type: 'select-list',
          options: [
            { value: 'count:asc', label: 'Count (asc)' },
            { value: 'count:desc', label: 'Count (desc)' },
            { value: 'name:asc', label: 'Name (asc)' },
            { value: 'name:desc', label: 'Name (desc)' },
            { value: 'isRefined:asc', label: 'Is refined (asc)' },
            { value: 'isRefined:desc', label: 'Is refined (desc)' },
          ],
        },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description:
          'Custom CSS classes to apply to the widget elements for styling.',
        default: undefined,
        field: {
          type: 'object',
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
    ],
  },
  'ais.pagination': {
    label: 'Pagination',
    description:
      'A page navigation widget that lets users browse through paginated search results.',
    enabled: true,
    icon: CHEVRON_LEFT_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#pagination").',
        default: '',
      },
      {
        key: 'totalPages',
        label: 'Total Pages',
        description: 'Maximum number of pages to browse.',
        default: undefined,
        field: { type: 'number' },
      },
      {
        key: 'padding',
        label: 'Padding',
        description:
          'Number of pages to display on each side of the current page.',
        default: undefined,
        field: { type: 'number', placeholder: '3' },
      },
      {
        key: 'scrollTo',
        label: 'Scroll to',
        description:
          'CSS selector to scroll to after a page click. When enabled without a value, scrolls to body. Disable to prevent scrolling.',
        default: undefined,
        field: {
          type: 'toggleable-text',
          placeholder: 'body',
          picker: true,
        },
      },
      {
        key: 'showFirst',
        label: 'Show first page',
        description: 'When enabled, shows a link to the first page.',
        default: true,
        field: { type: 'switch' },
      },
      {
        key: 'showLast',
        label: 'Show last page',
        description: 'When enabled, shows a link to the last page.',
        default: true,
        field: { type: 'switch' },
      },
      {
        key: 'showPrevious',
        label: 'Show previous page',
        description: 'When enabled, shows a link to the previous page.',
        default: true,
        field: { type: 'switch' },
      },
      {
        key: 'showNext',
        label: 'Show next page',
        description: 'When enabled, shows a link to the next page.',
        default: true,
        field: { type: 'switch' },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description: 'Custom CSS classes for pagination elements.',
        default: undefined,
        field: {
          type: 'object',
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
    ],
  },
  'ais.infiniteHits': {
    label: 'Infinite Hits',
    description:
      'Displays search results with a "Show more" button to load additional pages incrementally.',
    enabled: true,
    icon: ARROW_DOWN_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#infinite-hits").',
        default: '',
      },
      {
        key: 'escapeHTML',
        label: 'Escape HTML',
        description:
          'When enabled, escapes HTML entities in hit string values for safety.',
        default: true,
        field: { type: 'switch' },
      },
      {
        key: 'showPrevious',
        label: 'Show previous',
        description:
          'When enabled, shows a button to load previous results above the list.',
        default: false,
        field: { type: 'switch' },
      },
      {
        key: 'template',
        label: 'Template',
        description:
          'Maps Algolia record attributes to display roles for rendering items.',
        default: ITEM_TEMPLATE_DEFAULT,
        field: {
          type: 'item-template',
          defaultValue: ITEM_TEMPLATE_DEFAULT,
          fields: ITEM_TEMPLATE_FIELDS,
        },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description: 'Custom CSS classes to apply to the widget elements.',
        default: undefined,
        field: {
          type: 'object',
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
    ],
  },
  'ais.sortBy': {
    label: 'Sort By',
    description:
      'A dropdown selector that lets the user switch between different sort orders (replica indices or sorting strategies).',
    enabled: true,
    icon: SORT_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#sort").',
        default: '',
      },
      {
        key: 'items',
        label: 'Sort options',
        description:
          'List of sort options, each mapping a replica index name to a display label. The first item always targets the parent index (default sort) and its value is auto-synced.',
        default: [{ value: '', label: 'Default' }],
        field: {
          type: 'items-list',
          fields: [
            {
              key: 'value',
              label: 'Index name',
              placeholder: 'e.g. products_price_asc',
              suggest: 'indices:replicas',
            },
            {
              key: 'label',
              label: 'Label',
              placeholder: 'e.g. Price (ascending)',
            },
          ],
        },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description: 'Custom CSS classes for the widget markup.',
        default: false,
        field: {
          type: 'object',
          defaultValue: { root: '', select: '', option: '' },
          fields: [
            { key: 'root', label: 'Root' },
            { key: 'select', label: 'Select' },
            { key: 'option', label: 'Option' },
          ],
        },
      },
    ],
  },
  'ais.hitsPerPage': {
    label: 'Hits Per Page',
    description:
      'A dropdown selector that lets the user choose how many results to display per page.',
    enabled: true,
    icon: HASH_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#hits-per-page").',
        default: '',
      },
      {
        key: 'items',
        label: 'Page sizes',
        description:
          'List of page size options, each mapping a number of hits to a display label. The first item is automatically marked as the default.',
        default: [],
        field: {
          type: 'items-list',
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
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description: 'Custom CSS classes for the widget markup.',
        default: false,
        field: {
          type: 'object',
          defaultValue: { root: '', select: '', option: '' },
          fields: [
            { key: 'root', label: 'Root' },
            { key: 'select', label: 'Select' },
            { key: 'option', label: 'Option' },
          ],
        },
      },
    ],
  },
  'ais.ratingMenu': {
    label: 'Rating Menu',
    description:
      'A star-based rating filter that lets users refine results by minimum rating value.',
    enabled: true,
    icon: STAR_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#rating").',
        default: '',
      },
      {
        key: 'attribute',
        label: 'Attribute',
        description:
          'The name of the numeric attribute that contains ratings (e.g. "rating").',
        default: '',
        field: {
          type: 'text',
          placeholder: 'e.g. rating',
          suggest: 'facetAttributes',
        },
      },
      {
        key: 'max',
        label: 'Max rating',
        description: 'The maximum rating value. Defaults to 5.',
        default: undefined,
        field: { type: 'number', placeholder: '5' },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description:
          'Custom CSS classes to apply to the widget elements for styling.',
        default: undefined,
        field: {
          type: 'object',
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
    ],
  },
  'ais.numericMenu': {
    label: 'Numeric Menu',
    description:
      'A list of numeric ranges that lets users filter results by selecting a price range, rating, or other numeric attribute.',
    enabled: true,
    icon: HASH_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#numeric-menu").',
        default: '',
      },
      {
        key: 'attribute',
        label: 'Attribute',
        description: 'The numeric attribute to filter on (e.g. "price").',
        default: '',
        field: {
          type: 'text',
          placeholder: 'e.g. price',
          suggest: 'facetAttributes',
        },
      },
      {
        key: 'items',
        label: 'Ranges',
        description:
          'List of numeric ranges, each with a label and optional min/max bounds. Omit min for "up to X", omit max for "X and above", omit both for "All".',
        default: [],
        field: {
          type: 'items-list',
          fields: [
            {
              key: 'label',
              label: 'Label',
              placeholder: 'e.g. All',
            },
            {
              key: 'start',
              label: 'Min (>=)',
              placeholder: 'No min',
              inputType: 'number',
            },
            {
              key: 'end',
              label: 'Max (<=)',
              placeholder: 'No max',
              inputType: 'number',
            },
          ],
        },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description:
          'Custom CSS classes to apply to the widget elements for styling.',
        default: undefined,
        field: {
          type: 'object',
          disabledValue: undefined,
          defaultValue: {
            root: '',
            noRefinementRoot: '',
            list: '',
            item: '',
            selectedItem: '',
            label: '',
            labelText: '',
            radio: '',
          },
          fields: [
            { key: 'root', label: 'Root' },
            { key: 'noRefinementRoot', label: 'No refinement root' },
            { key: 'list', label: 'List' },
            { key: 'item', label: 'Item' },
            { key: 'selectedItem', label: 'Selected item' },
            { key: 'label', label: 'Label' },
            { key: 'labelText', label: 'Label text' },
            { key: 'radio', label: 'Radio' },
          ],
        },
      },
    ],
  },
  'ais.currentRefinements': {
    label: 'Current Refinements',
    description:
      'Displays the list of currently active filters and refinements with the ability to remove them individually.',
    enabled: true,
    icon: LIST_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#current-refinements").',
        default: '',
      },
      {
        key: 'includedAttributes',
        label: 'Included attributes',
        description:
          'Only show refinements from these attributes. When empty, all refinements are shown.',
        default: undefined,
        field: {
          type: 'list',
          placeholder: 'e.g. brand',
          excludes: 'excludedAttributes',
          suggest: 'facetAttributes',
        },
      },
      {
        key: 'excludedAttributes',
        label: 'Excluded attributes',
        description:
          'Hide refinements from these attributes. Defaults to hiding the query.',
        default: undefined,
        field: {
          type: 'list',
          placeholder: 'e.g. query',
          excludes: 'includedAttributes',
          suggest: 'facetAttributes',
        },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description:
          'Custom CSS classes to apply to the widget elements for styling.',
        default: undefined,
        field: {
          type: 'object',
          disabledValue: undefined,
          defaultValue: {
            root: '',
            noRefinementRoot: '',
            list: '',
            item: '',
            label: '',
            category: '',
            categoryLabel: '',
            delete: '',
          },
          fields: [
            { key: 'root', label: 'Root' },
            { key: 'noRefinementRoot', label: 'No refinement root' },
            { key: 'list', label: 'List' },
            { key: 'item', label: 'Item' },
            { key: 'label', label: 'Label' },
            { key: 'category', label: 'Category' },
            { key: 'categoryLabel', label: 'Category label' },
            { key: 'delete', label: 'Delete' },
          ],
        },
      },
    ],
  },
  'ais.breadcrumb': {
    label: 'Breadcrumb',
    description:
      'A navigation trail showing the hierarchy of the current refinement, letting users navigate back to parent levels.',
    enabled: true,
    icon: CHEVRON_RIGHT_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#breadcrumb").',
        default: '',
      },
      {
        key: 'attributes',
        label: 'Attributes',
        description:
          'Array of attributes to use to generate the hierarchy, one per level (e.g. "hierarchicalCategories.lvl0", "hierarchicalCategories.lvl1").',
        default: [],
        field: {
          type: 'list',
          placeholder: 'e.g. hierarchicalCategories.lvl0',
          required: true,
          suggest: 'indexAttributes',
        },
      },
      {
        key: 'separator',
        label: 'Separator',
        description:
          'The character used to separate hierarchy levels in the records. Defaults to " > ".',
        default: undefined,
        field: { type: 'text', placeholder: ' > ' },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description:
          'Custom CSS classes to apply to the widget elements for styling.',
        default: undefined,
        field: {
          type: 'object',
          disabledValue: undefined,
          defaultValue: {
            root: '',
            noRefinementRoot: '',
            list: '',
            item: '',
            selectedItem: '',
            separator: '',
            link: '',
          },
          fields: [
            { key: 'root', label: 'Root' },
            { key: 'noRefinementRoot', label: 'No refinement root' },
            { key: 'list', label: 'List' },
            { key: 'item', label: 'Item' },
            { key: 'selectedItem', label: 'Selected item' },
            { key: 'separator', label: 'Separator' },
            { key: 'link', label: 'Link' },
          ],
        },
      },
    ],
  },
  'ais.hierarchicalMenu': {
    label: 'Hierarchical Menu',
    description:
      'A hierarchical facet navigation that lets users drill down through nested category levels.',
    enabled: true,
    icon: CHEVRON_RIGHT_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#hierarchical-menu").',
        default: '',
      },
      {
        key: 'attributes',
        label: 'Attributes',
        description:
          'Ordered list of attribute names for each hierarchy level (e.g. "categories.lvl0", "categories.lvl1").',
        default: [],
        field: {
          type: 'list',
          placeholder: 'e.g. categories.lvl0',
          required: true,
          suggest: 'indexAttributes',
        },
      },
      {
        key: 'separator',
        label: 'Separator',
        description:
          'Character used to split hierarchy values in each attribute. Defaults to " > ".',
        default: undefined,
        field: { type: 'text', placeholder: ' > ' },
      },
      {
        key: 'showParentLevel',
        label: 'Show parent level',
        description:
          'When enabled, shows the parent level alongside the current refinement.',
        default: true,
        field: { type: 'switch' },
      },
      {
        key: 'limit',
        label: 'Limit',
        description:
          'Maximum number of facet values to display. Defaults to 10.',
        default: undefined,
        field: { type: 'number', placeholder: '10' },
      },
      {
        key: 'showMore',
        label: 'Show more',
        description:
          'When enabled, shows a "Show more" button to reveal additional facet values.',
        default: false,
        field: { type: 'switch' },
      },
      {
        key: 'showMoreLimit',
        label: 'Show more limit',
        description:
          'Maximum number of facet values when "Show more" is expanded. Defaults to 20.',
        default: undefined,
        field: { type: 'number', placeholder: '20' },
        visibleIf: { key: 'showMore', value: true },
      },
      {
        key: 'sortBy',
        label: 'Sort by',
        description:
          'Ordered list of sort criteria. Available values: "count:asc", "count:desc", "name:asc", "name:desc", "isRefined:asc", "isRefined:desc".',
        default: undefined,
        field: {
          type: 'select-list',
          options: [
            { value: 'count:asc', label: 'Count (asc)' },
            { value: 'count:desc', label: 'Count (desc)' },
            { value: 'name:asc', label: 'Name (asc)' },
            { value: 'name:desc', label: 'Name (desc)' },
            { value: 'isRefined:asc', label: 'Is refined (asc)' },
            { value: 'isRefined:desc', label: 'Is refined (desc)' },
          ],
        },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description:
          'Custom CSS classes to apply to the widget elements for styling.',
        default: undefined,
        field: {
          type: 'object',
          defaultValue: {
            root: '',
            noRefinementRoot: '',
            list: '',
            childList: '',
            item: '',
            selectedItem: '',
            parentItem: '',
            link: '',
            selectedItemLink: '',
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
            { key: 'childList', label: 'Child list' },
            { key: 'item', label: 'Item' },
            { key: 'selectedItem', label: 'Selected item' },
            { key: 'parentItem', label: 'Parent item' },
            { key: 'link', label: 'Link' },
            { key: 'selectedItemLink', label: 'Selected item link' },
            { key: 'label', label: 'Label' },
            { key: 'count', label: 'Count' },
            { key: 'showMore', label: 'Show more' },
            { key: 'disabledShowMore', label: 'Disabled show more' },
          ],
        },
      },
    ],
  },
  'ais.rangeSlider': {
    label: 'Range Slider',
    description:
      'A draggable slider that lets users filter results by a numeric range (e.g., price).',
    enabled: true,
    icon: SLIDER_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#price-range").',
        default: '',
      },
      {
        key: 'attribute',
        label: 'Attribute',
        description:
          'The name of the numeric attribute to filter on (e.g. "price").',
        default: '',
        field: {
          type: 'text',
          placeholder: 'e.g. price',
          suggest: 'facetAttributes',
        },
      },
      {
        key: 'min',
        label: 'Min',
        description:
          'Minimum slider value. Defaults to the lowest value in the result set.',
        default: undefined,
        field: { type: 'number', placeholder: 'Auto' },
      },
      {
        key: 'max',
        label: 'Max',
        description:
          'Maximum slider value. Defaults to the highest value in the result set.',
        default: undefined,
        field: { type: 'number', placeholder: 'Auto' },
      },
      {
        key: 'step',
        label: 'Step',
        description: 'The number of steps between each slider handle movement.',
        default: undefined,
        field: { type: 'number', placeholder: '1' },
      },
      {
        key: 'precision',
        label: 'Precision',
        description: 'Number of digits after the decimal point. Defaults to 0.',
        default: undefined,
        field: { type: 'number', placeholder: '0' },
      },
      {
        key: 'pips',
        label: 'Show pips',
        description: 'Whether to show reference marks along the slider track.',
        default: true,
        field: { type: 'switch' },
      },
      {
        key: 'tooltips',
        label: 'Show tooltips',
        description: 'Whether to show value tooltips above the slider handles.',
        default: true,
        field: { type: 'switch' },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description:
          'Custom CSS classes to apply to the widget elements for styling.',
        default: undefined,
        field: {
          type: 'object',
          disabledValue: undefined,
          defaultValue: { root: '', disabledRoot: '' },
          fields: [
            { key: 'root', label: 'Root' },
            { key: 'disabledRoot', label: 'Disabled root' },
          ],
        },
      },
    ],
  },
  'ais.rangeInput': {
    label: 'Range Input',
    description:
      'A numeric range filter with min and max text inputs that lets users refine results within a value range.',
    enabled: true,
    icon: SLIDER_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#range").',
        default: '',
      },
      {
        key: 'attribute',
        label: 'Attribute',
        description:
          'The name of the numeric attribute to filter on (e.g. "price").',
        default: '',
        field: {
          type: 'text',
          placeholder: 'e.g. price',
          suggest: 'facetAttributes',
        },
      },
      {
        key: 'min',
        label: 'Min',
        description:
          'Minimum value for the range. When empty, computed automatically from the result set.',
        default: undefined,
        field: { type: 'number', placeholder: 'Auto' },
      },
      {
        key: 'max',
        label: 'Max',
        description:
          'Maximum value for the range. When empty, computed automatically from the result set.',
        default: undefined,
        field: { type: 'number', placeholder: 'Auto' },
      },
      {
        key: 'precision',
        label: 'Precision',
        description:
          'Number of digits after the decimal point. Defaults to 0 (integers only).',
        default: undefined,
        field: { type: 'number', placeholder: '0' },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description:
          'Custom CSS classes to apply to the widget elements for styling.',
        default: undefined,
        field: {
          type: 'object',
          disabledValue: undefined,
          defaultValue: {
            root: '',
            noRefinement: '',
            form: '',
            label: '',
            input: '',
            inputMin: '',
            separator: '',
            inputMax: '',
            submit: '',
          },
          fields: [
            { key: 'root', label: 'Root' },
            { key: 'noRefinement', label: 'No refinement' },
            { key: 'form', label: 'Form' },
            { key: 'label', label: 'Label' },
            { key: 'input', label: 'Input' },
            { key: 'inputMin', label: 'Input min' },
            { key: 'separator', label: 'Separator' },
            { key: 'inputMax', label: 'Input max' },
            { key: 'submit', label: 'Submit' },
          ],
        },
      },
    ],
  },
  'ais.toggleRefinement': {
    label: 'Toggle Refinement',
    description:
      'A checkbox toggle that filters results by a single faceted boolean attribute (e.g., free shipping).',
    enabled: true,
    icon: TOGGLE_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#toggle").',
        default: '',
      },
      {
        key: 'attribute',
        label: 'Attribute',
        description:
          'The name of the faceted boolean attribute to toggle (e.g. "free_shipping").',
        default: '',
        field: {
          type: 'text',
          placeholder: 'e.g. free_shipping',
          suggest: 'facetAttributes',
        },
      },
      {
        // oxlint-disable-next-line id-length
        key: 'on',
        label: 'On Value',
        description:
          'Value to filter on when the toggle is checked (defaults to "true").',
        default: undefined,
        field: { type: 'facet-value', placeholder: 'true' },
      },
      {
        key: 'off',
        label: 'Off Value',
        description:
          'Value to filter on when the toggle is unchecked (defaults to no refinement).',
        default: undefined,
        field: { type: 'facet-value' },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description: 'Custom CSS classes for the widget markup.',
        default: false,
        field: {
          type: 'object',
          defaultValue: { root: '', label: '', checkbox: '', labelText: '' },
          fields: [
            { key: 'root', label: 'Root' },
            { key: 'label', label: 'Label' },
            { key: 'checkbox', label: 'Checkbox' },
            { key: 'labelText', label: 'Label Text' },
          ],
        },
      },
    ],
  },
  'ais.trendingItems': {
    label: 'Trending Items',
    description:
      'Displays trending items from the Algolia Recommend API based on popularity.',
    enabled: true,
    icon: TRENDING_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#trending").',
        default: '',
      },
      {
        key: 'limit',
        label: 'Limit',
        description: 'Maximum number of trending items to display.',
        default: undefined,
        field: { type: 'number', placeholder: 'Auto' },
      },
      {
        key: 'threshold',
        label: 'Threshold',
        description:
          'Confidence score threshold between 0 and 100 for filtering recommendations.',
        default: undefined,
        field: { type: 'number', placeholder: '0' },
      },
      {
        key: 'facetName',
        label: 'Facet name',
        description:
          'Facet attribute to scope trending items to (e.g. "category").',
        default: undefined,
        field: { type: 'text', placeholder: 'e.g. category' },
      },
      {
        key: 'facetValue',
        label: 'Facet value',
        description:
          'Specific facet value to scope trending items to (e.g. "Shoes").',
        default: undefined,
        field: { type: 'text', placeholder: 'e.g. Shoes' },
      },
      {
        key: 'escapeHTML',
        label: 'Escape HTML',
        description:
          'Whether to escape HTML entities in item values for security.',
        default: true,
        field: { type: 'switch' },
      },
      {
        key: 'template',
        label: 'Template',
        description:
          'Maps Algolia record attributes to display roles for rendering items.',
        default: ITEM_TEMPLATE_DEFAULT,
        field: {
          type: 'item-template',
          defaultValue: ITEM_TEMPLATE_DEFAULT,
          fields: ITEM_TEMPLATE_FIELDS,
        },
      },
      {
        key: 'carouselLayout',
        label: 'Carousel layout',
        default: true,
        field: { type: 'switch' },
      },
      {
        key: 'queryParameters',
        label: 'Query parameters',
        description:
          'Additional Algolia search parameters as JSON (e.g. {"filters": "category:Books"}).',
        default: undefined,
        field: { type: 'json', disabledValue: undefined },
      },
      {
        key: 'fallbackParameters',
        label: 'Fallback parameters',
        description:
          'Fallback Algolia search parameters used when there are no recommendations.',
        default: undefined,
        field: { type: 'json', disabledValue: undefined },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description: 'Custom CSS classes for the widget markup.',
        default: undefined,
        field: {
          type: 'object',
          disabledValue: undefined,
          defaultValue: {
            root: '',
            emptyRoot: '',
            title: '',
            container: '',
            list: '',
            item: '',
          },
          fields: [
            { key: 'root', label: 'Root' },
            { key: 'emptyRoot', label: 'Empty root' },
            { key: 'title', label: 'Title' },
            { key: 'container', label: 'Container' },
            { key: 'list', label: 'List' },
            { key: 'item', label: 'Item' },
          ],
        },
      },
    ],
  },
  'ais.clearRefinements': {
    label: 'Clear Refinements',
    description:
      'A button that lets users remove all active filters and refinements at once.',
    enabled: true,
    icon: X_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#clear-refinements").',
        default: '',
      },
      {
        key: 'includedAttributes',
        label: 'Included attributes',
        description:
          'Only clear refinements from these attributes. When empty, all refinements are clearable.',
        default: undefined,
        field: {
          type: 'list',
          placeholder: 'e.g. brand',
          excludes: 'excludedAttributes',
          suggest: 'facetAttributes',
        },
      },
      {
        key: 'excludedAttributes',
        label: 'Excluded attributes',
        description: 'Never clear refinements from these attributes.',
        default: undefined,
        field: {
          type: 'list',
          placeholder: 'e.g. query',
          excludes: 'includedAttributes',
          suggest: 'facetAttributes',
        },
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description:
          'Custom CSS classes to apply to the widget elements for styling.',
        default: undefined,
        field: {
          type: 'object',
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
    ],
  },
  'ais.stats': {
    label: 'Stats',
    description:
      'Displays search result statistics such as the number of hits and processing time.',
    enabled: true,
    icon: TRENDING_ICON,
    params: [
      {
        key: 'container',
        label: 'Container',
        description:
          'CSS selector for the DOM element to render into (e.g. "#stats").',
        default: '',
      },
      {
        key: 'cssClasses',
        label: 'CSS classes',
        description: 'Custom CSS classes to apply to the widget elements.',
        default: undefined,
        field: {
          type: 'object',
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
    ],
  },
  'ais.frequentlyBoughtTogether': {
    label: 'Frequently Bought Together',
    enabled: false,
    icon: CART_ICON,
    params: [{ key: 'container', default: '' }],
  },
};
