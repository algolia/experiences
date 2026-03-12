import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'tsdown';

// TODO: Serve CSS from a CDN with proper MIME type and load via <link> from the
// loader instead of self-injecting. GitHub release downloads serve as
// application/octet-stream which browsers reject for stylesheets. Remove the
// __AUTOCOMPLETE_CSS__ define and the <style> injection in widget.tsx once we
// have a proper CDN setup.
const __dirname = dirname(fileURLToPath(import.meta.url));
const autocompleteCssPath = resolve(
  __dirname,
  '../theme/src/widgets/autocomplete/autocomplete.css'
);
const autocompleteCss = readFileSync(autocompleteCssPath, 'utf-8');

export default defineConfig({
  entry: { runtime: 'src/index.ts' },
  format: ['umd'],
  outDir: 'dist',
  globalName: 'AlgoliaExperiences',
  target: 'es2020',
  platform: 'browser',
  minify: true,
  sourcemap: true,
  noExternal: [/.*/],
  define: {
    __AUTOCOMPLETE_CSS__: JSON.stringify(autocompleteCss),
  },
});
