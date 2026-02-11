# React Example

An e-commerce storefront built with React, demonstrating how to integrate Algolia Experiences in a single-page application with client-side routing.

## Setup

```sh
npm install
npm run dev
```

## How it works

The key integration piece is the [`useAlgoliaExperiences`](./src/useAlgoliaExperiences.ts) hook. It handles the full lifecycle of the Algolia Experiences loader in a React app:

1. **First mount** — injects the loader `<script>` tag with config passed as URL params. The loader auto-resolves the runtime, loads it, and calls `run()`.
2. **Route changes** — calls `dispose()` to tear down current widgets, then `run()` to re-render them for the new page.
3. **Unmount** — calls `dispose()` to clean up.

### Usage

Call the hook in a layout component that wraps all routes:

```tsx
import { useAlgoliaExperiences } from './useAlgoliaExperiences';

function Layout() {
  useAlgoliaExperiences({
    src: 'https://github.com/algolia/experiences/releases/download/canary/experiences.js',
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_API_KEY',
    experienceId: 'YOUR_EXPERIENCE_ID',
    env: 'prod',
  });

  return (
    <>
      <nav>{/* ... */}</nav>
      <Outlet />
      <footer>{/* ... */}</footer>
    </>
  );
}
```

The hook uses `useLocation()` from React Router to detect route changes, so it must be rendered inside a `<BrowserRouter>`.

### Widget containers

The experience config references DOM containers by `id`. Make sure the matching elements exist in your JSX:

```tsx
<div id="autocomplete"></div>
<div id="chat"></div>
```

## Preview mode

Navigating to `/preview` serves the same storefront but uses the **preview loader** (`experiences.preview.js`). This mirrors a real staging environment where the Algolia dashboard can push live config overrides via the `algolia_experiences_config` URL parameter.

The preview routes show a yellow staging banner and all links stay within `/preview/*`.

```
/preview          → Home (preview loader)
/preview/search   → Search (preview loader)
/preview/product  → Product (preview loader)
```

## Pages

- **Home** (`/`) — hero, recommendations widget, trending products, categories
- **Search** (`/search`) — search box, filters, hits, pagination widgets
- **Product** (`/product`) — product detail, related products, frequently bought together widgets
