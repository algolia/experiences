import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { runtime: 'src/index.ts' },
  format: ['umd'],
  outDir: '../experiences/dist',
  globalName: 'AlgoliaExperiences',
  target: 'es2020',
  platform: 'browser',
  minify: true,
  sourcemap: true,
  noExternal: [/.*/],
});
