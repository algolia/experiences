import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    strictPort: Boolean(process.env.PORT),
  },
  plugins: [
    {
      name: 'portless-url',
      configureServer(server) {
        const name = process.env.PORTLESS_NAME;
        if (!name) return;
        const port = process.env.PORTLESS_PORT || 1355;
        server.printUrls = () => {
          const url = `http://${name}.localhost:${port}/`;
          server.config.logger.info(`  ➜  Portless:  ${url}`);
        };
      },
    },
    react(),
  ],
  build: {
    outDir: 'build',
  },
});
