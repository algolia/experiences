import type { KVNamespace } from '@cloudflare/workers-types';

declare global {
  interface Env {
    EXPERIENCES_BUNDLE_VERSIONS: KVNamespace;
  }
}

declare module 'cloudflare:test' {
  interface ProvidedEnv extends Env {}
}
