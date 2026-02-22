# Experiences

Embeddable search & discovery widgets for Algolia customers.

## Architecture

- **Loader** (`packages/experiences`) — Lightweight script injected on customer pages. Reads config from script URL params, calls resolver, injects runtime.
- **Runtime** (`packages/runtime`) — Full bundle (instantsearch.js + preact + algoliasearch). Fetches experience config from API, renders widgets. Outputs to `packages/experiences/dist/`.
- **Toolbar** (`packages/toolbar`) — Preact-based configuration UI rendered in Shadow DOM. Lets users add, edit, and remove widgets.
- **Resolver** (`apps/resolver`) — Cloudflare Worker. Maps experienceId → bundle URL via KV storage.

## Commands

```sh
npm run build          # Build all packages (turbo)
npm run test           # Run all tests (turbo, per-package vitest configs)
npm run lint           # oxlint
npm run format:check   # Prettier check
npm run format         # Prettier write
```

## Conventions

- **Commits**: conventional commits (`feat:`, `fix:`, `chore:`)
- **Monorepo**: npm workspaces + turborepo
- **Build**: tsdown (rolldown-based)
- **Lint**: oxlint + Prettier
- **Tests**: vitest (see below)
- **UI**: Preact (not React), rendered in Shadow DOM

## Testing

### Running tests

Always run tests via turbo, not `npx vitest run` from the root. Each package has its own vitest config with environment-specific settings (jsdom, Cloudflare Workers pool, etc.).

```sh
npm run test                                   # All packages
npm run test --workspace=packages/toolbar      # Single package
```

### What to test

- **Pure functions and logic** — State helpers, parsers, formatters, selectors. These are the best unit test candidates. Examples: `generateSelector`, `describeExperience`, `parsePath`, `updateBlockAtPath`.
- **API layer** — Use MSW to mock HTTP endpoints. Test request shape, headers, error handling. See `api.test.ts`.
- **AI tool dispatch** — Test tool execute functions with mock callbacks. Verify correct callbacks are invoked with correct arguments, and that validation rejects bad input. See `ai-tools.test.ts`.
- **Integration behavior** — Test real rendering in jsdom when it provides confidence (Shadow DOM creation, user interactions, widget popover). See `toolbar.test.ts`.

### What not to test

- Don't test that props render correctly — that's Preact's job.
- Don't test implementation details (internal state shape, effect timing).
- Don't mock Preact hooks or internals.

### Patterns

- **DOM tests** need `environment: 'jsdom'` in the package's vitest config. Clean up in `afterEach` (`document.body.innerHTML = ''`).
- **API tests** use MSW (`setupServer`). Call `server.listen()` in `beforeAll`, `server.resetHandlers()` in `afterEach`, `server.close()` in `afterAll`.
- **Mock callbacks** with `vi.fn()` for testing function dispatch (AI tools, state callbacks). Verify calls with `toHaveBeenCalledWith`.
- **Test file location**: `__tests__/` directory at the package root. Name files `<subject>.test.ts` (or `.test.tsx` when rendering JSX).
- **Test naming**: use `describe` for grouping, `it` for individual tests. Write test names that describe expected behavior, not implementation.

## Widgets

The toolbar renders widget parameters using field overrides defined in `packages/toolbar/src/widget-types.tsx`. Each override maps a parameter to a UI field component in `BlockEditor`.

### Principles

- **Prefer `undefined` over redundant defaults.** Optional params (numbers, text) should default to `undefined` and show the library default as a `placeholder`. Clearing a field sends `undefined` so InstantSearch applies its own default. This avoids storing redundant values in the API.
- **Booleans are always-on.** Switches are binary — there's no "unset" state. Default to the library default (`true` or `false`).
- **Some params have a meaningful "off" distinct from "use the default".** When a param can be explicitly disabled (e.g., `scrollTo: false` disables scrolling, vs. `undefined` which scrolls to `body`), use a toggleable field (`toggleable-text`, or `object` with `disabledValue`). OFF sends `false` (or a custom `disabledValue`), ON sends the value or `undefined`. Use `'disabledValue' in override` (not `??`) to distinguish "not set" from "explicitly `undefined`".
- **Fields must render even when the param is absent from the API response.** `fieldOrder` filters via `key in parameters || key in overrides`, so a field override is enough to make a field visible.
- **Compose field components from primitives.** When a field needs extra UI (like a picker button next to an input), create a composed component from primitives (`Label`, `Input`, etc.) rather than adding feature-specific props to a generic field component.

### Tests

When adding or enabling a widget, update tests in three places:

- **Field behavior** (`__tests__/<widget>.test.tsx`, one file per widget) — Test what values `onParameterChange` receives when the user interacts with each field: entering a value, clearing it, toggling it. Focus on the boundaries (empty → `undefined`, value → correct type, absent param still renders). Use shared helpers from `__tests__/widget-test-utils.tsx`.
- **AI tool dispatch** (`__tests__/ai-tools.test.ts`) — Test that the widget appears in `describeWidgetTypes`, can be added via `add_widget`, and that its parameter types can be edited via `edit_widget`.
- **Existing tests** (`__tests__/toolbar.test.ts`) — Update any tests that relied on the widget being disabled.
