import { resolve } from 'node:path';
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  watch,
  writeFileSync,
} from 'node:fs';

const CANARY_URL =
  'https://github.com/algolia/experiences/releases/download/canary/';
const LOCAL_PREFIX = '/__local__/';
const RESOLVER_URL =
  'https://experiences-bundle-resolver.algolia-5d2.workers.dev';
const PACKAGES_DIR = resolve(__dirname, '../../packages');

function resolveDistFile(filename) {
  if (filename.startsWith('runtime')) {
    return resolve(PACKAGES_DIR, 'runtime/dist', filename);
  }
  if (filename.startsWith('toolbar')) {
    return resolve(PACKAGES_DIR, 'toolbar/dist', filename);
  }
  return resolve(PACKAGES_DIR, 'experiences/dist', filename);
}

function transformForPreview(html) {
  // Inject staging banner after <body>
  html = html.replace(
    '<body>',
    `<body>
    <div class="staging-banner">
      Staging — This is a preview environment, not production.
    </div>
`
  );

  // Swap production loader for preview loader
  html = html.replace('experiences.js', 'experiences.preview.js');

  // Rewrite internal page links to stay in /preview
  // Matches href="/..." where the path has no file extension
  html = html.replace(/href="(\/[^".]*)"/g, 'href="/preview$1"');

  return html;
}

function resolveFile(urlPath) {
  if (urlPath === '/') return 'index.html';
  const name = urlPath.slice(1);
  return name.endsWith('.html') ? name : `${name}.html`;
}

const pages = ['index.html', 'search.html', 'product.html'];

export default {
  server: {
    host: '127.0.0.1',
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    strictPort: Boolean(process.env.PORT),
  },
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => {
          return [page.replace('.html', ''), resolve(__dirname, page)];
        })
      ),
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
      // Rewrite GitHub canary URLs to a local prefix so Vite serves them.
      transformIndexHtml(html) {
        return html.replaceAll(CANARY_URL, LOCAL_PREFIX);
      },
      configureServer(server) {
        // Reload the browser when local dist files change (e.g. after
        // tsdown --watch rebuilds the toolbar or runtime).
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
        // Also patches the loader bundles to route resolver calls through
        // the local mock instead of the remote worker.
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
    {
      name: 'preview-mode',
      configureServer(server) {
        // Added BEFORE Vite's built-in middleware so we intercept
        // /preview requests before the SPA fallback serves index.html.
        server.middlewares.use(async (req, res, next) => {
          const [pathname] = (req.url || '').split('?');
          if (!pathname.startsWith('/preview')) return next();

          const actualPath = pathname.replace(/^\/preview/, '') || '/';
          const file = resolveFile(actualPath);

          try {
            let html = readFileSync(resolve(__dirname, file), 'utf-8');
            html = await server.transformIndexHtml(`/${file}`, html);
            html = transformForPreview(html);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
          } catch {
            next();
          }
        });
      },
      closeBundle() {
        const outDir = resolve(__dirname, 'dist');

        // Copy local dist files so Netlify serves them at /__local__/
        const localDir = resolve(outDir, '__local__');
        mkdirSync(localDir, { recursive: true });

        // Copy loader bundles, patched to use the local resolver
        for (const name of ['experiences.js', 'experiences.preview.js']) {
          let content = readFileSync(resolveDistFile(name), 'utf-8');
          content = content.replaceAll(RESOLVER_URL, '/__resolver__');
          writeFileSync(resolve(localDir, name), content);
        }

        // Copy runtime and toolbar as-is
        for (const name of ['runtime.js', 'toolbar.js']) {
          copyFileSync(resolveDistFile(name), resolve(localDir, name));
        }

        // Static resolver response pointing to the local runtime
        const resolverDir = resolve(outDir, '__resolver__');
        mkdirSync(resolverDir, { recursive: true });
        writeFileSync(
          resolve(resolverDir, 'response.json'),
          JSON.stringify({ bundleUrl: '/__local__/runtime.js' })
        );

        // Generate preview variants
        const previewDir = resolve(outDir, 'preview');
        mkdirSync(previewDir, { recursive: true });

        for (const page of pages) {
          const html = readFileSync(resolve(outDir, page), 'utf-8');
          writeFileSync(resolve(previewDir, page), transformForPreview(html));
        }
      },
    },
  ],
};
