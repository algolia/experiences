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
- **UI**: Preact (not React), rendered in Shadow DOM
- **Tests**: Always run via turbo (`npm run test`), not `npx vitest run`. See [testing docs](.claude/docs/testing.md).
- **Widgets**: See [widget docs](.claude/docs/widgets.md) for field override principles and widget test checklist.
