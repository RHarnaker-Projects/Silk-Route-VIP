# Setup and builds

## Requirements

Use Node.js 22.12 or newer and npm. The lockfile resolves Vite 7.3.6, Wrangler 4.92.0 and `@cloudflare/vite-plugin` 1.37.1. Vite requires `^20.19.0 || >=22.12.0`; Wrangler requires `>=22.0.0`, so Node 22.12+ satisfies both. Verification used Node 22.22.3 and npm 10.9.8 on Windows.

There is no React or Next.js application here. The website uses nine HTML pages, shared CSS, plain browser JavaScript and Vite. A JavaScript worker provides server-side Places requests and static routing. No project database is configured.

## Preview the website

Extract the archive, open a terminal in `Silk-Route`, then run:

```powershell
npm ci
npm run dev
```

Open `http://127.0.0.1:5173/`. The ordinary Vite dev server serves the frontend; it does not run the Places worker. Location fields fall back to manual entry when `/api/places/status` is unavailable. The enquiry form prepares a WhatsApp message on the user's device; the user sends it in WhatsApp. There is no email or CRM booking backend in this source.

## Check and build a static website

```powershell
npm run check
node --test scripts/analytics.test.mjs
npm run build
npm run preview
```

`npm run check` checks all nine pages, local assets, metadata and enquiry fields. `npm run build` uses `vite.config.js` and writes the static site to `dist/`. `npm run preview` previews that output locally. Static hosting alone supplies the frontend and manual address entry; Google Places requires the same-origin worker described below.

## Build for the existing Sites hosting path

```powershell
npm run build:sites
```

This command removes the extracted project's previous `dist/`, builds with `vite.sites.config.js`, and runs `scripts/prepare-sites-build.mjs`. The output contains `dist/client/`, `dist/server/index.js` and `dist/silk_route/index.js`. The preparation step embeds the nine HTML pages in the worker for `/`, clean page routes and `.html` routes. `build/sites-vite-plugin.js` copies `.openai/hosting.json` into `dist/.openai/hosting.json`.

The explicit worker settings are: name `silk-route`, compatibility date `2026-05-22`, static asset binding `ASSETS`, `run_worker_first: true`, and `single-page-application` not-found handling. The worker also redirects retired `/services`, `/fleet` and `/about` routes. The config declares autocomplete and details rate-limit bindings at 60 and 20 requests per minute respectively; the worker includes a per-isolate fallback when the platform omits those bindings.

The required server-side secret is `GOOGLE_MAPS_SERVER_KEY`. Its value is deliberately absent. The same-origin endpoints are `GET /api/places/status`, `POST /api/places/autocomplete` and `POST /api/places/details`. With no secret, status reports disabled and the browser uses manual address entry. Source calls Google Places API (New); the owner must configure the API project, billing and appropriate key restrictions. Never put the key in frontend source.

No deployment was performed. The included package scripts have no deploy command, and there is no standalone `wrangler.toml` or account/zone configuration. A different host needs explicit asset/worker wiring and secret configuration. This package does not invent provider-specific deployment commands or imply that a static-only upload supplies the Places service.

The historical `dev:seedance` command and video-editing PowerShell scripts are preserved as source. They are outside the current runtime/build path; their alternate film inputs are excluded from this runtime handover. See [media](MEDIA.md). See [hosting and access](HOSTING_AND_ACCESS.md) for owner actions.
