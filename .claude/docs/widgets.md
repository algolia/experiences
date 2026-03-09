# Widgets

The toolbar renders widget parameters using field overrides defined in `packages/toolbar/src/widget-types.tsx`. Each override maps a parameter to a UI field component in `BlockEditor`.

## Principles

- **Prefer `undefined` over redundant defaults.** Optional params (numbers, text) should default to `undefined` and show the library default as a `placeholder`. Clearing a field sends `undefined` so InstantSearch applies its own default. This avoids storing redundant values in the API.
- **Booleans are always-on.** Switches are binary — there's no "unset" state. Default to the library default (`true` or `false`).
- **Some params have a meaningful "off" distinct from "use the default".** When a param can be explicitly disabled (e.g., `scrollTo: false` disables scrolling, vs. `undefined` which scrolls to `body`), use a toggleable field (`toggleable-text`, or `object` with `disabledValue`). OFF sends `false` (or a custom `disabledValue`), ON sends the value or `undefined`. Use `'disabledValue' in override` (not `??`) to distinguish "not set" from "explicitly `undefined`".
- **Fields must render even when the param is absent from the API response.** `fieldOrder` filters via `key in parameters || key in overrides`, so a field override is enough to make a field visible.
- **Compose field components from primitives.** When a field needs extra UI (like a picker button next to an input), create a composed component from primitives (`Label`, `Input`, etc.) rather than adding feature-specific props to a generic field component.

## Tests

When adding or enabling a widget, update tests in three places:

- **Field behavior** (`__tests__/<widget>.test.tsx`, one file per widget) — Test what values `onParameterChange` receives when the user interacts with each field: entering a value, clearing it, toggling it. Focus on the boundaries (empty → `undefined`, value → correct type, absent param still renders). Use shared helpers from `__tests__/widget-test-utils.tsx`.
- **AI tool dispatch** (`__tests__/ai-tools.test.ts`) — Test that the widget appears in `describeWidgetTypes`, can be added via `add_widget`, and that its parameter types can be edited via `edit_widget`.
- **Existing tests** (`__tests__/toolbar.test.ts`) — Update any tests that relied on the widget being disabled.
