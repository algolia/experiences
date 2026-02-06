import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { runtime: 'src/index.ts' },
  format: ['umd'],
  outDir: 'dist',
  globalName: 'AlgoliaExperiences',
  target: 'es2020',
  platform: 'browser',
  minify: true,
  sourcemap: true,
  clean: true,
  noExternal: [/.*/],
});
