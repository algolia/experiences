import { execSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import type { Plugin } from 'rolldown';
import { defineConfig } from 'tsdown';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { parsed: env = {} } = config({ path: resolve(__dirname, '.env') });
const toolbarCssPath = resolve(__dirname, 'src/toolbar.css');

const VIRTUAL_ID = 'virtual:toolbar-css';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

/**
 * Compiles Tailwind CSS on every build pass (including --watch rebuilds)
 * and exposes it as a virtual module import.
 */
function tailwindPlugin(): Plugin {
  return {
    name: 'toolbar-tailwind',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id === RESOLVED_ID) {
        const css = execSync(
          `npx @tailwindcss/cli --input ${toolbarCssPath} --minify`,
          { encoding: 'utf-8', cwd: __dirname }
        );
        return `export default ${JSON.stringify(css)};`;
      }
    },
  };
}

export default defineConfig({
  entry: { toolbar: 'src/index.ts' },
  format: ['umd'],
  outDir: 'dist',
  globalName: 'AlgoliaExperiencesToolbar',
  target: 'es2020',
  platform: 'browser',
  minify: true,
  sourcemap: true,
  noExternal: [/.*/],
  define: {
    'process.env.AGENT_STUDIO_BETA_APP_ID': JSON.stringify(
      env.AGENT_STUDIO_BETA_APP_ID ?? ''
    ),
    'process.env.AGENT_STUDIO_BETA_AGENT_ID': JSON.stringify(
      env.AGENT_STUDIO_BETA_AGENT_ID ?? ''
    ),
    'process.env.AGENT_STUDIO_BETA_SEARCH_API_KEY': JSON.stringify(
      env.AGENT_STUDIO_BETA_SEARCH_API_KEY ?? ''
    ),
    'process.env.AGENT_STUDIO_PROD_APP_ID': JSON.stringify(
      env.AGENT_STUDIO_PROD_APP_ID ?? ''
    ),
    'process.env.AGENT_STUDIO_PROD_AGENT_ID': JSON.stringify(
      env.AGENT_STUDIO_PROD_AGENT_ID ?? ''
    ),
    'process.env.AGENT_STUDIO_PROD_SEARCH_API_KEY': JSON.stringify(
      env.AGENT_STUDIO_PROD_SEARCH_API_KEY ?? ''
    ),
  },
  alias: {
    react: 'preact/compat',
    'react-dom': 'preact/compat',
    'react/jsx-runtime': 'preact/jsx-runtime',
  },
  plugins: [tailwindPlugin()],
});
