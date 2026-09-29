import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

const staticHeadersPlugin = (): Plugin => ({
  name: 'custom-static-headers',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url?.split('?')[0] || '';
      if (url.endsWith('.mobileconfig')) {
        res.setHeader('Content-Type', 'application/x-apple-aspen-config');
        res.setHeader('Content-Disposition', 'attachment; filename="cellar-pos.mobileconfig"');
      } else if (url.endsWith('.docx')) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename="CELLAR_POS_SOFTWARE_DOCUMENTATION.docx"');
      } else if (url.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="CELLAR_POS_SOFTWARE_DOCUMENTATION.pdf"');
      } else if (url.endsWith('.md')) {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Content-Disposition', 'inline; filename="CELLAR_POS_SOFTWARE_DOCUMENTATION.md"');
      } else if (url.endsWith('.zip')) {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment');
      } else if (url.endsWith('.exe')) {
        res.setHeader('Content-Type', 'application/vnd.microsoft.portable-executable');
        res.setHeader('Content-Disposition', 'attachment; filename="Cellar-POS-Setup-v1.0.exe"');
      }
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url?.split('?')[0] || '';
      if (url.endsWith('.mobileconfig')) {
        res.setHeader('Content-Type', 'application/x-apple-aspen-config');
        res.setHeader('Content-Disposition', 'attachment; filename="cellar-pos.mobileconfig"');
      } else if (url.endsWith('.docx')) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename="CELLAR_POS_SOFTWARE_DOCUMENTATION.docx"');
      } else if (url.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="CELLAR_POS_SOFTWARE_DOCUMENTATION.pdf"');
      } else if (url.endsWith('.md')) {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Content-Disposition', 'inline; filename="CELLAR_POS_SOFTWARE_DOCUMENTATION.md"');
      } else if (url.endsWith('.zip')) {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment');
      } else if (url.endsWith('.exe')) {
        res.setHeader('Content-Type', 'application/vnd.microsoft.portable-executable');
        res.setHeader('Content-Disposition', 'attachment; filename="Cellar-POS-Setup-v1.0.exe"');
      }
      next();
    });
  },
});

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      staticHeadersPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: './',
          name: 'Cellar POS — Wines & Spirits',
          short_name: 'CellarPOS',
          description: 'Locally-installed point-of-sale system for wines and spirits retail stores. Works 100% offline.',
          theme_color: '#4a0e17',
          background_color: '#1c1917',
          display: 'standalone',
          start_url: './',
          scope: './',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
