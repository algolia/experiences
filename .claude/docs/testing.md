# Testing

## Running tests

Always run tests via turbo, not `npx vitest run` from the root. Each package has its own vitest config with environment-specific settings (jsdom, Cloudflare Workers pool, etc.).

```sh
npm run test                                   # All packages
npm run test --workspace=packages/toolbar      # Single package
```

## What to test

- **Pure functions and logic** — State helpers, parsers, formatters, selectors. These are the best unit test candidates. Examples: `generateSelector`, `describeExperience`, `parsePath`, `updateBlockAtPath`.
- **API layer** — Use MSW to mock HTTP endpoints. Test request shape, headers, error handling. See `api.test.ts`.
- **AI tool dispatch** — Test tool execute functions with mock callbacks. Verify correct callbacks are invoked with correct arguments, and that validation rejects bad input. See `ai-tools.test.ts`.
- **Integration behavior** — Test real rendering in jsdom when it provides confidence (Shadow DOM creation, user interactions, widget popover). See `toolbar.test.ts`.

## What not to test

- Don't test that props render correctly — that's Preact's job.
- Don't test implementation details (internal state shape, effect timing).
- Don't mock Preact hooks or internals.

## Patterns

- **DOM tests** need `environment: 'jsdom'` in the package's vitest config. Clean up in `afterEach` (`document.body.innerHTML = ''`).
- **API tests** use MSW (`setupServer`). Call `server.listen()` in `beforeAll`, `server.resetHandlers()` in `afterEach`, `server.close()` in `afterAll`.
