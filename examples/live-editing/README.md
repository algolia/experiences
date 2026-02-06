# Live Editing Example

Demonstrates how to use the preview bundle for live editing configurations.

## How It Works

The preview bundle (`experiences.preview.js`) reads the `algolia_experiences_config` parameter from the **page URL** (not the script URL). This enables:

- Dashboard live editing via iframe URL params
- Shareable preview links for testing configs

## Setup

1. Update `index.html` with your Algolia credentials in the script tag
2. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

3. Open http://localhost:5173 in your browser
4. Edit the JSON config and click "Apply Config" to see it in action

## Encoding

The config must be encoded as base64 with URI component encoding for Unicode support:

```js
// Encode
const encoded = btoa(encodeURIComponent(JSON.stringify(config)));

// The URL becomes:
// http://localhost:5173/?algolia_experiences_config=ENCODED_CONFIG
```

## Security Note

The preview bundle should only be used on staging environments. On production sites, use the standard `experiences.js` bundle which does not accept URL-based config overrides.
