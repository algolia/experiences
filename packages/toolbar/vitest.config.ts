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

export default defineConfig({
  plugins: [stubToolbarCss()],
  test: {
    environment: 'jsdom',
  },
});
