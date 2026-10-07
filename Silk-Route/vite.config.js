import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        quote: resolve(import.meta.dirname, 'quote.html'),
        contact: resolve(import.meta.dirname, 'contact.html'),
        privacy: resolve(import.meta.dirname, 'privacy.html'),
        terms: resolve(import.meta.dirname, 'terms.html'),
        cookies: resolve(import.meta.dirname, 'cookies.html'),
        informationAccess: resolve(import.meta.dirname, 'information-access.html'),
        accessibility: resolve(import.meta.dirname, 'accessibility.html'),
        mediaCredits: resolve(import.meta.dirname, 'media-credits.html'),
        blogAirportTransfers: resolve(import.meta.dirname, 'blog/airport-transfers-cape-town.html'),
        blogExecutiveChauffeur: resolve(import.meta.dirname, 'blog/executive-chauffeur-cape-town.html'),
        blogDinnerEvents: resolve(import.meta.dirname, 'blog/dinner-events-chauffeur-cape-town.html')
      }
    }
  }
});
