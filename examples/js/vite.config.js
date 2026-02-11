export default {
  plugins: [
    {
      name: 'preview-mode',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/preview')) {
            req.url = req.url.replace(/^\/preview/, '') || '/';
          }
          next();
        });
      },
      transformIndexHtml(html, ctx) {
        if (!ctx.originalUrl?.startsWith('/preview')) {
          return html;
        }

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
      },
    },
  ],
};
