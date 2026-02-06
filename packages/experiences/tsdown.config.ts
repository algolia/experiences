import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { experiences: 'src/index.ts' },
  format: ['umd'],
  outDir: 'dist',
  globalName: 'AlgoliaExperiences',
  target: 'es2020',
  minify: true,
  sourcemap: true,
  clean: true,
});
