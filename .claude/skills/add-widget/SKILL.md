# Add a new widget to the runtime and toolbar

Add support for the InstantSearch.js widget `$ARGUMENTS`.

## Reference

Use the [widget parameter buckets research](https://algolia.atlassian.net/wiki/spaces/AE/pages/6749356043/InstantSearch.js+widget+parameters+Bucket+Categorization) to determine which parameters belong to each bucket (serializable, templates, functions) for this widget.

## Steps

### 1. Register the widget in `packages/runtime/src/experiences/widget.tsx`

- Import the widget factory from `instantsearch.js/es/widgets/<widget-path>/<widget-path>` (check `node_modules/instantsearch.js/es/widgets/` for the exact path — the directory name often uses hyphens where the widget name uses camelCase, e.g., `searchBox` → `search-box`).
- Add the widget key to `$$supportedWidgets` inside the `experience` function, right before the closing `},` of the object.
- For bucket-1-only widgets (all params are serializable), `transformParams` is a passthrough:
  ```ts
  'ais.<widgetName>': {
    widget: <importedWidget>,
    async transformParams(params) {
      return params;
    },
  },
  ```
- For widgets with bucket 2/3 params that need decomposition, model `transformParams` after the existing `ais.chat` or `ais.autocomplete` entries.
- Add TODO comments above the entry listing unsupported parameters by bucket:
  ```ts
  // TODO: Add support for `templates` (<list of template keys>)
  // TODO: Add support for `<functionName>` (bucket 3 — function)
  ```
  Only add TODOs for buckets that have parameters for this widget. Skip if the widget is bucket 1 only.

### 2. Update the type union in `packages/runtime/src/experiences/types.ts`

- Import the widget type from `instantsearch.js/es/widgets/<widget-path>/<widget-path>` (e.g., `SearchBoxWidget`, `PaginationWidget`). Check the actual export name in the source file.
- Add the widget to the `$$supportedWidgets` type in the `ExperienceWidget` type:
  ```ts
  'ais.<widgetName>': SupportedWidget<Parameters<<WidgetType>>[0]>;
  ```
- Add the widget key to the `Record` key union on the same type (the `& Record<... | (string & {}), SupportedWidget>` line).

### 3. Enable the widget in the toolbar (`packages/toolbar/src/widget-types.tsx`)

The widget likely already exists in `WIDGET_TYPES` with `enabled: false`. Update it:

- Set `enabled: true`.
- Add a `description` string (one sentence describing what the widget does — used by the AI assistant).
- Set `defaultParameters` to include `container: ''` plus all bucket 1 params with sensible defaults (empty string for text, `false` for booleans that are off by default, `true` for booleans that are on by default). **Always verify exact param names and defaults from the widget's TypeScript types** in `node_modules/instantsearch.js/es/widgets/` or `node_modules/instantsearch.js/es/connectors/` — do not guess from memory (e.g., it's `showSubmit`/`showReset`, not `showSubmitButton`/`showResetButton`).
- Add `fieldOrder` array listing: `'container'`, `'placement'`, then all other params in logical order.
- Add `fieldOverrides` for non-string params:
  - Boolean params: `{ type: 'switch', label: '<Human-readable label>' }`
  - Object params with enable/disable + sub-fields: `{ type: 'object', label: '...', defaultValue: {...}, fields: [...] }`
- Add `cssClasses` support. Every widget has its own set of CSS classes. Look up the widget's `*CSSClasses` type in the `.d.ts` file to get the exact keys. Add it as:
  - `defaultParameters`: `cssClasses: false` (collapsed by default)
  - `fieldOrder`: add `'cssClasses'` at the end
  - `fieldOverrides`: use the `object` type with all CSS class keys as string fields (see `ais.searchBox` for an example)
  - `paramDescriptions`: one sentence describing what it customizes
- Add `paramLabels` for string params that need human-readable labels (skip booleans — their label comes from `fieldOverrides`).
- Add `paramDescriptions` for all bucket 1 params and `cssClasses` (one sentence each — shown as info tooltips next to field labels in the toolbar UI and used by the AI assistant, so write them for end users).
- Keep the existing `icon` as-is.

### 4. Verify

- Run `npm run build` and confirm no errors.
- Run `npx tsc --noEmit -p packages/runtime/tsconfig.json` and confirm no type errors.
