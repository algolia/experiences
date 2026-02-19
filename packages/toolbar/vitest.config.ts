import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

function stubToolbarCss(): Plugin {
  return {
    name: 'stub-toolbar-css',
    resolveId(id) {
      if (id === 'virtual:toolbar-css') return '\0virtual:toolbar-css';
    },
    load(id) {
      if (id === '\0virtual:toolbar-css') {
        return 'export default "* { box-sizing: border-box; }";';
      }
    },
  };
}

const root = resolve(__dirname, '../..');
const preactCompat = resolve(
  root,
  'node_modules/preact/compat/dist/compat.mjs'
);
const preactJsxRuntime = resolve(
  root,
  'node_modules/preact/jsx-runtime/dist/jsxRuntime.mjs'
);

export default defineConfig({
  plugins: [stubToolbarCss()],
  resolve: {
    alias: {
      'react/jsx-runtime': preactJsxRuntime,
      'react-dom': preactCompat,
      react: preactCompat,
    },
  },
  test: {
    environment: 'jsdom',
    server: {
      deps: {
        inline: ['react', 'react-dom', '@ai-sdk/react'],
      },
    },
  },
});
