import { readFile, access, stat } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "quote.html", "contact.html", "privacy.html", "terms.html", "cookies.html", "information-access.html", "accessibility.html", "media-credits.html"];
const failures = [];
const socialImageUrl = "https://silkroute.vip/silk-route-share-20260827.jpg";

for (const page of pages) {
  const html = await readFile(resolve(root, page), "utf8");
  const count = (pattern) => (html.match(pattern) || []).length;
  if (!/<title>[^<]{15,}<[\/]title>/.test(html)) failures.push(`${page}: missing useful title`);
  if (!/<meta name="description" content="[^"]{50,}"/.test(html)) failures.push(`${page}: missing useful meta description`);
  if (!/<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">/.test(html)) {
    failures.push(`${page}: missing complete search-preview directives`);
  }
  if (count(/<h1[\s>]/g) !== 1) failures.push(`${page}: expected exactly one h1`);
  if (!/<link rel="canonical"/.test(html)) failures.push(`${page}: missing canonical URL`);
  if (!html.includes('property="og:url" content="https://silkroute.vip/')) failures.push(`${page}: Open Graph URL must use the apex domain`);
  if (!html.includes(`property="og:image" content="${socialImageUrl}"`)
    || !html.includes(`property="og:image:url" content="${socialImageUrl}"`)
    || !html.includes(`property="og:image:secure_url" content="${socialImageUrl}"`)) {
    failures.push(`${page}: missing the versioned apex-domain Open Graph image`);
  }
  if (!html.includes('property="og:image:type" content="image/jpeg"')
    || !html.includes('property="og:image:width" content="1200"')
    || !html.includes('property="og:image:height" content="630"')) {
    failures.push(`${page}: social image type or dimensions are incorrect`);
  }
  if (!html.includes(`name="twitter:image" content="${socialImageUrl}"`)
    || !html.includes(`rel="image_src" href="${socialImageUrl}"`)) {
    failures.push(`${page}: social-image fallbacks are incomplete`);
  }
  if (/www[.]silkroute[.]vip|og[.]png[?]v=20260827/.test(html)) failures.push(`${page}: contains retired social-preview URLs`);
  if (!/class="skip-link"/.test(html)) failures.push(`${page}: missing skip link`);
  if (!/data-site-header/.test(html) || !/data-site-footer/.test(html)) failures.push(`${page}: missing shared site chrome mounts`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) failures.push(`${page}: duplicate ids ${[...new Set(duplicateIds)].join(", ")}`);
  const images = [...html.matchAll(/<img\s[^>]*>/g)].map((match) => match[0]);
  for (const image of images) {
    if (!/\salt="[^"]+"/.test(image)) failures.push(`${page}: image missing useful alt text`);
  }
  const pageLinks = [...html.matchAll(/href="\/([^"?#]+[.]html)(?:[#?][^"]*)?"/g)].map((match) => match[1]);
  for (const linkedPage of pageLinks) {
    try { await access(resolve(root, linkedPage)); }
    catch { failures.push(`${page}: broken page link /${linkedPage}`); }
  }
  const localAssets = [...html.matchAll(/(?:src|href)="(\/(?:assets\/[^"?#]+|styles[.]css|site[.]js))"/g)].map((m) => m[1]);
  for (const asset of localAssets) {
    try { await access(resolve(root, asset.slice(1))); }
    catch { failures.push(`${page}: missing local asset ${asset}`); }
  }
}

const socialImageStats = await stat(resolve(root, "public", "silk-route-share-20260827.jpg"));
if (socialImageStats.size > 300 * 1024) failures.push("social preview image must stay below 300 KB for messaging compatibility");

const quote = await readFile(resolve(root, "quote.html"), "utf8");
const requiredNames = ["service", "traveller_name", "email", "phone", "date", "time", "pickup", "pickup_place_id", "pickup_lat", "pickup_lng", "destination", "destination_place_id", "destination_lat", "destination_lng", "passengers", "large_luggage", "extras", "driver_attire", "requirements"];
for (const name of requiredNames) {
  if (!new RegExp(`name="${name}"`).test(quote)) failures.push(`quote.html: missing ${name} field`);
}
if (quote.indexOf('name="service"') > quote.indexOf('name="traveller_name"')) failures.push("quote.html: service must be the first booking field");
if (/class="page-hero"/.test(quote)) failures.push("quote.html: booking page must not use a hero");
if (/Start typing to see verified Google location suggestions[.]/.test(quote)) failures.push("quote.html: contains the removed static Google location helper text");
if ((quote.match(/<p class="field-help"[^>]*data-place-help><[\/]p>/g) || []).length !== 2) {
  failures.push("quote.html: expected two initially empty location status regions");
}

const siteScript = await readFile(resolve(root, "site.js"), "utf8");
const placesWorker = await readFile(resolve(root, "worker", "sites-static.js"), "utf8");
const sitesBuildScript = await readFile(resolve(root, "scripts", "prepare-sites-build.mjs"), "utf8");
const sitesViteConfig = await readFile(resolve(root, "vite.sites.config.js"), "utf8");
const placesRuntime = siteScript + placesWorker + sitesBuildScript;
if (!/[/]api[/]places[/]status/.test(siteScript) || !/[/]api[/]places[/]autocomplete/.test(siteScript) || !/[/]api[/]places[/]details/.test(siteScript)) {
  failures.push("site.js: booking locations must use the same-origin Places proxy");
}
if (!/crypto[.]randomUUID\(\)/.test(siteScript) || !/sessionToken/.test(siteScript)) {
  failures.push("site.js: booking locations must use a separate Places session token");
}
if (!/option[.]tabIndex\s*=\s*-1/.test(siteScript) || !/requestId\s*!==\s*latestRequestId/.test(siteScript)) {
  failures.push("site.js: accessible Places options must be non-tabbable and stale-response guarded");
}
if (/Start typing to see verified Google location suggestions[.]/.test(siteScript)) failures.push("site.js: restores the removed static Google location helper text");
if (/Verified Google location selected[.]/.test(siteScript)) failures.push("site.js: selected locations must not show redundant verification copy");
if (!/useManualLocationFields/.test(siteScript) || !/removeAttribute\(attribute\)/.test(siteScript) || !/placeManualAllowed\s*=\s*"true"/.test(siteScript)) {
  failures.push("site.js: Places failures must fall back to honest manual address fields");
}
if (!/GOOGLE_MAPS_SERVER_KEY/.test(placesWorker) || !/places.googleapis.com[/]v1[/]places:autocomplete/.test(placesWorker)) {
  failures.push("worker: missing the server-side Google Places autocomplete proxy");
}
if (!/[\"']attributions,id,formattedAddress,location[\"']/.test(placesWorker) || !/X-Goog-FieldMask/.test(placesWorker)) {
  failures.push("worker: Google Place Details must use the Essentials-only field mask");
}
if (!/isSameOriginRequest/.test(placesWorker) || !/isSameOriginRequest/.test(sitesBuildScript)) {
  failures.push("Sites worker: Places POST requests must be same-origin protected");
}
if (!/readLimitedJson/.test(placesWorker) || !/enforcePlacesRateLimit/.test(placesWorker)) {
  failures.push("worker: Places requests must have size and rate limits");
}
if (!/fallbackWindows/.test(placesWorker) || !/windows[.]size > 512/.test(placesWorker)
  || !/["']autocomplete["'], 60/.test(placesWorker) || !/["']details["'], 20/.test(placesWorker)) {
  failures.push("worker: Places proxy must retain bounded fallback rate limits when Sites omits edge bindings");
}
if (!/providerUri/.test(placesWorker) || (quote.match(/data-place-selected-attribution/g) || []).length !== 2) {
  failures.push("booking form: selected locations must retain required provider attribution");
}
if (!/PLACES_AUTOCOMPLETE_RATE_LIMITER/.test(sitesViteConfig) || !/PLACES_DETAILS_RATE_LIMITER/.test(sitesViteConfig)) {
  failures.push("vite.sites.config.js: missing edge rate-limit bindings for Places");
}
if (/PlaceAutocompleteElement|gmp-place-autocomplete|data-place-widget|data-place-fallback|AutocompleteSuggestion|AutocompleteSessionToken|api[/]maps-config|GOOGLE_MAPS_BROWSER_KEY|VITE_GOOGLE_MAPS_BROWSER_KEY/.test(placesRuntime + quote)) {
  failures.push("booking form: unstable Google autocomplete widget must not be used");
}
if (!/document[.]modelContext/.test(siteScript)
  || !/typeof modelContext[.]registerTool !== "function"/.test(siteScript)
  || !/name: "get_silk_route_services"/.test(siteScript)
  || !/name: "prepare_chauffeur_enquiry"/.test(siteScript)) {
  failures.push("site.js: missing progressive WebMCP service and booking tools");
}
if (!/readOnlyHint: true/.test(siteScript)
  || !/submitted: false/.test(siteScript)
  || !/Nothing has been sent[.]/.test(siteScript)
  || /toolautosubmit|requestSubmit\(/.test(siteScript + quote)) {
  failures.push("WebMCP: booking preparation must remain review-only and never auto-submit");
}
if (!/A compatible browser assistant may fill this visible form/.test(quote)) {
  failures.push("quote.html: missing visible WebMCP review and submission boundary");
}
const publicHeaders = await readFile(resolve(root, "public", "_headers"), "utf8");
for (const [sourceName, source] of [["worker/sites-static.js", placesWorker], ["scripts/prepare-sites-build.mjs", sitesBuildScript], ["public/_headers", publicHeaders]]) {
  if (!/Origin-Agent-Cluster['"]?:?\s*['"]?[?]1/.test(source)
    || !/Permissions-Policy['"]?:?\s*['"]?camera=\(\), microphone=\(\), geolocation=\(\), tools=\(self\)/.test(source)) {
    failures.push(`${sourceName}: missing origin isolation or same-origin WebMCP permissions policy`);
  }
}
if ((quote.match(/data-place-suggestions/g) || []).length !== 2 || (quote.match(/role="combobox"/g) || []).length !== 2) {
  failures.push("quote.html: expected two accessible Google location suggestion fields");
}
if ((quote.match(/data-place-options/g) || []).length !== 2 || (quote.match(/translate="no">Google Maps/g) || []).length !== 4) {
  failures.push("quote.html: Google suggestion lists must include visible Google Maps attribution");
}
if (!/<input[^>]+name="passengers"[^>]+type="number"/.test(quote)) failures.push("quote.html: passengers must be an open numeric field");
if (!/<input[^>]+name="large_luggage"[^>]+type="number"/.test(quote)) failures.push("quote.html: large luggage must be a numeric field");
if ((quote.match(/<option(?:\s|>)/g) || []).length !== 5) failures.push("quote.html: expected the placeholder and exactly four booking services");
if (!/<option>Point-to-Point &amp; Event Transfers<[/]option>/.test(quote)) failures.push("quote.html: missing the approved Point-to-Point & Event Transfers option");
if (/Office on the Go|Special Occasions/.test(quote)) failures.push("quote.html: contains a retired booking service");
if (!/value="Executive Package: Printer, Scanner, Copier, Shredder, Onboard UPS"/.test(quote) || /Office Bundle|Binder/i.test(quote)) {
  failures.push("quote.html: optional working equipment must use the Executive Package name");
}
if (!/type="checkbox" name="extras" value="Wi-Fi"/.test(quote) || (quote.match(/type="checkbox" name="extras"/g) || []).length !== 3) {
  failures.push("quote.html: Wi-Fi must be its own optional-extra checkbox");
}

const home = await readFile(resolve(root, "index.html"), "utf8");
const structuredDataMatch = home.match(/<script type="application[/]ld[+]json">\s*([\s\S]*?)\s*<[\/]script>/);
if (!structuredDataMatch) {
  failures.push("index.html: missing JSON-LD structured data");
} else {
  try {
    const structuredData = JSON.parse(structuredDataMatch[1]);
    const graph = structuredData["@graph"];
    const graphTypes = Array.isArray(graph) ? graph.map((node) => node["@type"]) : [];
    for (const requiredType of ["WebSite", "Organization", "Service", "FAQPage"]) {
      if (!graphTypes.includes(requiredType)) failures.push(`index.html: JSON-LD graph is missing ${requiredType}`);
    }
    const faq = Array.isArray(graph) ? graph.find((node) => node["@type"] === "FAQPage") : undefined;
    if (!Array.isArray(faq?.mainEntity) || faq.mainEntity.length !== 7) {
      failures.push("index.html: structured journey guide must contain seven questions");
    }
    const service = Array.isArray(graph) ? graph.find((node) => node["@type"] === "Service") : undefined;
    if (service?.hasOfferCatalog?.itemListElement?.length !== 4) {
      failures.push("index.html: structured service catalogue must contain four priced services");
    }
  } catch (error) {
    failures.push(`index.html: invalid JSON-LD (${error.message})`);
  }
}
if ((home.match(/<details>/g) || []).length !== 7 || (home.match(/<summary>/g) || []).length !== 7) {
  failures.push("index.html: visible journey guide must contain seven accessible questions");
}
if (!/id="journey-questions"/.test(home) || !/What is Silk Route[?]/.test(home) || !/Where does Silk Route operate[?]/.test(home)) {
  failures.push("index.html: answer-ready journey guide is incomplete");
}
if (!/hero-silk-route-premium-mobile-v13-portrait-web[.]mp4/.test(home) || /hero-silk-route-premium-mobile-v(?:11|12)-portrait-web[.]mp4/.test(home)) {
  failures.push("index.html: mobile hero must use the 22-second v13 cut");
}
if (!/<h1 id="hero-title">Arrive <span>Relaxed<[/]span><[/]h1>/.test(home)) failures.push("index.html: homepage hero must use Arrive Relaxed without a full stop");
if (!/whether it’s a romantic evening or a night out with friends/.test(home)) failures.push("index.html: Dinner Service must use the approved night-out wording");
if ((home.match(/<article class="package-card/g) || []).length !== 5) failures.push("index.html: expected exactly five service package cards");
if (!/data-vehicle-gallery/.test(home) || !/data-gallery-open/.test(home)) failures.push("index.html: missing vehicle gallery dialog or trigger");
if ((home.match(/data-vehicle-carousel/g) || []).length !== 2 || !/class="vehicle-showcase"/.test(home)) failures.push("index.html: vehicle carousel must appear both on the homepage and in the dialog");
if (/package-card__top|The city is the view|Cape Town, entirely on your terms/i.test(home)) failures.push("index.html: contains service labels or the retired city-view section");
if (!/package-card package-card--daily/.test(home) || !/Choose the service that best suits <em>your needs[.]<[/]em>/.test(home)) failures.push("index.html: missing the approved service heading or Daily Chauffeur emphasis");
if ((home.match(/1 of 8/g) || []).length !== 2 || (home.match(/src="[/]assets[/]images[/]v300-exterior[.]webp"/g) || []).length !== 2) failures.push("index.html: both vehicle galleries must start with the approved exterior image and eight-image count");
if ((home.match(/data-gallery-autoplay(?:\s|>)/g) || []).length !== 1 || /data-gallery-autoplay-toggle|gallery-autoplay-toggle/.test(home)) failures.push("index.html: only the inline vehicle gallery may autoplay and it must not show play or pause controls");
if (!/const VEHICLE_GALLERY = \[\s*{ src: v300ExteriorUrl/.test(siteScript)) failures.push("site.js: approved exterior image must be first in the vehicle gallery sequence");
if (!/const GALLERY_AUTOPLAY_INTERVAL = 5000;/.test(siteScript) || !/IntersectionObserver/.test(siteScript) || !/visibilitychange/.test(siteScript) || !/prefers-reduced-motion: reduce/.test(siteScript)) {
  failures.push("site.js: vehicle autoplay must use the approved interval and pause safeguards");
}
if (!/<h3>Point-to-Point &amp; Event Transfers<[/]h3>/.test(home) || !/service=Point-to-Point%20%26%20Event%20Transfers/.test(home)) {
  failures.push("index.html: event service title and booking link must use the approved name");
}
if (!/Executive Package/.test(home) || /Office Bundle|Binder|service=Office%20on%20the%20Go/i.test(home)) {
  failures.push("index.html: optional equipment must use Executive Package without a retired service query");
}

const contact = await readFile(resolve(root, "contact.html"), "utf8");
if (/Based in Cape Town/.test(contact)) failures.push("contact.html: contains the removed Based in Cape Town contact card");
if (/Helpful details|A better quote begins with|Share journey details|cape-grid|v300-luggage[.]webp/.test(contact)) {
  failures.push("contact.html: contains the removed quote-guidance section");
}

const cookies = await readFile(resolve(root, "cookies.html"), "utf8");
const privacy = await readFile(resolve(root, "privacy.html"), "utf8");
if (!/Browser assistants and WebMCP/.test(cookies)
  || !/does not auto-submit the form/.test(cookies)
  || !/cannot submit the form or send the enquiry/.test(privacy)) {
  failures.push("legal notices: missing transparent WebMCP data and submission boundaries");
}
if (/www[.]silkroute[.]vip/.test(siteScript)) failures.push("site.js: footer contains the retired www host");

const llmsSource = await readFile(resolve(root, "llms.txt"), "utf8");
const llmsPublic = await readFile(resolve(root, "public", "llms.txt"), "utf8");
if (llmsSource !== llmsPublic) failures.push("llms.txt: source and public discovery files differ");
if (!/^# Silk Route/m.test(llmsSource)
  || !/https:\/\/silkroute[.]vip\//.test(llmsSource)
  || !/Daily Chauffeur Service: R7,500/.test(llmsSource)
  || !/[+]27 74 537 7310/.test(llmsSource)) {
  failures.push("llms.txt: missing canonical Silk Route facts");
}
if (/www[.]silkroute[.]vip/.test(llmsSource)) failures.push("llms.txt: contains the retired www host");

const styles = await readFile(resolve(root, "styles.css"), "utf8");
if (!/[.]field-help:empty\s*{\s*display:\s*none;\s*}/.test(styles)) failures.push("styles.css: empty live location status regions must not reserve space");
if (!/[.]package-card h3\s*{[^}]*color:\s*var\(--gold\)/s.test(styles)) failures.push("styles.css: every service-card name must use gold");
if (!/[.]package-meta\s*{\s*font-size:\s*clamp\([.]82rem,\s*1vw,\s*[.]92rem\);\s*}/s.test(styles)) failures.push("styles.css: passenger and duration details must use the enlarged size");
if (!/[.]package-office strong\s*{\s*font-size:\s*clamp\([.]82rem,\s*1vw,\s*[.]92rem\);\s*}/s.test(styles)) failures.push("styles.css: Executive Package label must match the passenger-detail size");
if (!/[.]package-office\s*{[^}]*align-items:\s*baseline;/s.test(styles)) failures.push("styles.css: Executive Package equipment must share the label baseline");
if (!/[.]choice-grid--extras\s*{\s*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);\s*}/.test(styles)) failures.push("styles.css: three optional extras must use a balanced desktop grid");
if (!/[.]nav-logo\s*{[^}]*width:\s*16[.]75rem/s.test(styles) || !/width:\s*min\(12[.]5rem,\s*calc\(100vw - 7rem\)\)/.test(styles)) {
  failures.push("styles.css: header brand must retain its enlarged responsive sizing");
}
if (!/width:\s*min\(20[.]5rem,\s*88%\)/.test(styles)) failures.push("styles.css: footer brand must retain its enlarged sizing");

const mobileStyles = styles.split("@media (max-width: 640px) {")[1]?.split("@media (max-width: 560px) {")[0] ?? "";
if (!/[.]vehicle-showcase\s*{\s*padding-inline:\s*0;\s*}/.test(mobileStyles)
  || !/[.]vehicle-showcase\s*>\s*[.]shell\s*{[^}]*width:\s*100%;[^}]*max-width:\s*none;/s.test(mobileStyles)
  || !/[.]vehicle-gallery-inline\s*{[^}]*padding:\s*0;[^}]*border-right:\s*0;[^}]*border-left:\s*0;/s.test(mobileStyles)) {
  failures.push("styles.css: mobile vehicle gallery must use the full viewport width");
}
if (!/[.]vehicle-gallery-inline\s+[.]gallery-control\s*{\s*display:\s*none;\s*}/.test(mobileStyles)) {
  failures.push("styles.css: inline vehicle-gallery arrows must stay hidden on mobile");
}

const removedRoutePattern = /\/(?:services|fleet|about)[.]html/;
for (const file of ["index.html", "site.js", "vite.config.js", "vite.sites.config.js", "sitemap.xml", "public/sitemap.xml"]) {
  const source = await readFile(resolve(root, file), "utf8");
  if (removedRoutePattern.test(source)) failures.push(`${file}: contains a retired public-page link`);
}

const brandMarks = ["silk-route-horizontal.svg", "silk-route-lockup.svg", "silk-route-mark.svg", "favicon.svg"];
const canonicalMark = await readFile(resolve(root, "assets", "icons", "silk-route-mark.svg"), "utf8");
const canonicalPath = canonicalMark.match(/<path fill="url\(#silkGold\)" d="([^"]+)"\/>/)?.[1];
if (!canonicalPath) failures.push("silk-route-mark.svg: canonical original-route path is missing");
const canonicalCircles = [
  '<circle cx="176.5" cy="14.5" r="16" fill="#A71E1D" opacity=".24"/>',
  '<circle cx="176.5" cy="14.5" r="11.5"',
  '<circle cx="173.2" cy="11.2" r="2.6" fill="#FFAE92" opacity=".7"/>',
];
const canonicalRedStops = ['stop-color="#F36A56"', 'stop-color="#D6382D"', 'stop-color="#981817"'];

for (const asset of brandMarks) {
  const svg = await readFile(resolve(root, "assets", "icons", asset), "utf8");
  if (!svg.includes(`d="${canonicalPath}"`)) failures.push(`${asset}: journey path differs from the canonical brand mark`);
  for (const circle of canonicalCircles) {
    if (!svg.includes(circle)) failures.push(`${asset}: destination-point geometry differs from the canonical brand mark`);
  }
  for (const stop of canonicalRedStops) {
    if (!svg.includes(stop)) failures.push(`${asset}: destination-point colour differs from the canonical brand mark`);
  }
}

if (!/viewBox="0 0 260 270"/.test(canonicalMark)) failures.push("silk-route-mark.svg: original broad-route canvas must be retained");
const faviconLogo = await readFile(resolve(root, "assets", "icons", "favicon.svg"), "utf8");
if (!/transform="translate\(6 4\) scale\([.]22\)"/.test(faviconLogo)) failures.push("favicon.svg: original route must remain legible within the icon canvas");

for (const asset of ["silk-route-horizontal.svg", "silk-route-lockup.svg"]) {
  const svg = await readFile(resolve(root, "assets", "icons", asset), "utf8");
  if (!/fill="#D8B66A"[^>]+font-family="Montserrat, Arial, Helvetica, sans-serif"[^>]+font-weight="700"/.test(svg)) {
    failures.push(`${asset}: tagline must match the Cape Town label font and colour treatment`);
  }
}

const horizontalLogo = await readFile(resolve(root, "assets", "icons", "silk-route-horizontal.svg"), "utf8");
if (!/font-size="44" letter-spacing="8[.]2">SILK ROUTE<[/]text>/.test(horizontalLogo)) {
  failures.push("silk-route-horizontal.svg: wordmark must retain its enlarged typography");
}
if (!/font-size="20" font-weight="700" letter-spacing="2">THE SMOOTHEST WAY TO TRAVEL<[/]text>/.test(horizontalLogo)) {
  failures.push("silk-route-horizontal.svg: enlarged tagline must keep the complete word TRAVEL inside the logo boundary");
}

const lockupLogo = await readFile(resolve(root, "assets", "icons", "silk-route-lockup.svg"), "utf8");
if (!/font-size="62" letter-spacing="14">SILK ROUTE<[/]text>/.test(lockupLogo)) {
  failures.push("silk-route-lockup.svg: wordmark must retain its enlarged typography");
}
if (!/font-size="24" font-weight="700" letter-spacing="4[.]5">THE SMOOTHEST WAY TO TRAVEL<[/]text>/.test(lockupLogo)) {
  failures.push("silk-route-lockup.svg: tagline must retain its enlarged typography");
}

if (failures.length) {
  console.error(`Site checks failed (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`Site checks passed for ${pages.length} pages, shared assets, metadata and enquiry fields.`);
