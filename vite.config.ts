import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';
import type { Plugin } from 'vite';
import { events, hostFor } from './src/content/events';
import { buildIcs } from './src/lib/ics';

// Base path: "/" for a custom domain or root host, "/<repo>/" for GitHub project pages.
// The deploy workflow sets BASE_PATH; local dev and other hosts default to "/".
const base = process.env.BASE_PATH ?? '/';

/**
 * The public address the site is served from, for links inside calendar
 * events. SITE_URL wins; otherwise a public/CNAME means a custom domain, and
 * the GitHub Pages build knows its own repository. Empty in local dev, which
 * just leaves the links out.
 */
function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/?$/, '/');
  const cname = fileURLToPath(new URL('./public/CNAME', import.meta.url));
  if (existsSync(cname)) return `https://${readFileSync(cname, 'utf8').trim()}${base}`;
  const repo = process.env.GITHUB_REPOSITORY;
  if (repo) {
    const [owner] = repo.split('/');
    return `https://${owner.toLowerCase()}.github.io${base}`;
  }
  return '';
}

/**
 * Writes the calendar files from src/content/events.ts on every build:
 *  - calendar.ics            the feed people subscribe to (network + hub events)
 *  - cal/<event id>.ics      one file per event, for "Add to calendar"
 * They are plain files, so a phone opens them straight into its calendar app,
 * and adding an event to events.ts updates every subscriber's calendar.
 */
function calendarFiles(): Plugin {
  const files = () => {
    const opts = { siteUrl: siteUrl(), hubName: hostFor, now: new Date() };
    const out: Record<string, string> = {
      'calendar.ics': buildIcs(
        events.filter((e) => e.tier !== 'group'),
        opts,
      ),
    };
    for (const e of events) out[`cal/${e.id}.ics`] = buildIcs([e], { ...opts, name: e.title });
    return out;
  };
  return {
    name: 'npl-calendar-files',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0].slice(base.length);
        const body = files()[path];
        if (!body) return next();
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.end(body);
      });
    },
    generateBundle() {
      for (const [fileName, source] of Object.entries(files())) this.emitFile({ type: 'asset', fileName, source });
    },
  };
}

export default defineConfig({
  base,
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    tailwindcss(),
    calendarFiles(),
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
          { name: 'The Push', url: `${base}push`, description: 'L.A. Metro Gospel Push' },
          { name: 'Tracker', url: `${base}tracker`, description: 'Live numbers and the daily report' },
          { name: 'Events', url: `${base}events`, description: 'Upcoming trainings and gatherings' },
          { name: 'My 100 List', url: `${base}my-100`, description: 'Your personal oikos list' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: `${base}index.html`,
        // Calendar files must reach the network: served as the app shell, a tap
        // on "Add to calendar" would open the homepage instead.
        navigateFallbackDenylist: [/\.ics$/],
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
