# @algolia/experiences

Evergreen loader script for Algolia Experiences.

## Usage

Add the loader script to your HTML with your Algolia credentials and experience ID as URL parameters:

```html
<script src="https://cdn.jsdelivr.net/npm/@algolia/experiences/dist/experiences.js?appId=YOUR_APP_ID&apiKey=YOUR_API_KEY&experienceId=YOUR_EXPERIENCE_ID"></script>
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
