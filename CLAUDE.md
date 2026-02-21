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
- **Test file location**: `__tests__/` directory at the package root. Name files `<subject>.test.ts`.
- **Test naming**: use `describe` for grouping, `it` for individual tests. Write test names that describe expected behavior, not implementation.

### Widget tests

When adding or enabling a widget, update tests in `packages/toolbar/__tests__/ai-tools.test.ts`:

- **AI tool dispatch** — Widget config changes affect `describeWidgetTypes`, `add_widget`, and `edit_widget`. Test that the new widget appears in discovery, can be added via the AI tool, and that each parameter type it introduces (boolean switches, object fields like `cssClasses`) can be edited.
- **Existing tests** — Update any tests that relied on the widget being disabled (e.g., the disabled options test in `toolbar.test.ts`).
