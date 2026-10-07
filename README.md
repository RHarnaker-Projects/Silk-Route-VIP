# Silk Route

A focused website for Silk Route, a Cape Town luxury chauffeur service operating a black 2023 Mercedes-Benz V300d Exclusive AMG Line.

## Local preview

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Production build

```powershell
npm run check
npm run build
npm run preview
```

The deployable static site is generated in `dist/`.

## Included

- A streamlined Home, Book Your Journey and Contact experience with supporting legal and trust pages
- Responsive desktop, tablet and mobile navigation
- Native-1080p Cape Town automotive hero film with separate optimized desktop and mobile encodes
- Curated and optimized photography of the client's actual Mercedes-Benz V300d
- Reconstructed vector logo assets for navigation, brand moments and favicon use
- Five clearly priced service and extras cards, plus a vehicle gallery pop-up
- WhatsApp booking actions and a detailed enquiry form that prepares a customer message on-device
- Google Places location suggestions through a same-origin server proxy, with the API key kept out of the browser
- Page-specific titles, descriptions, canonical links, social preview metadata, sitemap and robots file
- WebSite, Organization, Service and FAQ structured data, a visible journey-answer guide and a concise `llms.txt` discovery summary
- Progressive WebMCP tools for reading the public service catalogue and safely preparing the visible booking form for traveller review without automatic submission
- Semantic headings, labelled fields, keyboard focus states, skip links and reduced-motion support

## Before public launch

- Confirm the final public domain and update canonical/social URLs if it differs from `silkroute.vip`.
- Confirm the public booking number remains `+27 74 537 7310`.
- For hosted Sites, store the restricted Google Maps Platform key as the runtime secret `GOOGLE_MAPS_SERVER_KEY`. Enable Places API (New) and restrict the key to the live site origin; the booking page calls only the site's `/api/places/*` endpoints.
- Obtain the client's final approval of all copy, the reconstructed logo, vehicle claims and imagery.
- Retain the approved Higgsfield and Seedance generation records, licensed location-plate provenance and optimized source files with the final client handover.
- Connect the quote journey to a production email, CRM or booking backend if WhatsApp-only handling is not desired.

## Media notes

Vehicle photography was supplied through the client's shared Google Drive. The final Cape Town hero film was generated in Higgsfield from two of those real V300d references, then composition-corrected and optimized locally for web delivery. Higgsfield generation ID: `04d8e513-398a-4374-a7d4-90cf8d3eabc3`.

The current 22-second premium homepage hero is delivered at 24 fps with a 1920x1080 desktop encode and a separately reframed 720x1280 mobile encode. Its sequence is: an authentic licensed Pexels Cape Town opening, the client's black V300d driving in the correct ocean-side lane on a real 4K Western Cape coastal-road plate, the client's real V300d exterior, the client's original sharp 7008x4672 cabin-and-coast photograph, and a four-second hotel arrival where the closed vehicle pulls under the canopy and settles beside the entrance. The cabin scene uses `DSC09206 (1).jpg` exactly as supplied by the photographer: desktop begins on the complete cabin composition and eases toward the real coastline through the open doorway, while mobile starts inside the scenic opening and uses only a restrained move so the door frame never becomes the focal point. No image generation, replacement scenery, deblurring or AI upscaling was applied to this photograph. The hotel closing is rendered directly from its original 1280x720, 24 fps source into each delivery master, avoiding the previous intermediate 1080p/30 fps upscale. Client-source provenance is recorded in `assets/source/client-photography/SOURCES.md`; location-plate licensing remains in `assets/source/location-plates/SOURCES.md`. Accepted Higgsfield job IDs remain `4e24b3e1-4a38-4c2d-aca5-d76e3063f62b` (opening), `e988293e-1680-4ce6-8e30-f94d729c01ef` (two-reference coastal drive), and `8e1bb88b-8f07-45a9-9559-65a263794b58` (exterior); this photographer-original replacement used no additional Higgsfield credits.
