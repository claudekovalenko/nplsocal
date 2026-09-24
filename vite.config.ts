import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// Base path: "/" for a custom domain or root host, "/<repo>/" for GitHub project pages.
// The deploy workflow sets BASE_PATH; local dev and other hosts default to "/".
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 'prompt' left people on an old build until they noticed an Update
      // banner, which on a phone they rarely did. The app now takes the new
      // version as soon as it is deployed.
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png', 'favicon.ico'],
      manifest: {
        name: 'No Place Left SoCal',
        short_name: 'NPL SoCal',
        description:
          'Tools, training, and connection for disciple-makers across Los Angeles and Orange County — until there is no place left.',
        id: base,
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#000000',
        theme_color: '#000000',
        lang: 'en-US',
        categories: ['education', 'lifestyle', 'social'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Toolbox', url: `${base}tools`, description: 'Open the NPL toolbox' },
          { name: 'Events', url: `${base}events`, description: 'Upcoming trainings and gatherings' },
          { name: 'My 100 List', url: `${base}my-100`, description: 'Your personal oikos list' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
        // Take over straight away rather than waiting for every tab to close.
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: { sourcemap: false },
});
