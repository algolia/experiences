# Basic Example

A plain HTML e-commerce storefront showing how to use the Algolia Experiences loader.

## Setup

1. Update the script in each HTML file with your Algolia credentials:
   - `appId` - Your Algolia Application ID
   - `apiKey` - Your Algolia API Key
   - `experienceId` - The ID of the experience to load

2. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

3. Open http://localhost:5173 in your browser.

## Preview mode

Navigating to `/preview` serves the same pages but uses the **preview loader** (`experiences.preview.js`). This mirrors a real staging environment where the Algolia dashboard can push live config overrides via the `algolia_experiences_config` URL parameter.

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
