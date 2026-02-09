import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: { experiences: 'src/entries/production.ts' },
    format: ['umd'],
    outDir: 'dist',
    globalName: 'AlgoliaExperiences',
    target: 'es2020',
    minify: true,
    sourcemap: true,
    clean: true,
  },
  {
    entry: { 'experiences.preview': 'src/entries/preview.ts' },
    format: ['umd'],
    outDir: 'dist',
    globalName: 'AlgoliaExperiences',
    target: 'es2020',
    minify: true,
    sourcemap: true,
  },
]);
