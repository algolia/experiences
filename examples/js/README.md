# JS Example

An e-commerce storefront built with plain HTML, demonstrating how to integrate Algolia Experiences with a single script tag.

## Setup

```sh
npm install
npm run dev
```

## How it works

Add a single script tag to your page with your credentials as URL params. The loader auto-resolves the runtime, loads it, and renders widgets into matching DOM containers.

### Usage

```html
<script src="https://github.com/algolia/experiences/releases/download/canary/experiences.js?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID&env=prod"></script>
```

### Widget containers

The experience config references DOM containers by `id`. Make sure the matching elements exist in your HTML:

```html
<div id="autocomplete"></div>
<div id="chat"></div>
```

## Preview mode

Navigating to `/preview` serves the same storefront but uses the **preview loader** (`experiences.preview.js`). This mirrors a real staging environment where the Algolia dashboard can push live config overrides via the `algolia_experiences_config` URL parameter.

The preview routes show a yellow staging banner and all links stay within `/preview/*`. This is handled entirely by a [Vite plugin](./vite.config.js) — the HTML files don't need any changes.

```
/preview          → Home (preview loader)
/preview/search   → Search (preview loader)
/preview/product  → Product (preview loader)
```

## Pages

- **Home** (`/`) — hero, recommendations widget, trending products, categories
- **Search** (`/search`) — search box, filters, hits, pagination widgets
- **Product** (`/product`) — product detail, related products, frequently bought together widgets
