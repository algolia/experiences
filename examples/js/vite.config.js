import { resolve } from 'node:path';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

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
      name: 'preview-mode',
      configureServer(server) {
        // Return so this runs AFTER Vite's built-in middleware.
        // Non-preview requests are handled normally by Vite;
        // preview requests fall through to here.
        return () => {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url?.startsWith('/preview')) return next();

            const actualPath = req.url.replace(/^\/preview/, '') || '/';
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
        };
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
