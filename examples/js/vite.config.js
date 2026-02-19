import { resolve } from 'node:path';
import { mkdirSync, readFileSync, watch, writeFileSync } from 'node:fs';

const CANARY_URL =
  'https://github.com/algolia/experiences/releases/download/canary/';
const LOCAL_PREFIX = '/__local__/';
const RESOLVER_URL =
  'https://experiences-bundle-resolver.algolia-5d2.workers.dev';
const DIST_DIR = resolve(__dirname, '../../packages/experiences/dist');

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
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [page.replace('.html', ''), resolve(__dirname, page)])
      ),
    },
  },
  plugins: [
    {
      name: 'local-canary-proxy',
      // Rewrite GitHub canary URLs to a local prefix so Vite serves them.
      transformIndexHtml(html) {
        return html.replaceAll(CANARY_URL, LOCAL_PREFIX);
      },
      configureServer(server) {
        // Reload the browser when local dist files change (e.g. after
        // tsdown --watch rebuilds the toolbar or runtime).
        watch(DIST_DIR, (_, filename) => {
          if (filename?.endsWith('.js')) {
            server.ws.send({ type: 'full-reload' });
          }
        });

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
          const filePath = resolve(DIST_DIR, filename);

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
