import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'mascot/toofie-splash.png',
        'mascot/toofie-sprite-walk-cycle.png',
      ],
      manifest: {
        name: 'Toofies',
        short_name: 'Toofies',
        description: 'Enjoy dessert with a little more awareness and zero guilt.',
        theme_color: '#fefae7',
        background_color: '#fefae7',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/?v=11',
        scope: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cacheId: 'toofies-v11',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
});
