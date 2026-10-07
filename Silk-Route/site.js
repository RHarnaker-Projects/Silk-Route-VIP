import { initAnalytics, trackEvent } from "./analytics.js";
import lockupSvg from "./assets/icons/silk-route-lockup.svg?raw";
import horizontalLogoSvg from "./assets/icons/silk-route-horizontal.svg?raw";
import v300HeroUrl from "./assets/images/v300-hero.webp?url";
import v300ExteriorUrl from "./assets/images/v300-exterior.webp?url";
import v300DetailUrl from "./assets/images/v300-detail.webp?url";
import v300ChauffeurUrl from "./assets/images/v300-chauffeur.webp?url";
import v300CabinUrl from "./assets/images/v300-cabin.webp?url";
import v300LoungeUrl from "./assets/images/v300-lounge.webp?url";
import v300CockpitUrl from "./assets/images/v300-cockpit.webp?url";
import v300LuggageUrl from "./assets/images/v300-luggage.webp?url";

const PAGE_LINKS = [
  ["home", "Home", "/"],
  ["contact", "Contact", "/contact.html"],
];

const WHATSAPP_NUMBER = "27745377310";
const WEBMCP_SERVICE_CATALOG = Object.freeze([
  { name: "Daily Chauffeur Service", price: 7500, currency: "ZAR", duration: "12 hours", extendable: true },
  { name: "Multi-day Chauffeur Service", price: 7150, currency: "ZAR", duration: "12 hours", extendable: true },
  { name: "Dinner Service", price: 3950, currency: "ZAR", duration: "4.5 hours", extendable: true },
  { name: "Point-to-Point & Event Transfers", price: 1950, currency: "ZAR", duration: "Up to 2 hours", extendable: true },
]);
const WEBMCP_EXTRAS = Object.freeze([
  "Baby Car Seat",
  "Wi-Fi",
  "Executive Package: Printer, Scanner, Copier, Shredder, Onboard UPS",
]);
const arrowIcon = `<svg aria-hidden="true" viewBox="0 0 16 16" fill="none"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const whatsappIcon = `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.4-4.3a8.5 8.5 0 1 1 15.6-4.5Z" stroke="currentColor" stroke-width="1.6"/><path d="M8.1 7.7c.2-.5.4-.5.8-.5h.5c.2 0 .4.1.5.4l.8 2c.1.3.1.5-.1.7l-.6.8c-.2.2-.2.4 0 .7.6 1.1 1.5 2 2.7 2.6.3.2.5.1.7-.1l.8-1c.2-.2.4-.3.7-.2l2 .9c.3.1.4.3.4.5 0 .4-.2 1.5-.9 2.1-.7.6-1.6.9-2.7.6-1.2-.3-2.7-.9-4.4-2.4-2.1-1.8-3.4-4.1-3.8-5.6-.3-.9 0-1.7.6-2.5Z" fill="currentColor"/></svg>`;

const currentPage = document.body.dataset.page || "home";

