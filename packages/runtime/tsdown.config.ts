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

/**
 * Read a CSS file and inline any `@import './…'` declarations by recursively
 * reading the referenced files. Only handles relative paths (which is all we
 * need for the autocomplete stylesheet split).
 */
function readCssWithImports(filePath: string): string {
  const css = readFileSync(filePath, 'utf-8');
  const dir = dirname(filePath);

  return css.replace(
    /@import\s+['"](.\/[^'"]+)['"]\s*;/g,
    (_, importPath: string) => {
      return readCssWithImports(resolve(dir, importPath));
    }
  );
}

const autocompleteCss = readCssWithImports(autocompleteCssPath);

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
