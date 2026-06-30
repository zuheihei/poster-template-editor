import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDoubanApiMiddleware } from './server/doubanApi.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fontsDir = path.join(__dirname, 'fonts');

function attachPosterFontsMiddleware(server) {
  server.middlewares.use('/fonts', (req, res, next) => {
    if (!req.url) {
      next();
      return;
    }
    const rel = decodeURIComponent(req.url.split('?')[0]);
    const filePath = path.normalize(path.join(fontsDir, rel.replace(/^\//, '')));
    if (!filePath.startsWith(fontsDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      next();
      return;
    }
    const ext = path.extname(filePath);
    const type = ext === '.woff2' ? 'font/woff2' : ext === '.css' ? 'text/css; charset=utf-8' : 'application/octet-stream';
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    fs.createReadStream(filePath).pipe(res);
  });
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'douban-api',
      configureServer(server) {
        server.middlewares.use(createDoubanApiMiddleware());
        attachPosterFontsMiddleware(server);
      },
      configurePreviewServer(server) {
        server.middlewares.use(createDoubanApiMiddleware());
        attachPosterFontsMiddleware(server);
      },
    },
  ],
});