function renderHeader() {
  const nav = PAGE_LINKS.map(([id, label, href]) => `<a href="${href}"${currentPage === id ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const headerMount = document.querySelector("[data-site-header]");
  if (!headerMount) return;

  headerMount.innerHTML = `
    <header class="site-header" data-header>
      <div class="nav-shell">
        <a class="nav-logo" href="/" aria-label="Silk Route home">
          ${horizontalLogoSvg}
        </a>
        <nav class="desktop-nav" aria-label="Primary navigation">${nav}</nav>
        <div class="nav-action"><a class="button" href="/quote.html">Book Your Journey ${arrowIcon}</a></div>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open navigation" data-menu-toggle><span aria-hidden="true"></span></button>
      </div>
    </header>
    <div class="mobile-menu" id="mobile-menu" data-mobile-menu>
      <nav aria-label="Mobile navigation">${nav}<a href="/quote.html"${currentPage === "quote" ? ' aria-current="page"' : ""}>Book Your Journey</a></nav>
      <div class="mobile-menu-meta"><span>Cape Town, South Africa</span><a href="https://wa.me/${WHATSAPP_NUMBER}">+27 74 537 7310</a></div>
    </div>`;
}

function renderFooter() {
  const footerMount = document.querySelector("[data-site-footer]");
  if (!footerMount) return;
  const year = new Date().getFullYear();
  footerMount.innerHTML = `
    <footer class="site-footer">
      <div class="shell footer-top">
        <div class="footer-brand">
          ${lockupSvg}
          <p>Luxury chauffeur journeys shaped around your comfort, your time and the quiet confidence of considered service.</p>
        </div>
        <div>
          <p class="footer-heading">Explore</p>
          <nav class="footer-links" aria-label="Footer navigation">
            <a href="/#services">Services</a><a href="/#vehicle">The vehicle</a><a href="/quote.html">Book Your Journey</a>
          </nav>
        </div>
        <div>
          <p class="footer-heading">Contact</p>
          <div class="footer-links"><a href="https://wa.me/${WHATSAPP_NUMBER}">WhatsApp us</a><a href="tel:+27745377310">+27 74 537 7310</a><span>Cape Town, South Africa</span><span>silkroute.vip</span></div>
        </div>
        <div>
          <p class="footer-heading">Legal &amp; trust</p>
          <nav class="footer-links" aria-label="Legal and trust information">
            <a href="/privacy.html">Privacy notice</a><a href="/terms.html">Booking terms</a><a href="/cookies.html">Cookie notice</a><a href="/information-access.html">Access to information</a><a href="/accessibility.html">Accessibility</a><a href="/media-credits.html">Media credits</a>
          </nav>
        </div>
      </div>
      <div class="shell footer-bottom"><span>&copy; ${year} Silk Route <i class="footer-dot"></i> The Smoothest Way to Travel</span><span>Cape Town · South Africa</span></div>
    </footer>`;
}

function renderFloatingContact() {
  document.body.insertAdjacentHTML("beforeend", `<a class="whatsapp-float" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Silk Route, I would like to enquire about a chauffeur journey.")}" target="_blank" rel="noopener" aria-label="Enquire with Silk Route on WhatsApp">${whatsappIcon}</a>`);
}

function initNavigation() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  const header = document.querySelector("[data-header]");
  if (!toggle || !menu || !header) return;

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  });
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

  const syncHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 30);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

function initReveals() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.13, rootMargin: "0px 0px -5%" });
  items.forEach((item) => observer.observe(item));
}

function initHeroVideo() {
  const video = document.querySelector("[data-hero-video]");
  if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    video?.pause();
    return;
  }
  const promise = video.play();
  promise?.catch(() => video.setAttribute("controls", ""));
}

const VEHICLE_GALLERY = [
  { src: v300ExteriorUrl, alt: "Black Mercedes-Benz V300d Exclusive AMG Line exterior", caption: "V300d Exclusive AMG Line" },
  { src: v300ChauffeurUrl, alt: "Silk Route chauffeur beside the black Mercedes-Benz V300d", caption: "Chauffeured presence" },
  { src: v300HeroUrl, alt: "Silk Route black Mercedes-Benz V300d on a Cape Town coastal road", caption: "Exterior presence" },
  { src: v300DetailUrl, alt: "Mercedes-Benz V300d exterior detailing and AMG wheel", caption: "Considered detailing" },
  { src: v300CabinUrl, alt: "Black leather Mercedes-Benz V300d passenger cabin", caption: "Black leather cabin" },
  { src: v300LoungeUrl, alt: "Spacious Mercedes-Benz V300d passenger lounge", caption: "Six-passenger lounge" },
  { src: v300CockpitUrl, alt: "Right-hand-drive Mercedes-Benz V300d cockpit", caption: "Right-hand-drive cockpit" },
  { src: v300LuggageUrl, alt: "Mercedes-Benz V300d luggage area", caption: "Travel-ready luggage space" },
];

const GALLERY_AUTOPLAY_INTERVAL = 5000;

function setupVehicleCarousel(root) {
  const image = root.querySelector("[data-gallery-image]");
  const caption = root.querySelector("[data-gallery-caption]");
  const status = root.querySelector("[data-gallery-status]");
  const thumbnails = root.querySelector("[data-gallery-thumbnails]");
  if (!image || !caption || !status || !thumbnails) return null;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const autoplayEnabled = root.hasAttribute("data-gallery-autoplay") && !reducedMotion;
  let currentIndex = 0;
  let autoplayTimer = null;
  let isInViewport = !("IntersectionObserver" in window);
  let isPointerInside = false;
  let userPaused = !autoplayEnabled;

  thumbnails.innerHTML = VEHICLE_GALLERY.map((item, index) => `<button type="button" data-gallery-index="${index}" aria-label="View ${item.caption}"><img src="${item.src}" alt="" width="160" height="106" loading="lazy" decoding="async"></button>`).join("");

  const render = () => {
    const item = VEHICLE_GALLERY[currentIndex];
    image.src = item.src;
    image.alt = item.alt;
    caption.textContent = item.caption;
    status.textContent = `${currentIndex + 1} of ${VEHICLE_GALLERY.length}`;
    thumbnails.querySelectorAll("button").forEach((button, index) => button.toggleAttribute("aria-current", index === currentIndex));
  };

  const stopAutoplay = () => {
    window.clearTimeout(autoplayTimer);
    autoplayTimer = null;
  };

  const canAutoplay = () => autoplayEnabled
    && !userPaused
    && isInViewport
    && !isPointerInside
    && !document.hidden
    && !root.contains(document.activeElement);

  const scheduleAutoplay = () => {
    stopAutoplay();
    if (!canAutoplay()) return;
    autoplayTimer = window.setTimeout(() => {
      currentIndex = (currentIndex + 1) % VEHICLE_GALLERY.length;
      render();
      scheduleAutoplay();
    }, GALLERY_AUTOPLAY_INTERVAL);
  };

  const move = (amount) => {
    currentIndex = (currentIndex + amount + VEHICLE_GALLERY.length) % VEHICLE_GALLERY.length;
    render();
  };

  const handleManualMove = (amount) => {
    userPaused = true;
    status.setAttribute("aria-live", "polite");
    stopAutoplay();
    move(amount);
  };

  root.querySelector("[data-gallery-previous]")?.addEventListener("click", () => handleManualMove(-1));
  root.querySelector("[data-gallery-next]")?.addEventListener("click", () => handleManualMove(1));
  thumbnails.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery-index]");
    if (!button) return;
    userPaused = true;
    status.setAttribute("aria-live", "polite");
    stopAutoplay();
    currentIndex = Number(button.dataset.galleryIndex);
    render();
  });
  root.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handleManualMove(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      handleManualMove(1);
    }
  });

  root.addEventListener("pointerenter", () => {
    isPointerInside = true;
    stopAutoplay();
  });
  root.addEventListener("pointerleave", () => {
    isPointerInside = false;
    scheduleAutoplay();
  });
  root.addEventListener("focusin", stopAutoplay);
  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget)) scheduleAutoplay();
  });
  document.addEventListener("visibilitychange", scheduleAutoplay);

  if (autoplayEnabled && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      isInViewport = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      scheduleAutoplay();
    }, { threshold: [0, 0.35] });
    observer.observe(root);
  }

  render();
  scheduleAutoplay();
  return {
    reset() {
      currentIndex = 0;
      render();
      scheduleAutoplay();
    },
  };
}

function initVehicleGallery() {
  const carousels = [...document.querySelectorAll("[data-vehicle-carousel]")];
  const controllers = new Map(carousels.map((carousel) => [carousel, setupVehicleCarousel(carousel)]));
  const dialog = document.querySelector("[data-vehicle-gallery]");
  const openers = document.querySelectorAll("[data-gallery-open]");
  if (!dialog || !openers.length || typeof dialog.showModal !== "function") return;

  const dialogController = controllers.get(dialog);
  let returnFocus = null;
  openers.forEach((opener) => opener.addEventListener("click", () => {
    returnFocus = opener;
    dialogController?.reset();
    dialog.showModal();
    document.body.classList.add("gallery-open");
    dialog.querySelector("[data-gallery-close]")?.focus();
  }));
  dialog.querySelector("[data-gallery-close]")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("gallery-open");
    returnFocus?.focus();
  });
}

function initExecutiveCtas() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const targets = document.querySelectorAll(".button:not(.button--ghost):not(.button--dark), .whatsapp-float");
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const target = entry.target;
      const delay = target.matches(".whatsapp-float")
        ? 1050
        : target.closest(".site-header")
          ? 420
          : target.closest(".hero, .page-hero")
            ? 760
            : 140;

      target.style.setProperty("--cta-delay", `${delay}ms`);
      target.classList.add("is-executive-lit");
      target.addEventListener("animationend", () => {
        target.classList.remove("is-executive-lit");
        target.style.removeProperty("--cta-delay");
      }, { once: true });
      currentObserver.unobserve(target);
    });
  }, { threshold: 0.68 });

  targets.forEach((target) => observer.observe(target));
  window.addEventListener("pagehide", () => observer.disconnect(), { once: true });
}

async function initGooglePlaces() {
  const form = document.querySelector("[data-quote-form]");
  const fields = [...document.querySelectorAll("[data-place-field]")];
  if (!form || !fields.length) return;

  const useManualLocationFields = () => {
    fields.forEach((field) => {
      const input = field.querySelector("[data-place-input]");
      const help = field.querySelector("[data-place-help]");
      const suggestionsHost = field.querySelector("[data-place-suggestions]");
      ["role", "aria-autocomplete", "aria-haspopup", "aria-expanded", "aria-controls", "aria-activedescendant"]
        .forEach((attribute) => input?.removeAttribute(attribute));
      field.dataset.placeManualAllowed = "true";
      if (suggestionsHost) suggestionsHost.hidden = true;
      if (help) help.textContent = "";
    });
    delete form.dataset.googlePlacesActive;
  };

  try {
    const statusResponse = await fetch("/api/places/status", { headers: { Accept: "application/json" } });
    const status = statusResponse.ok ? await statusResponse.json() : { enabled: false };
    if (!status.enabled) {
      useManualLocationFields();
      return;
    }

    fields.forEach((field) => {
      const name = field.dataset.placeField;
      const input = field.querySelector("[data-place-input]");
      const suggestionsHost = field.querySelector("[data-place-suggestions]");
      const optionsHost = field.querySelector("[data-place-options]");
      const help = field.querySelector("[data-place-help]");
      const selectedAttribution = field.querySelector("[data-place-selected-attribution]");
      const providerAttributions = field.querySelector("[data-place-provider-attributions]");
      let sessionToken;
      let requestTimer;
      let abandonTimer;
      let latestRequestId = 0;
      let activeIndex = -1;
      let predictions = [];

      const clearSelection = () => {
        field.querySelector(`[name="${name}_place_id"]`).value = "";
        field.querySelector(`[name="${name}_lat"]`).value = "";
        field.querySelector(`[name="${name}_lng"]`).value = "";
        delete field.dataset.placeVerified;
        selectedAttribution.hidden = true;
        providerAttributions.replaceChildren();
      };

      const showSelectedAttributions = (attributions = []) => {
        providerAttributions.replaceChildren();
        const safeAttributions = Array.isArray(attributions) ? attributions : [];
        safeAttributions.forEach(({ provider, providerUri }) => {
          if (typeof provider !== "string" || !provider.trim()) return;
          const safeProviderUri = typeof providerUri === "string" && providerUri.startsWith("https://") ? providerUri : "";
          providerAttributions.append(document.createTextNode(" · "));
          const providerElement = safeProviderUri ? document.createElement("a") : document.createElement("span");
          providerElement.textContent = provider.trim();
          if (safeProviderUri) {
            providerElement.href = safeProviderUri;
            providerElement.target = "_blank";
            providerElement.rel = "noopener noreferrer";
          }
          providerAttributions.append(providerElement);
        });
        selectedAttribution.hidden = false;
      };

      const clearFormStatus = () => {
        const status = form.querySelector("[data-form-status]");
        if (!status) return;
        status.textContent = "";
        status.classList.remove("is-visible");
      };

      const closeSuggestions = () => {
        activeIndex = -1;
        optionsHost.querySelectorAll("[role='option']").forEach((option) => {
          option.classList.remove("is-active");
          option.setAttribute("aria-selected", "false");
        });
        suggestionsHost.hidden = true;
        input.setAttribute("aria-expanded", "false");
        input.removeAttribute("aria-activedescendant");
      };

      const setActiveSuggestion = (index) => {
        const options = [...optionsHost.querySelectorAll("[role='option']")];
        if (!options.length) return;
        activeIndex = (index + options.length) % options.length;
        options.forEach((option, optionIndex) => {
          const isActive = optionIndex === activeIndex;
          option.classList.toggle("is-active", isActive);
          option.setAttribute("aria-selected", String(isActive));
        });
        input.setAttribute("aria-activedescendant", options[activeIndex].id);
        options[activeIndex].scrollIntoView({ block: "nearest" });
      };

      const selectPrediction = async (placePrediction) => {
        const requestId = ++latestRequestId;
        const selectedSessionToken = sessionToken;
        sessionToken = undefined;
        window.clearTimeout(requestTimer);
        window.clearTimeout(abandonTimer);
        predictions = [];
        optionsHost.replaceChildren();
        closeSuggestions();
        input.value = placePrediction.text || input.value;
        if (help) help.textContent = "Confirming this Google location…";
        try {
          const response = await fetch("/api/places/details", {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({ placeId: placePrediction.placeId, sessionToken: selectedSessionToken }),
          });
          if (!response.ok) throw new Error(`Place details request failed with ${response.status}`);
          const place = await response.json();
          if (requestId !== latestRequestId) return;
          input.value = placePrediction.text || place.formattedAddress || "";
          field.querySelector(`[name="${name}_place_id"]`).value = place.id || placePrediction.placeId || "";
          field.querySelector(`[name="${name}_lat"]`).value = place.location?.latitude ?? "";
          field.querySelector(`[name="${name}_lng"]`).value = place.location?.longitude ?? "";
          field.dataset.placeVerified = "true";
          delete field.dataset.placeManualAllowed;
          input.setAttribute("aria-invalid", "false");
          showSelectedAttributions(place.attributions);
          clearFormStatus();
          if (help) help.textContent = "";
        } catch (error) {
          if (requestId !== latestRequestId) return;
          console.warn("The selected Google location could not be confirmed.", error);
          field.dataset.placeManualAllowed = "true";
          input.setAttribute("aria-invalid", "false");
          if (help) help.textContent = "We could not confirm that suggestion. Try another result or enter the full address.";
        }
      };

      const renderSuggestions = (newPredictions) => {
        predictions = newPredictions;
        activeIndex = -1;
        optionsHost.replaceChildren();
        predictions.forEach((placePrediction, index) => {
          const option = document.createElement("button");
          option.type = "button";
          option.tabIndex = -1;
          option.className = "place-suggestion";
          option.id = `${name}-suggestion-${index}`;
          option.setAttribute("role", "option");
          option.setAttribute("aria-selected", "false");
          const label = document.createElement("span");
          label.className = "place-suggestion__label";
          label.textContent = placePrediction.text;
          option.append(label);
          option.addEventListener("pointerdown", (event) => event.preventDefault());
          option.addEventListener("click", () => selectPrediction(placePrediction));
          optionsHost.append(option);
        });
        suggestionsHost.hidden = predictions.length === 0;
        input.setAttribute("aria-expanded", String(predictions.length > 0));
      };

      const requestSuggestions = async () => {
        const query = input.value.trim();
        const requestId = ++latestRequestId;
        if (query.length < 3) {
          sessionToken = undefined;
          predictions = [];
          optionsHost.replaceChildren();
          closeSuggestions();
          if (help) help.textContent = query ? "Keep typing to see location suggestions." : "";
          return;
        }
        if (help) help.textContent = "Finding matching locations…";
        try {
          sessionToken ||= crypto.randomUUID();
          const response = await fetch("/api/places/autocomplete", {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({ input: query, sessionToken }),
          });
          if (!response.ok) throw new Error(`Autocomplete request failed with ${response.status}`);
          const { suggestions } = await response.json();
          if (requestId !== latestRequestId) return;
          const nextPredictions = suggestions.filter((suggestion) => suggestion.placeId && suggestion.text).slice(0, 6);
          delete field.dataset.placeManualAllowed;
          renderSuggestions(nextPredictions);
          if (help) help.textContent = nextPredictions.length
            ? "Choose a location from the suggestions."
            : "No matching location found. Try a more complete address or place name.";
        } catch (error) {
          if (requestId !== latestRequestId) return;
          console.warn("Google location suggestions could not be retrieved.", error);
          predictions = [];
          optionsHost.replaceChildren();
          closeSuggestions();
          field.dataset.placeManualAllowed = "true";
          input.setAttribute("aria-invalid", "false");
          if (help) help.textContent = "Suggestions could not load for this search. Try again or enter the full address.";
          sessionToken = undefined;
        }
      };

      input.addEventListener("input", () => {
        latestRequestId += 1;
        clearSelection();
        delete field.dataset.placeManualAllowed;
        input.setAttribute("aria-invalid", "false");
        clearFormStatus();
        predictions = [];
        optionsHost.replaceChildren();
        closeSuggestions();
        window.clearTimeout(requestTimer);
        window.clearTimeout(abandonTimer);
        if (input.value.trim().length < 3) sessionToken = undefined;
        requestTimer = window.setTimeout(requestSuggestions, 260);
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown" && predictions.length && !field.dataset.placeVerified) {
          event.preventDefault();
          suggestionsHost.hidden = false;
          input.setAttribute("aria-expanded", "true");
          setActiveSuggestion(activeIndex + 1);
        } else if (event.key === "ArrowUp" && predictions.length && !field.dataset.placeVerified) {
          event.preventDefault();
          suggestionsHost.hidden = false;
          input.setAttribute("aria-expanded", "true");
          setActiveSuggestion(activeIndex === -1 ? predictions.length - 1 : activeIndex - 1);
        } else if (event.key === "Enter" && activeIndex >= 0) {
          event.preventDefault();
          selectPrediction(predictions[activeIndex]);
        } else if (event.key === "Escape") {
          closeSuggestions();
        }
      });
      input.addEventListener("focus", () => {
        window.clearTimeout(abandonTimer);
        if (predictions.length && !field.dataset.placeVerified) {
          suggestionsHost.hidden = false;
          input.setAttribute("aria-expanded", "true");
        } else if (input.value.trim().length >= 3 && !field.dataset.placeVerified) {
          window.clearTimeout(requestTimer);
          requestTimer = window.setTimeout(requestSuggestions, 80);
        }
      });
      input.addEventListener("blur", () => {
        window.clearTimeout(requestTimer);
        latestRequestId += 1;
        window.setTimeout(closeSuggestions, 140);
        window.clearTimeout(abandonTimer);
        abandonTimer = window.setTimeout(() => {
          if (field.dataset.placeVerified) return;
          sessionToken = undefined;
          predictions = [];
          optionsHost.replaceChildren();
          closeSuggestions();
        }, 30000);
      });
    });
    form.dataset.googlePlacesActive = "true";
  } catch (error) {
    console.warn("Google location suggestions could not be loaded.", error);
    useManualLocationFields();
  }
}

function initQuoteForm() {
  const form = document.querySelector("[data-quote-form]");
  if (!form) return;
  const requestedService = new URLSearchParams(window.location.search).get("service");
  const serviceField = form.querySelector('[name="service"]');
  if (requestedService && [...serviceField.options].some((option) => option.value === requestedService)) serviceField.value = requestedService;
  const dateField = form.querySelector('input[type="date"]');
  if (dateField) {
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateField.min = localDate;
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (form.dataset.googlePlacesActive === "true") {
      const missingPlace = ["pickup", "destination"].find((name) => {
        const field = form.querySelector(`[data-place-field="${name}"]`);
        return !data.get(`${name}_place_id`) && field?.dataset.placeManualAllowed !== "true";
      });
      if (missingPlace) {
        const status = form.querySelector("[data-form-status]");
        status.textContent = `Please choose a verified Google ${missingPlace === "pickup" ? "pick-up location" : "destination"} from the suggestions.`;
        status.classList.add("is-visible");
        const missingInput = form.querySelector(`[data-place-field="${missingPlace}"] [data-place-input]`);
        missingInput?.setAttribute("aria-invalid", "true");
        missingInput?.focus();
        return;
      }
    }
    const line = (label, name) => data.get(name) ? `${label}: ${String(data.get(name)).trim()}` : null;
    const extras = data.getAll("extras").map((value) => String(value).trim()).filter(Boolean);
    const mapsLine = (label, name) => {
      const placeId = data.get(`${name}_place_id`);
      const address = data.get(name);
      if (!placeId || !address) return null;
      return `${label} map: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}&query_place_id=${encodeURIComponent(placeId)}`;
    };
    const lines = [
      "Hello Silk Route, I would like to enquire about booking a chauffeur journey.", "",
      line("Service", "service"), line("Traveller's name", "traveller_name"), line("Email", "email"), line("Phone / WhatsApp", "phone"),
      line("Pick-up date", "date"), line("Pick-up time", "time"), line("Pick-up", "pickup"),
      mapsLine("Pick-up", "pickup"), line("Destination", "destination"), mapsLine("Destination", "destination"),
      line("Passengers", "passengers"), line("Large luggage pieces", "large_luggage"),
      extras.length ? `Optional extras: ${extras.join("; ")}` : null,
      line("Driver attire", "driver_attire"), line("Additional requirements", "requirements")
    ].filter(Boolean);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    const status = form.querySelector("[data-form-status]");
    if (status) {
      status.textContent = "Your journey details are ready. WhatsApp will open so you can send them securely to Silk Route.";
      status.classList.add("is-visible");
    }
    trackEvent("booking_enquiry");
    window.open(url, "_blank", "noopener,noreferrer");
  });
}

function registerWebMcpTools() {
  const modelContext = document.modelContext;
  if (!modelContext || typeof modelContext.registerTool !== "function") return;

  const controller = new AbortController();
  const register = async (tool) => {
    try {
      await modelContext.registerTool(tool, { signal: controller.signal });
    } catch (error) {
      if (error?.name !== "AbortError") console.warn(`WebMCP tool ${tool.name} could not be registered.`, error);
    }
  };

  register({
    name: "get_silk_route_services",
    title: "Get Silk Route chauffeur services",
    description: "Returns Silk Route's public Cape Town chauffeur services, published prices, vehicle, passenger capacity, optional extras and booking URL. This tool does not collect data or change the page.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: false,
    },
    execute: async () => JSON.stringify({
      provider: "Silk Route",
      serviceArea: "Cape Town; wider Western Cape itinerary requirements are confirmed per enquiry.",
      vehicle: "Mercedes-Benz V300d Exclusive AMG Line",
      passengerCapacity: 6,
      services: WEBMCP_SERVICE_CATALOG,
      optionalExtras: WEBMCP_EXTRAS,
      bookingUrl: "https://silkroute.vip/quote.html",
      contact: "+27 74 537 7310",
    }),
  });

  const form = document.querySelector("[data-quote-form]");
  if (form) {
    register({
      name: "prepare_chauffeur_enquiry",
      title: "Prepare a Silk Route chauffeur enquiry",
      description: "Fills Silk Route's visible booking enquiry form for the traveller to review. This tool never submits the form, opens WhatsApp, or sends any personal or journey data. The traveller must verify the locations and manually press Prepare booking enquiry.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          service: { type: "string", enum: WEBMCP_SERVICE_CATALOG.map(({ name }) => name), description: "The chauffeur service required." },
          traveller_name: { type: "string", minLength: 1, maxLength: 120, description: "The traveller's full name." },
          email: { type: "string", format: "email", maxLength: 254, description: "The traveller's email address." },
          phone: { type: "string", minLength: 5, maxLength: 40, description: "The traveller's telephone or WhatsApp number, including country code when possible." },
          date: { type: "string", format: "date", description: "The requested pick-up date in YYYY-MM-DD format." },
          time: { type: "string", pattern: "^([01]\\d|2[0-3]):[0-5]\\d$", description: "The requested pick-up time in 24-hour HH:MM format." },
          pickup: { type: "string", minLength: 3, maxLength: 180, description: "The pick-up address or place name." },
          destination: { type: "string", minLength: 3, maxLength: 180, description: "The destination address or place name." },
          passengers: { type: "integer", minimum: 1, maximum: 6, description: "Number of passengers, from 1 to the vehicle capacity of 6." },
          large_luggage: { type: "integer", minimum: 0, maximum: 20, description: "Number of large luggage pieces." },
          extras: { type: "array", uniqueItems: true, maxItems: 3, items: { type: "string", enum: WEBMCP_EXTRAS }, description: "Optional cabin or journey extras." },
          driver_attire: { type: "string", enum: ["Formal", "Semi-formal"], description: "Preferred chauffeur attire, when specified." },
          requirements: { type: "string", maxLength: 1000, description: "Flight number, return journey, itinerary, accessibility needs or other relevant requirements." },
        },
        required: ["service", "traveller_name", "email", "phone", "date", "time", "pickup", "destination", "passengers", "large_luggage"],
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: false,
      },
      execute: async (input) => {
        const requiredText = (name, maximum, minimum = 1) => {
          const value = typeof input?.[name] === "string" ? input[name].trim() : "";
          if (value.length < minimum || value.length > maximum) throw new TypeError(`${name} is invalid.`);
          return value;
        };
        const optionalText = (name, maximum) => {
          if (input?.[name] === undefined || input[name] === null || input[name] === "") return "";
          if (typeof input[name] !== "string") throw new TypeError(`${name} is invalid.`);
          const value = input[name].trim();
          if (value.length > maximum) throw new TypeError(`${name} is too long.`);
          return value;
        };
        const service = requiredText("service", 80);
        if (!WEBMCP_SERVICE_CATALOG.some(({ name }) => name === service)) throw new TypeError("service is invalid.");
        const travellerName = requiredText("traveller_name", 120);
        const email = requiredText("email", 254);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new TypeError("email is invalid.");
        const phone = requiredText("phone", 40, 5);
        const date = requiredText("date", 10, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new TypeError("date must use YYYY-MM-DD.");
        const time = requiredText("time", 5, 5);
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new TypeError("time must use 24-hour HH:MM.");
        const pickup = requiredText("pickup", 180, 3);
        const destination = requiredText("destination", 180, 3);
        const passengers = Number(input?.passengers);
        const largeLuggage = Number(input?.large_luggage);
        if (!Number.isInteger(passengers) || passengers < 1 || passengers > 6) throw new TypeError("passengers must be an integer from 1 to 6.");
        if (!Number.isInteger(largeLuggage) || largeLuggage < 0 || largeLuggage > 20) throw new TypeError("large_luggage must be an integer from 0 to 20.");
        const extras = input?.extras === undefined ? [] : input.extras;
        if (!Array.isArray(extras) || extras.length > WEBMCP_EXTRAS.length || new Set(extras).size !== extras.length
          || extras.some((extra) => !WEBMCP_EXTRAS.includes(extra))) throw new TypeError("extras contains an invalid option.");
        const driverAttire = optionalText("driver_attire", 20);
        if (driverAttire && !["Formal", "Semi-formal"].includes(driverAttire)) throw new TypeError("driver_attire is invalid.");
        const requirements = optionalText("requirements", 1000);

        const setField = (name, value) => {
          const field = form.elements.namedItem(name);
          if (!field || !("value" in field)) throw new Error(`The ${name} booking field is unavailable.`);
          field.value = String(value);
          field.dispatchEvent(new Event("input", { bubbles: true }));
          field.dispatchEvent(new Event("change", { bubbles: true }));
        };

        setField("service", service);
        setField("traveller_name", travellerName);
        setField("email", email);
        setField("phone", phone);
        setField("date", date);
        setField("time", time);
        setField("pickup", pickup);
        setField("destination", destination);
        setField("passengers", passengers);
        setField("large_luggage", largeLuggage);
        setField("requirements", requirements);
        form.querySelectorAll('input[name="extras"]').forEach((field) => {
          field.checked = extras.includes(field.value);
          field.dispatchEvent(new Event("change", { bubbles: true }));
        });
        form.querySelectorAll('input[name="driver_attire"]').forEach((field) => {
          field.checked = Boolean(driverAttire && field.value === driverAttire);
          field.dispatchEvent(new Event("change", { bubbles: true }));
        });

        form.dataset.webMcpPrepared = "true";
        const status = form.querySelector("[data-form-status]");
        if (status) {
          status.textContent = "Your journey details were prepared by your browser assistant. Review every field, choose verified location suggestions if offered, then press Prepare booking enquiry when you are ready.";
          status.classList.add("is-visible");
        }
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        form.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        form.elements.namedItem("service")?.focus({ preventScroll: true });

        return JSON.stringify({
          status: "prepared_for_user_review",
          submitted: false,
          locationsRequireUserVerification: true,
          fieldsPrepared: ["service", "traveller_name", "email", "phone", "date", "time", "pickup", "destination", "passengers", "large_luggage", "extras", "driver_attire", "requirements"],
          nextStep: "The traveller must review the visible form, select verified location suggestions when available, and manually press Prepare booking enquiry to open WhatsApp. Nothing has been sent.",
        });
      },
    });
  }

  window.addEventListener("pagehide", () => controller.abort(), { once: true });
}

renderHeader();
renderFooter();
initAnalytics();
renderFloatingContact();
initNavigation();
initReveals();
initHeroVideo();
initVehicleGallery();
initExecutiveCtas();
initQuoteForm();
initGooglePlaces().finally(registerWebMcpTools);
