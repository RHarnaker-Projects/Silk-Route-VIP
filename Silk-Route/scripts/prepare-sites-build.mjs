import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';
import {
  jsonResponse,
  isSameOriginRequest,
  validSessionToken,
  readLimitedJson,
  enforcePlacesRateLimit,
  googlePlacesRequest,
  handlePlaceAutocomplete,
  handlePlaceDetails,
} from '../worker/sites-static.js';

const projectRoot = resolve(import.meta.dirname, '..');
const buildDirectory = resolve(projectRoot, 'dist');
const clientDirectory = resolve(buildDirectory, 'client');
const cloudflareWorkerEntry = resolve(buildDirectory, 'silk_route', 'index.js');
const serverDirectory = resolve(projectRoot, 'dist', 'server');

const clientEntries = await readdir(clientDirectory, { withFileTypes: true });
const htmlFiles = clientEntries.filter(
  (entry) => entry.isFile() && extname(entry.name) === '.html'
);

const pages = {};
for (const file of htmlFiles) {
  const html = await readFile(resolve(clientDirectory, file.name), 'utf8');
  const htmlRoute = `/${file.name}`;
  const cleanRoute = file.name === 'index.html' ? '/' : `/${basename(file.name, '.html')}`;
  pages[htmlRoute] = html;
  pages[cleanRoute] = html;
}

const placesProxySource = [
  jsonResponse,
  isSameOriginRequest,
  validSessionToken,
  readLimitedJson,
  enforcePlacesRateLimit,
  googlePlacesRequest,
  handlePlaceAutocomplete,
  handlePlaceDetails,
].map((definition) => definition.toString()).join('\n\n');

const workerSource = `const pages = ${JSON.stringify(pages)};
const securityHeaders = ${JSON.stringify({
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Origin-Agent-Cluster': '?1',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), tools=(self)',
})};

function retiredRouteTarget(pathname) {
  const normalized = pathname.replace(/\\/+$/, '') || '/';
  if (/^\\/services(?:\\.html)?$/.test(normalized)) return '/#services';
  if (/^\\/fleet(?:\\.html)?$/.test(normalized)) return '/#vehicle';
  if (/^\\/about(?:\\.html)?$/.test(normalized)) return '/';
  return null;
}

${placesProxySource}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/places/status' && request.method === 'GET') {
      return jsonResponse({
        enabled: Boolean(env.GOOGLE_MAPS_SERVER_KEY),
      });
    }
    if (url.pathname === '/api/places/autocomplete' && request.method === 'POST') {
      if (!env.GOOGLE_MAPS_SERVER_KEY) return jsonResponse({ error: 'Location search is not configured.' }, 503);
      if (!isSameOriginRequest(request, url)) return jsonResponse({ error: 'Forbidden.' }, 403);
      const limited = await enforcePlacesRateLimit(request, env.PLACES_AUTOCOMPLETE_RATE_LIMITER, 'autocomplete', 60);
      if (limited) return limited;
      return handlePlaceAutocomplete(request, env, url.origin);
    }
    if (url.pathname === '/api/places/details' && request.method === 'POST') {
      if (!env.GOOGLE_MAPS_SERVER_KEY) return jsonResponse({ error: 'Location search is not configured.' }, 503);
      if (!isSameOriginRequest(request, url)) return jsonResponse({ error: 'Forbidden.' }, 403);
      const limited = await enforcePlacesRateLimit(request, env.PLACES_DETAILS_RATE_LIMITER, 'details', 20);
      if (limited) return limited;
      return handlePlaceDetails(request, env, url.origin);
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'GET, HEAD' },
      });
    }

    const redirectTarget = retiredRouteTarget(url.pathname);
    if (redirectTarget) return Response.redirect(new URL(redirectTarget, url.origin), 308);
    const html = pages[url.pathname];
    if (html !== undefined) {
      const headers = new Headers({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        ...securityHeaders,
      });
      return new Response(request.method === 'HEAD' ? null : html, { status: 200, headers });
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(securityHeaders)) {
      headers.set(name, value);
    }
    return new Response(request.method === 'HEAD' ? null : response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
`;

await mkdir(serverDirectory, { recursive: true });
await Promise.all([
  writeFile(resolve(serverDirectory, 'index.js'), workerSource, 'utf8'),
  writeFile(cloudflareWorkerEntry, workerSource, 'utf8'),
]);

console.log(`Prepared the Sites worker with ${htmlFiles.length} HTML pages.`);
