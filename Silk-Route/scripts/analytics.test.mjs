import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';
const source = readFileSync(new URL('../analytics.js', import.meta.url), 'utf8').replaceAll('export function', 'function');
function setup(saved, hostname = 'silkroute.vip') {
  const nodes = [];
  const scripts = [];
  const storage = new Map(saved ? [['silk-route-analytics-consent-v1', saved]] : []);
  function node() {
    const children = new Map();
    return { handlers: {}, hidden: false, setAttribute() {}, focus() {}, append() {},
      addEventListener(name, fn) { this.handlers[name] = fn; },
      querySelector(key) { if (!children.has(key)) children.set(key, node()); return children.get(key); },
    };
  }
  const doc = { cookie: '_ga=old; _ga_1WHT1TL6EY=old', referrer: 'https://example.com/private?email=secret',
    createElement() { const el = node(); nodes.push(el); return el; },
    querySelector: () => node(), body: { append() {} }, head: { append(el) { scripts.push(el); } },
    handlers: {}, addEventListener(name, fn) { this.handlers[name] = fn; },
  };
  const win = { addEventListener() {} };
  const ctx = { document: doc, window: win, location: { hostname, origin: `https://${hostname}`, pathname: '/quote.html', search: '?email=secret' }, URL, Date,
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) } };
  runInNewContext(source + '\ninitAnalytics(); this.track = trackEvent;', ctx);
  return { ctx, win, doc, nodes, scripts, accept: () => nodes[0].querySelector('[data-accept]').handlers.click(), reject: () => nodes[0].querySelector('[data-reject]').handlers.click() };
}
test('No requests before consent, or when rejected, or on preview hosts', () => {
  for (const run of [setup(), setup('rejected'), setup('accepted', 'localhost')]) {
    assert.equal(run.scripts.length, 0); run.ctx.track('phone_click'); assert.equal(run.win.dataLayer, undefined);
  }
});
test('Consent loads tag once with sanitized URLs and disabled advertising', () => {
  const run = setup(); run.accept(); run.accept();
  assert.equal(run.scripts.length, 1);
  const config = Array.from(run.win.dataLayer.find(args => args[0] === 'config'))[2];
  assert.equal(config.page_location, 'https://silkroute.vip/quote.html');
  assert.equal(config.page_referrer, 'https://example.com/');
  assert.equal(config.allow_google_signals, false);
  assert.equal(JSON.stringify(run.win.dataLayer).includes('secret'), false);
});
test('Only allowlisted events, without form or URL payloads; withdrawal stops tracking', () => {
  const run = setup('accepted');
  for (const name of ['phone_click', 'whatsapp_click', 'booking_enquiry', 'name=private']) run.ctx.track(name);
  const events = run.win.dataLayer.filter(args => args[0] === 'event');
  assert.equal(events.length, 3);
  for (const args of events) assert.deepEqual(Object.keys(args[2]), ['send_to']);
  run.reject(); const count = run.win.dataLayer.length; run.ctx.track('phone_click');
  assert.equal(run.win.dataLayer.length, count);
  assert.equal(run.win['ga-disable-G-1WHT1TL6EY'], true);
  run.accept(); assert.equal(run.win['ga-disable-G-1WHT1TL6EY'], false);
  assert.equal(run.scripts.length, 1);
});
