# @algolia/experiences

Evergreen loader script for Algolia Experiences.

## Usage

Add the loader script to your HTML with your Algolia credentials and experience ID as URL parameters:

```html
<script src="https://github.com/algolia/experiences/releases/download/canary/experiences.js?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID"></script>
```

### Parameters

| Parameter      | Required | Description                      |
| -------------- | -------- | -------------------------------- |
| `appId`        | Yes      | Your Algolia Application ID      |
| `apiKey`       | Yes      | Your Algolia API Key             |
| `experienceId` | Yes      | The ID of the experience to load |

## How it works

1. The loader reads configuration from the script URL parameters
2. It calls the Algolia Experiences resolver to get the runtime bundle URL
3. It injects the runtime script into the page

The loader is lightweight and always fetches the latest compatible runtime version, so you never need to update the script tag.

## Releasing

### Canary releases

Canary releases are pre-production builds for testing. To create one:

1. Go to [Actions → Canary Release](../../actions/workflows/canary-release.yml)
2. Click "Run workflow"
3. Select the `main` branch and click "Run workflow"

This builds the package and uploads it to a GitHub release tagged `canary`. The script is available at:

```
https://github.com/algolia/experiences/releases/download/canary/experiences.js
```

Each run overwrites the previous canary release.
