# Experiences Resolver

Cloudflare Worker that resolves experience bundle URLs based on configured versions.

## Endpoints

- `GET /{experienceId}` - Returns the bundle URL for an experience
- `POST /{experienceId}` - Updates the bundle version for an experience

Both endpoints require `X-Algolia-Application-Id` and `X-Algolia-API-Key` headers.

## Running dev

```bash
npm ci
npm run dev
```

## Deploying

> [!NOTE]
> You need to create a KV namespace and update the `id` in `wrangler.toml` before deploying.

```bash
npx wrangler kv namespace create EXPERIENCES_BUNDLE_VERSIONS
npm run deploy
```
