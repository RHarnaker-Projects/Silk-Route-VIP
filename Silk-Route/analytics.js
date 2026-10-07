// Only explicit, consented measurements. Never pass booking fields or link URLs.
const ID = "G-1WHT1TL6EY";
const KEY = "silk-route-analytics-consent-v1";
let enabled = false;
let loaded = false;
function consent() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
function cleanReferrer() {
  try { return new URL(document.referrer).origin + "/"; } catch { return ""; }
}
export function trackEvent(name) {
  if (enabled && ["phone_click", "whatsapp_click", "booking_enquiry"].includes(name)) {
    window.gtag("event", name, { send_to: ID });
  }
}
function start() {
  enabled = true;
  window[`ga-disable-${ID}`] = false;
  if (loaded) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("consent", "default", {
    analytics_storage: "granted", ad_storage: "denied",
    ad_user_data: "denied", ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", ID, {
    page_location: location.origin + location.pathname,
    page_referrer: cleanReferrer(),
    allow_google_signals: false, allow_ad_personalization_signals: false,
    cookie_expires: 60 * 60 * 24 * 180,
  });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
  document.head.append(script);
}
function stop() {
  enabled = false;
  window[`ga-disable-${ID}`] = true;
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (!/^_ga(?:_|$)/.test(name)) continue;
    for (const domain of ["", location.hostname, `.${location.hostname}`, ".silkroute.vip"]) {
      document.cookie = `${name}=; Max-Age=0; Path=/;${domain ? ` Domain=${domain};` : ""} SameSite=Lax`;
    }
  }
}
export function initAnalytics() {
  if (!["silkroute.vip", "www.silkroute.vip"].includes(location.hostname)) return;
  const panel = document.createElement("section");
  panel.className = "analytics-choice";
  panel.setAttribute("aria-label", "Analytics cookie choices");
  panel.innerHTML = `<p>Optional cookies help us improve your experience. <a href="/cookies.html">Details</a></p><div><button type="button" data-accept aria-label="Accept analytics cookies">Accept</button><button type="button" data-reject aria-label="Reject analytics cookies">Reject</button></div>`;
  document.body.append(panel);
  const settings = document.createElement("button");
  settings.type = "button";
  settings.textContent = "Cookie settings";
  settings.className = "analytics-settings";
  document.querySelector(".site-footer .footer-links[aria-label='Legal and trust information']")?.append(settings);
  settings.addEventListener("click", () => { panel.hidden = false; panel.querySelector("button").focus(); });
  const choose = (value) => {
    try { localStorage.setItem(KEY, value); } catch { /* Keep the choice for this page only. */ }
    panel.hidden = true;
    if (value === "accepted") start(); else stop();
    settings.focus();
  };
  panel.querySelector("[data-accept]").addEventListener("click", () => choose("accepted"));
  panel.querySelector("[data-reject]").addEventListener("click", () => choose("rejected"));
  const saved = consent();
  panel.hidden = saved === "accepted" || saved === "rejected";
  if (saved === "accepted") start();
  window.addEventListener("storage", (event) => {
    if (event.key === KEY && event.newValue !== "accepted") { stop(); panel.hidden = false; }
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    if (link.protocol === "tel:") trackEvent("phone_click");
    if (link.hostname === "wa.me") trackEvent("whatsapp_click");
  });
}
