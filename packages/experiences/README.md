# @algolia/experiences

Evergreen loader script for Algolia Experiences.

## Bundles

| Bundle                   | Use case                                        |
| ------------------------ | ----------------------------------------------- |
| `experiences.js`         | Production sites                                |
| `experiences.preview.js` | Staging sites, Algolia Dashboard (live editing) |

## Usage

### Production

Add the loader script to your HTML with your Algolia credentials and experience ID as URL parameters:

```html
<script src="https://github.com/algolia/experiences/releases/download/canary/experiences.js?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID"></script>
```

### Preview

Use the preview bundle on staging environments for live editing:

```html
<script src="https://github.com/algolia/experiences/releases/download/canary/experiences.preview.js?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID"></script>
```

The preview bundle reads `algolia_experiences_config` from the page URL. This allows to add the parameter to the iframe URL, or users to share preview links:

```
https://example.org/page?algolia_experiences_config=BASE64_CONFIG
```

The loader decodes the base64 JSON and passes it to `AlgoliaExperiences.run(config)`.

```js
const config = { title: 'Café ☕', theme: 'dark' };
const encoded = btoa(encodeURIComponent(JSON.stringify(config)));
// https://example.org/page?algolia_experiences_config=${encoded}
```

## Parameters

### Script URL parameters

| Parameter      | Required | Description                      |
| -------------- | -------- | -------------------------------- |
| `appId`        | Yes      | Your Algolia Application ID      |
| `apiKey`       | Yes      | Your Algolia API Key             |
| `experienceId` | Yes      | The ID of the experience to load |

### Page URL parameters (preview bundle only)

| Parameter                    | Required | Description                         |
| ---------------------------- | -------- | ----------------------------------- |
| `algolia_experiences_config` | No       | Base64-encoded JSON config override |

## How it works

1. The loader reads `appId`, `apiKey`, and `experienceId` from the script URL
2. It calls the Algolia Experiences resolver to get the runtime bundle URL
3. It injects the runtime script into the page
4. It calls `AlgoliaExperiences.run()`:
   - **Production bundle**: with no arguments
   - **Preview bundle**: with the decoded `algolia_experiences_config` from the page URL (if present)

The loader is lightweight and always fetches the latest compatible runtime version, so you never need to update the script tag.

## Releasing

### Canary releases

Canary releases are pre-production builds for testing. To create one:

1. Go to [Actions → Canary Release](../../actions/workflows/canary-release.yml)
2. Click "Run workflow"
3. Select the `main` branch and click "Run workflow"

This builds the package and uploads it to a GitHub release tagged `canary`. The scripts are available at:

```
https://github.com/algolia/experiences/releases/download/canary/experiences.js
https://github.com/algolia/experiences/releases/download/canary/experiences.preview.js
```

Each run overwrites the previous canary release.

## Security

- **Use the production bundle on public sites.** The preview bundle accepts configuration from the page URL, which could allow malicious links to manipulate displayed content.
- **Use a search-only API key** with minimal permissions. The API key is visible in the page source.
