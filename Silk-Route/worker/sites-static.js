const securityHeaders = {
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Origin-Agent-Cluster': '?1',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), tools=(self)',
};

function retiredRouteTarget(pathname) {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (/^\/services(?:\.html)?$/.test(normalized)) return '/#services';
  if (/^\/fleet(?:\.html)?$/.test(normalized)) return '/#vehicle';
  if (/^\/about(?:\.html)?$/.test(normalized)) return '/';
  return null;
}

function jsonResponse(body, status = 200, additionalHeaders = {}) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', ...securityHeaders, ...additionalHeaders },
  });
}

function isSameOriginRequest(request, url) {
  const origin = request.headers.get('Origin');
  const referrer = request.headers.get('Referer');
  let referrerOrigin = '';
  try { referrerOrigin = referrer ? new URL(referrer).origin : ''; }
  catch { referrerOrigin = ''; }
  return origin ? origin === url.origin : referrerOrigin === url.origin;
}

function validSessionToken(value) {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function readLimitedJson(request, maxBytes = 2048) {
  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return { error: jsonResponse({ error: 'JSON is required.' }, 415) };
  }
  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { error: jsonResponse({ error: 'Request is too large.' }, 413) };
  }

  const reader = request.body?.getReader();
  if (!reader) return { error: jsonResponse({ error: 'Invalid request.' }, 400) };
  const decoder = new TextDecoder();
  let text = '';
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      return { error: jsonResponse({ error: 'Request is too large.' }, 413) };
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  try { return { value: JSON.parse(text) }; }
  catch { return { error: jsonResponse({ error: 'Invalid request.' }, 400) }; }
}

async function enforcePlacesRateLimit(request, limiter, scope, limit) {
  const clientAddress = request.headers.get('CF-Connecting-IP') || 'unknown-client';
  if (limiter?.limit) {
    const { success } = await limiter.limit({ key: clientAddress });
    return success
      ? null
      : jsonResponse({ error: 'Too many location searches. Please wait a minute and try again.' }, 429, { 'Retry-After': '60' });
  }

  // Sites currently omits custom Rate Limit bindings from packaged Workers.
  // Keep a bounded per-isolate fallback so the protected same-origin proxy stays
  // usable without leaving the Google API completely unmetered.
  const now = Date.now();
  const windows = enforcePlacesRateLimit.fallbackWindows ||= new Map();
  const key = `${scope}:${clientAddress}`;
  let window = windows.get(key);
  if (!window || window.resetAt <= now) {
    window = { count: 0, resetAt: now + 60000 };
    windows.set(key, window);
  }
  window.count += 1;

  if (windows.size > 512) {
    for (const [storedKey, storedWindow] of windows) {
      if (storedWindow.resetAt <= now) windows.delete(storedKey);
    }
    if (windows.size > 512) windows.delete(windows.keys().next().value);
  }

  if (window.count <= limit) return null;
  const retryAfter = Math.max(1, Math.ceil((window.resetAt - now) / 1000));
  return jsonResponse(
    { error: 'Too many location searches. Please wait a minute and try again.' },
    429,
    { 'Retry-After': String(retryAfter) },
  );
}

async function googlePlacesRequest(url, options, env, origin, fieldMask) {
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'X-Goog-Api-Key': env.GOOGLE_MAPS_SERVER_KEY,
      'X-Goog-FieldMask': fieldMask,
      'Referer': `${origin}/quote`,
    },
  });
}

async function handlePlaceAutocomplete(request, env, origin) {
  const parsed = await readLimitedJson(request);
  if (parsed.error) return parsed.error;
  const payload = parsed.value;
  const input = typeof payload.input === 'string' ? payload.input.trim().slice(0, 180) : '';
  const sessionToken = payload.sessionToken;
  if (input.length < 3 || !validSessionToken(sessionToken)) return jsonResponse({ error: 'Invalid search.' }, 400);

  const response = await googlePlacesRequest(
    'https://places.googleapis.com/v1/places:autocomplete',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input,
        sessionToken,
        includedRegionCodes: ['za'],
        languageCode: 'en',
        regionCode: 'za',
        locationBias: {
          circle: {
            center: { latitude: -33.9249, longitude: 18.4241 },
            radius: 50000,
          },
        },
      }),
    },
    env,
    origin,
    'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text',
  );
  if (!response.ok) {
    console.error('Google Places autocomplete failed.', response.status);
    return jsonResponse({ error: 'Location suggestions are unavailable.' }, 502);
  }
  const result = await response.json();
  const suggestions = Array.isArray(result.suggestions) ? result.suggestions.flatMap((suggestion) => {
    const prediction = suggestion?.placePrediction;
    const placeId = typeof prediction?.placeId === 'string' ? prediction.placeId : '';
    const text = typeof prediction?.text?.text === 'string' ? prediction.text.text : '';
    if (!placeId || !text) return [];
    return [{
      placeId,
      text,
      mainText: typeof prediction.structuredFormat?.mainText?.text === 'string' ? prediction.structuredFormat.mainText.text : '',
      secondaryText: typeof prediction.structuredFormat?.secondaryText?.text === 'string' ? prediction.structuredFormat.secondaryText.text : '',
    }];
  }).slice(0, 6) : [];
  return jsonResponse({ suggestions });
}

