import { defineConfig } from 'vite';

const ORIGINAL_DESKTOP_HERO = '/assets/video/hero-silk-route.mp4';
const ORIGINAL_MOBILE_HERO = '/assets/video/hero-silk-route-mobile.mp4';
const SEEDANCE_DESKTOP_HERO = '/assets/video/seedance25/silk-route-seedance25-30s-web-1080p.mp4';
const SEEDANCE_MOBILE_HERO = '/assets/video/seedance25/silk-route-seedance25-30s-mobile-540p.mp4';

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true
  },
  plugins: [
    {
      name: 'silk-route-seedance-preview',
      transformIndexHtml: {
        order: 'pre',
        handler(html, context) {
          if (context.path !== '/' && context.path !== '/index.html') {
            return html;
          }

          return html
            .replace(ORIGINAL_MOBILE_HERO, SEEDANCE_MOBILE_HERO)
            .replace(ORIGINAL_DESKTOP_HERO, SEEDANCE_DESKTOP_HERO);
        }
      }
    }
  ]
});
