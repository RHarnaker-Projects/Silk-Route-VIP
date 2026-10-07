import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { sites } from './build/sites-vite-plugin.js';

const pages = {
  home: resolve(import.meta.dirname, 'index.html'),
  quote: resolve(import.meta.dirname, 'quote.html'),
  contact: resolve(import.meta.dirname, 'contact.html'),
  privacy: resolve(import.meta.dirname, 'privacy.html'),
  terms: resolve(import.meta.dirname, 'terms.html'),
  cookies: resolve(import.meta.dirname, 'cookies.html'),
  informationAccess: resolve(import.meta.dirname, 'information-access.html'),
  accessibility: resolve(import.meta.dirname, 'accessibility.html'),
  mediaCredits: resolve(import.meta.dirname, 'media-credits.html'),
};

export default defineConfig(async () => {
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  const { cloudflare } = await import('@cloudflare/vite-plugin');

  return {
    plugins: [
      sites(),
      cloudflare({
        config: {
          name: 'silk-route',
          main: './worker/sites-static.js',
          compatibility_date: '2026-05-22',
          assets: {
            binding: 'ASSETS',
            not_found_handling: 'single-page-application',
            run_worker_first: true,
          },
          ratelimits: [
            {
              name: 'PLACES_AUTOCOMPLETE_RATE_LIMITER',
              namespace_id: '76420301',
              simple: { limit: 60, period: 60 },
            },
            {
              name: 'PLACES_DETAILS_RATE_LIMITER',
              namespace_id: '76420302',
              simple: { limit: 20, period: 60 },
            },
          ],
        },
      }),
    ],
    environments: {
      client: {
        build: {
          rollupOptions: { input: pages },
        },
      },
    },
  };
});
