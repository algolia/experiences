import { resolve } from 'node:path';
import { readFileSync, watch } from 'node:fs';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const RESOLVER_URL =
  'https://experiences-bundle-resolver.algolia-5d2.workers.dev';
const LOCAL_PREFIX = '/__local__/';
const PACKAGES_DIR = resolve(__dirname, '../../packages');

function resolveDistFile(filename: string) {
  if (filename.startsWith('runtime')) {
    return resolve(PACKAGES_DIR, 'runtime/dist', filename);
  }
  if (filename.startsWith('toolbar')) {
    return resolve(PACKAGES_DIR, 'toolbar/dist', filename);
  }
  return resolve(PACKAGES_DIR, 'experiences/dist', filename);
}

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    strictPort: Boolean(process.env.PORT),
    fs: {
      allow: [resolve(__dirname, '../..')],
    },
  },
  plugins: [
    {
      name: 'portless-url',
      configureServer(server) {
        const name = process.env.PORTLESS_NAME;
        if (!name) return;
        const port = process.env.PORTLESS_PORT || 1355;
        server.printUrls = () => {
          const url = `http://${name}.localhost:${port}/`;
          server.config.logger.info(`  ➜  Portless:  ${url}`);
        };
      },
    },
    {
      name: 'local-canary-proxy',
      configureServer(server) {
        // Reload the browser when local dist files change
        for (const pkg of ['experiences', 'runtime', 'toolbar']) {
          watch(resolve(PACKAGES_DIR, pkg, 'dist'), (_, filename) => {
            if (filename?.endsWith('.js')) {
              server.ws.send({ type: 'full-reload' });
            }
          });
        }

        // Mock the resolver: return a bundleUrl pointing to the local prefix.
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/__resolver__/')) return next();

          const origin = `http://${req.headers.host}`;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({ bundleUrl: `${origin}${LOCAL_PREFIX}runtime.js` })
          );
        });

        // Serve /__local__/<filename> from the local dist directory.
        server.middlewares.use((req, res, next) => {
          const [pathname] = (req.url || '').split('?');
          if (!pathname.startsWith(LOCAL_PREFIX)) return next();

          const filename = pathname.slice(LOCAL_PREFIX.length);
          const filePath = resolveDistFile(filename);

          try {
            let content = readFileSync(filePath, 'utf-8');

            // Patch loader bundles to call the local resolver mock
            if (filename.startsWith('experiences')) {
              content = content.replaceAll(RESOLVER_URL, '/__resolver__');
            }

            res.writeHead(200, {
              'Content-Type': 'application/javascript',
              'Cache-Control': 'no-cache',
            });
            res.end(content);
          } catch {
            next();
          }
        });
      },
    },
    react(),
  ],
  build: {
    outDir: 'build',
  },
});
