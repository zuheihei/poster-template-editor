import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createDoubanApiMiddleware } from './server/doubanApi.js';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'douban-api',
      configureServer(server) {
        server.middlewares.use(createDoubanApiMiddleware());
      },
      configurePreviewServer(server) {
        server.middlewares.use(createDoubanApiMiddleware());
      },
    },
  ],
});