async function handlePlaceDetails(request, env, origin) {
  const parsed = await readLimitedJson(request);
  if (parsed.error) return parsed.error;
  const payload = parsed.value;
  const placeId = typeof payload.placeId === 'string' ? payload.placeId.trim().slice(0, 300) : '';
  const sessionToken = payload.sessionToken;
  if (!placeId || !validSessionToken(sessionToken)) return jsonResponse({ error: 'Invalid location.' }, 400);

  const detailsUrl = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`);
  detailsUrl.searchParams.set('sessionToken', sessionToken);
  detailsUrl.searchParams.set('languageCode', 'en');
  detailsUrl.searchParams.set('regionCode', 'za');
  const response = await googlePlacesRequest(
    detailsUrl,
    { method: 'GET' },
    env,
    origin,
    'attributions,id,formattedAddress,location',
  );
  if (!response.ok) {
    console.error('Google Places details failed.', response.status);
    return jsonResponse({ error: 'The selected location could not be confirmed.' }, 502);
  }
  const place = await response.json();
  const attributions = Array.isArray(place.attributions) ? place.attributions.flatMap((attribution) => {
    const provider = typeof attribution?.provider === 'string' ? attribution.provider.trim().slice(0, 120) : '';
    const providerUri = typeof attribution?.providerUri === 'string' && /^https:\/\//i.test(attribution.providerUri)
      ? attribution.providerUri
      : '';
    return provider ? [{ provider, providerUri }] : [];
  }).slice(0, 4) : [];
  return jsonResponse({
    id: typeof place.id === 'string' ? place.id : placeId,
    formattedAddress: typeof place.formattedAddress === 'string' ? place.formattedAddress : '',
    location: {
      latitude: Number.isFinite(place.location?.latitude) ? place.location.latitude : null,
      longitude: Number.isFinite(place.location?.longitude) ? place.location.longitude : null,
    },
    attributions,
  });
}

export {
  jsonResponse,
  isSameOriginRequest,
  validSessionToken,
  readLimitedJson,
  enforcePlacesRateLimit,
  googlePlacesRequest,
  handlePlaceAutocomplete,
  handlePlaceDetails,
};

export default {
  async fetch(request, env) {
    const assetUrl = new URL(request.url);
    if (assetUrl.pathname === '/api/places/status' && request.method === 'GET') {
      return jsonResponse({
        enabled: Boolean(env.GOOGLE_MAPS_SERVER_KEY),
      });
    }
    if (assetUrl.pathname === '/api/places/autocomplete' && request.method === 'POST') {
      if (!env.GOOGLE_MAPS_SERVER_KEY) return jsonResponse({ error: 'Location search is not configured.' }, 503);
      if (!isSameOriginRequest(request, assetUrl)) return jsonResponse({ error: 'Forbidden.' }, 403);
      const limited = await enforcePlacesRateLimit(request, env.PLACES_AUTOCOMPLETE_RATE_LIMITER, 'autocomplete', 60);
      if (limited) return limited;
      return handlePlaceAutocomplete(request, env, assetUrl.origin);
    }
    if (assetUrl.pathname === '/api/places/details' && request.method === 'POST') {
      if (!env.GOOGLE_MAPS_SERVER_KEY) return jsonResponse({ error: 'Location search is not configured.' }, 503);
      if (!isSameOriginRequest(request, assetUrl)) return jsonResponse({ error: 'Forbidden.' }, 403);
      const limited = await enforcePlacesRateLimit(request, env.PLACES_DETAILS_RATE_LIMITER, 'details', 20);
      if (limited) return limited;
      return handlePlaceDetails(request, env, assetUrl.origin);
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'GET, HEAD' },
      });
    }

    const redirectTarget = retiredRouteTarget(assetUrl.pathname);
    if (redirectTarget) return Response.redirect(new URL(redirectTarget, assetUrl.origin), 308);
    let response = await env.ASSETS.fetch(new Request(assetUrl, request));

    const requestedFile = assetUrl.pathname.split('/').pop() || '';
    if (response.status === 404 && !requestedFile.includes('.')) {
      assetUrl.pathname = `${assetUrl.pathname.replace(/\/$/, '')}.html`;
      response = await env.ASSETS.fetch(new Request(assetUrl, request));
    }

    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(securityHeaders)) {
      headers.set(name, value);
    }
    if (assetUrl.pathname.endsWith('.html')) {
      headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
