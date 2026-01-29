// ============================================================================
// PERFORMANCE OPTIMIZATIONS
// ============================================================================

// DOM Cache - Avoid repeated queries
const DOM_CACHE = {};
function getCached(selector) {
  if (!DOM_CACHE[selector]) {
    DOM_CACHE[selector] = document.querySelector(selector);
  }
  return DOM_CACHE[selector];
}

function getCachedAll(selector) {
  if (!DOM_CACHE[selector + '_all']) {
    DOM_CACHE[selector + '_all'] = Array.from(document.querySelectorAll(selector));
  }
  return DOM_CACHE[selector + '_all'];
}

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Safe localStorage wrapper that handles Safari private mode
 */
const storage = (function () {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          console.warn('localStorage.getItem failed:', e);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          console.warn('localStorage.setItem failed:', e);
        }
      },
    };
  } catch (e) {
    console.warn('localStorage not available, using memory fallback');
    const memoryStore = {};
    return {
      getItem: (key) => memoryStore[key] || null,
      setItem: (key, value) => {
        memoryStore[key] = value;
      },
    };
  }
})();

/**
 * Extract URL parameters once and cache them
 */
const urlParams = new URLSearchParams(window.location.search);

const allParams = {
  isAds: urlParams.get('ads') === 'true' || urlParams.get('ads') === true,
  customerId: urlParams.get('customerId'),
  sessionId: urlParams.get('sessionId'),
  referralToken: urlParams.get('referralToken'),
  withingsToken: urlParams.get('withings_token') || urlParams.get('withingsToken'),
  has_withings_plus: urlParams.get('has_withings_plus'),
  FayBookingCode: urlParams.get('FayBookingCode'),
  pcrit: urlParams.get('pcrit') || storage.getItem('pcrit') || null,
};

// Store withingsToken if present
if (allParams.withingsToken) {
  storage.setItem('withingsToken', allParams.withingsToken);
}

// ============================================================================
// URL PARAMETER UTILITIES
// ============================================================================

/**
 * Build URL with all standard parameters (optimized)
 */
function buildUrlWithParams(baseUrl, additionalParams = {}) {
  let url;

  try {
    // Handle relative URLs
    if (baseUrl.startsWith('/')) {
      url = new URL(baseUrl, window.location.origin);
    } else if (baseUrl.startsWith('http')) {
      url = new URL(baseUrl);
    } else {
      return baseUrl;
    }

    // Batch parameter setting
    const paramsToSet = {
      ...(allParams.isAds && { ads: 'true' }),
      ...(allParams.customerId && { customerId: allParams.customerId }),
      ...(allParams.sessionId && { sessionId: allParams.sessionId }),
      ...(allParams.referralToken && {
        referralToken: allParams.referralToken,
      }),
      ...(allParams.withingsToken && {
        withingsToken: allParams.withingsToken,
      }),
      ...(allParams.has_withings_plus && {
        has_withings_plus: allParams.has_withings_plus,
      }),
      ...(allParams.FayBookingCode && {
        FayBookingCode: allParams.FayBookingCode,
      }),
      ...additionalParams,
    };

    Object.entries(paramsToSet).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, value);
      }
    });

    // Add persisted params
    shouldPersistParams.forEach((param) => {
      const storedVal = storage.getItem(param);
      if (storedVal) url.searchParams.set(param, storedVal);
    });

    return url.toString();
  } catch (err) {
    console.warn('Invalid URL:', baseUrl, err);
    return baseUrl;
  }
}

/**
 * Append parameters to links - OPTIMIZED with caching and batching
 */
let linksProcessed = false;
function appendParamsToLinks() {
  if (linksProcessed) return; // Only process once

  const links = getCachedAll('a[href]');

  links.forEach((link) => {
    try {
      const href = link.getAttribute('href');

      // Skip non-URLs (anchors, javascript:, etc.)
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('javascript:') ||
        href.startsWith('mailto:') ||
        href.startsWith('?')
      ) {
        return;
      }

      let url;

      // Handle relative URLs
      if (href.startsWith('/')) {
        url = new URL(href, window.location.origin);
      } else if (href.startsWith('http')) {
        url = new URL(href);
        // Only modify faynutrition.com links
        if (!url.hostname.endsWith('.faynutrition.com') && url.hostname !== 'faynutrition.com') {
          return;
        }
      } else {
        return;
      }

      // Batch parameter setting
      if (allParams.isAds) url.searchParams.set('ads', 'true');
      if (allParams.customerId && allParams.sessionId) {
        url.searchParams.set('customerId', allParams.customerId);
        url.searchParams.set('sessionId', allParams.sessionId);
      }
      if (allParams.referralToken) url.searchParams.set('referralToken', allParams.referralToken);
      if (allParams.withingsToken) url.searchParams.set('withingsToken', allParams.withingsToken);
      if (allParams.has_withings_plus)
        url.searchParams.set('has_withings_plus', allParams.has_withings_plus);
      if (allParams.FayBookingCode)
        url.searchParams.set('FayBookingCode', allParams.FayBookingCode);

      link.href = url.toString();
    } catch (err) {
      console.warn('Failed to process link:', link.href, err);
    }
  });

  linksProcessed = true;
}

// ============================================================================
// STATSIG INITIALIZATION
// ============================================================================

/**
 * Generate Statsig stable ID if not exists
 */
!(function () {
  let t = 'STATSIG_LOCAL_STORAGE_STABLE_ID';
  function e() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    let t = () =>
      Math.floor(65536 * Math.random())
        .toString(16)
        .padStart(4, '0');
    return `${t()}${t()}-${t()}-4${t().substring(1)}-${t()}-${t()}${t()}${t()}`;
  }
  let i = null,
    n = localStorage.getItem(t) || null;
  if (
    (document.cookie.match(/statsiguuid=([\w-]+);?/) &&
      ([, i] = document.cookie.match(/statsiguuid=([\w-]+);?/)),
    i && n && i === n)
  );
  else if (i && n && i !== n) localStorage.setItem(t, i);
  else if (i && !n) localStorage.setItem(t, i);
  else {
    let o = e();
    localStorage.setItem(t, o),
      (function t(i) {
        let n = new Date();
        n.setMonth(n.getMonth() + 12);
        let o = window.location.host.split('.');
        o.length > 2 && o.shift();
        let s = `.${o.join('.')}`;
        document.cookie = `statsiguuid=${i || e()};Expires=${n};Domain=${s};Path=/;Secure`;
      })(o);
  }
})();

const STATSIG_TIMEOUT_MS = 500;

// --- Timebox helper: resolves to { ok: true } or { ok: false, timeout: true }
async function withTimeout(promise, ms) {
  return Promise.race([
    promise.then(() => ({ ok: true })),
    new Promise((resolve) => setTimeout(() => resolve({ ok: false, timeout: true }), ms)),
  ]);
}

function configStatsig() {
  const { StatsigClient } = window.Statsig || {};
  if (StatsigClient && !window.statsigClient) {
    let userObj = {};
    if (localStorage.getItem('STATSIG_LOCAL_STORAGE_STABLE_ID')) {
      const stableID = localStorage.getItem('STATSIG_LOCAL_STORAGE_STABLE_ID');
      userObj = {
        userID: stableID,
        customIDs: {
          stableID: stableID,
        },
      };
    }

    // const client = new StatsigClient("client-qFGr4zDaYW5oH0a40Gf5rZInM1UXVqvLJuByLtwUJQt", userObj, {environment: {tier: 'staging'} });
    const client = new StatsigClient(
      'client-eNg4fu7Fpe036cvkjwJk5AheQdNZUgFIWeSme9TRQMw',
      userObj,
      { environment: { tier: 'production' } }
    );

    window.statsigClient = client;
  }
}

// --- Retry logic for Statsig initialization
async function waitForStatsig(timeout = 2000, retries = 100, delay = 100) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    configStatsig();

    if (window.statsigClient && typeof window.statsigClient.initializeAsync === 'function') {
      const result = await withTimeout(window.statsigClient.initializeAsync(), timeout);
      if (result.ok) {
        return { ok: true };
      }
    }

    if (attempt < retries) {
      console.warn(`Statsig not ready (attempt ${attempt}/${retries}). Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  return { ok: false, timeout: true };
}

async function initStatsig() {
  window.statsigReady = (async () => {
    const result = await waitForStatsig();
    return result;
  })();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Append parameters to links when DOM is ready (debounced)
const debouncedAppendParams = debounce(appendParamsToLinks, 100);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', debouncedAppendParams);
} else {
  debouncedAppendParams();
}

// ============================================================================
// EXPORTS (for use by body.js)
// ============================================================================

window.FayUtils = {
  allParams,
  storage,
  buildUrlWithParams,
  appendParamsToLinks: debouncedAppendParams,
};

// Destructure for easier access
const {
  isAds,
  customerId,
  sessionId,
  referralToken,
  withingsToken,
  has_withings_plus,
  FayBookingCode,
} = allParams;

// Module state - consolidated
const state = {
  providerProfile: null,
  reviewsData: [],
  currentReviewsIndex: 0,
  providerId: null,
};

// Configuration
const config = {
  providerApiBase: 'https://platform.faynutrition.com/provider-profiles/by-slug/',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Detect device type - cached result
 */
let cachedDeviceType = null;
function getDeviceType() {
  if (cachedDeviceType) return cachedDeviceType;

  const ua = navigator.userAgent.toLowerCase();
  const isTablet = /ipad|tablet|(android(?!.*mobile))/.test(ua);
  const isMobile = /iphone|ipod|android.*mobile|windows phone|blackberry/.test(ua);

  if (isMobile) cachedDeviceType = 'PHONE';
  else if (isTablet) cachedDeviceType = 'TABLET';
  else cachedDeviceType = 'DESKTOP';

  return cachedDeviceType;
}

/**
 * Get slug from URL - cached
 */
let cachedSlug = null;
function getSlugFromURL() {
  if (cachedSlug) return cachedSlug;

  if (urlParams.has('slug')) {
    cachedSlug = urlParams.get('slug');
    return cachedSlug;
  }

  const { pathname } = window.location;
  cachedSlug = pathname.split('/').filter(Boolean).pop();
  return cachedSlug;
}

/**
 * Format date with timezone
 */
function getISOWithTimezone(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
  const offsetMins = Math.abs(offsetMinutes) % 60;
  const timezoneOffset = `${sign}${pad(offsetHours)}:${pad(offsetMins)}`;

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${timezoneOffset}`
  );
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date label (Today, Tomorrow, or date)
 */
function formatDateLabel(dateString) {
  const slotDate = new Date(dateString);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const slotDay = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
  const slot = formatDate(slotDay);

  if (slotDay.getTime() === today.getTime()) {
    return { slot, dateStr: 'Today' };
  }

  if (slotDay.getTime() === tomorrow.getTime()) {
    return { slot, dateStr: 'Tomorrow' };
  }

  const options = { month: 'short', day: 'numeric' };
  return { slot, dateStr: slotDate.toLocaleDateString('en-US', options) };
}

// ============================================================================
// DOM UTILITIES (jQuery replacement) - OPTIMIZED
// ============================================================================

const dom = {
  hide: (selector) => {
    const elements =
      typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
    elements.forEach((el) => el && (el.style.display = 'none'));
  },

  show: (selector) => {
    const elements =
      typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
    elements.forEach((el) => el && (el.style.display = ''));
  },

  addClass: (selector, className) => {
    const elements =
      typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
    elements.forEach((el) => el && el.classList.add(className));
  },

  removeClass: (selector, className) => {
    const elements =
      typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
    elements.forEach((el) => el && el.classList.remove(className));
  },

  attr: (selector, attr, value) => {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (element) {
      if (value === undefined) {
        return element.getAttribute(attr);
      }
      element.setAttribute(attr, value);
    }
  },

  css: (selector, prop, value) => {
    const elements =
      typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
    elements.forEach((el) => el && (el.style[prop] = value));
  },
};

// ============================================================================
// ANALYTICS (Mixpanel) - OPTIMIZED
// ============================================================================

/**
 * Wait for Mixpanel - reduced retries
 */
async function waitForMixpanel(timeout = 2000, retries = 2, delay = 500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    if (window.mixpanel) {
      const result = await withTimeout(Promise.resolve(window.mixpanel), timeout);
      if (result.ok) {
        return { ok: true };
      }
    }

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return { ok: false, timeout: true };
}

// Global promise for Mixpanel readiness
window.mixpanelReady = waitForMixpanel();

// ============================================================================
// UI INITIALIZATION
// ============================================================================

/**
 * Initialize UI based on URL parameters
 */
function initUI() {
  const deviceType = getDeviceType();

  if (isAds) {
    dom.hide('.nav-ads');
    dom.hide('.footer-full');
    dom.show('.footer-ads-v');
  }

  if (withingsToken) {
    dom.hide('.navbar12_component');
    dom.hide('.footer-full');
    dom.hide('.footer-ads-v');
    dom.addClass('.page-wrap', 'is-withings');
    dom.addClass('.dietitian-wrap_col-left', 'is-left-p-st');
    dom.addClass('.dt-r-links-wr', 'is-w');
    dom.css('.dt-r-links-wr-overlay', 'height', '6.125rem');

    if (deviceType === 'PHONE' || deviceType === 'TABLET') {
      dom.addClass('.dt-r-links-wr', 'dt-r-links-wr-w');
      dom.addClass('._w-section-wr', 'is-flow');
      dom.addClass('.book-now-wrap.is-main-book', 'hide');
      dom.removeClass('.book-now-wrap.is-w-d-book', 'hide');

      let previousUrl = document.referrer;
      if (!previousUrl || !previousUrl.includes('/find-withings')) {
        previousUrl = 'https://www.faynutrition.com/find-withings';
      }
      dom.attr('.book-now-wrap.is-w-d-book .back-button', 'href', previousUrl);
    }
  }
}

/**
 * Remove non-faynutrition links from background paragraph
 */
function cleanBackgroundLinks() {
  const paragraph = document.getElementById('background');
  if (!paragraph) return;

  const links = paragraph.getElementsByTagName('a');

  for (let i = links.length - 1; i >= 0; i--) {
    const link = links[i];
    const href = link.getAttribute('href');

    if (!href || !href.startsWith('https://www.faynutrition.com/')) {
      const text = document.createTextNode(link.textContent);
      link.parentNode.replaceChild(text, link);
    }
  }
}

// ============================================================================
// IFRAME COMMUNICATION
// ============================================================================

/**
 * Build iframe parameters object
 */
function buildIframeParams(additionalParams = {}) {
  const params = {
    type: 'loadAvailabilityForProvider',
    ...additionalParams,
  };

  if (isAds) params.ads = 'true';
  if (customerId) params.customerId = customerId;
  if (sessionId) params.sessionId = sessionId;
  if (referralToken) params.referralToken = referralToken;
  if (withingsToken) params.withingsToken = withingsToken;
  if (has_withings_plus) params.has_withings_plus = has_withings_plus;
  if (FayBookingCode) params.FayBookingCode = FayBookingCode;

  shouldPersistParams.forEach((param) => {
    const storedVal = storage.getItem(param);
    if (storedVal) params[param] = storedVal;
  });

  return params;
}

/**
 * Update price iframe URL
 */
function updatePriceIframeUrl(providerId = '') {
  const iframe = getCached('#provider-price');
  if (!iframe) return;

  let baseUrl = iframe.getAttribute('data-src');
  if (!baseUrl) return;

  if (!state.provider) return;

  const insurance = urlParams.get('insurance');
  const specialties = urlParams.getAll('specialties');

  const additionalParams = {};
  if (state.providerId) {
    additionalParams.provider_id = state.providerId;
  }

  if (insurance) additionalParams.insurance = insurance;

  let url = buildUrlWithParams(baseUrl, additionalParams);

  if (specialties && specialties.length > 0) {
    const urlObj = new URL(url);
    specialties.forEach((sp) => urlObj.searchParams.append('specialties', sp));
    url = urlObj.toString();
  }

  iframe.setAttribute('src', url);
}

// ============================================================================
// PROVIDER PROFILE API - OPTIMIZED
// ============================================================================

/**
 * Fetch provider profile from API with caching
 */
let providerProfileCache = null;
async function fetchProviderProfile() {
  if (providerProfileCache) return providerProfileCache;

  const slug = getSlugFromURL();
  if (!slug) {
    console.error('No slug found in URL');
    return;
  }

  const apiUrl = config.providerApiBase + slug + '/';
  const fayTestProviderHint = urlParams.get('FayTestProviderHint');

  const headers = {};
  if (fayTestProviderHint === 'true') {
    headers['Fay-Test-Provider-Hint'] = 'lauren+test-provider@faynutrition.com';
  }

  try {
    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      dom.addClass('.is-availability', 'hide');
      return null;
    }

    if (response.status === 200) {
      const providerProfile = await response.json();
      state.providerProfile = providerProfile;
      state.providerId = providerProfile.provider_id;
      providerProfileCache = providerProfile;

      const iframe = document.getElementById('provider-price');
      if (iframe && !iframe.src) {
        updatePriceIframeUrl();
      }
      renderProviderProfile(providerProfile);

      return providerProfile;
    }
  } catch (error) {
    console.error('Error fetching provider profile:', error);
    dom.addClass('.is-availability', 'hide');
    return null;
  }
}

/**
 * Get availability slots with caching
 */
let availabilitySlotsCache = new Map();
async function getAvailabilitySlots(provider_id) {
  if (availabilitySlotsCache.has(provider_id)) {
    return availabilitySlotsCache.get(provider_id);
  }

  try {
    const appo_dur_min = 90;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 14 * 24 * 60 * 60 * 1000);
    const start_time = getISOWithTimezone(startTime);
    const end_time = getISOWithTimezone(endTime);

    const params = new URLSearchParams({
      start: start_time,
      end: end_time,
      appointment_duration_in_minutes: appo_dur_min,
    });

    if (allParams.pcrit) {
      params.append('pcrit', allParams.pcrit);
    }

    const AVAILABILITY_SLOTS_API_URL = `https://platform.faynutrition.com/providers/${provider_id}/availability-slots`;
    const response = await fetch(`${AVAILABILITY_SLOTS_API_URL}?${params.toString()}`);

    if (response.status === 200) {
      const data = await response.json();

      const dateSlotMap = {};

      data.available_slots.forEach((slot) => {
        const startTime = slot.window.start;
        const dateLabel = formatDateLabel(startTime);

        if (!dateSlotMap[dateLabel.dateStr]) {
          dateSlotMap[dateLabel.dateStr] = {
            date: dateLabel.slot,
            dateLabel: dateLabel.dateStr,
            numberOfSlots: 0,
          };
        }

        dateSlotMap[dateLabel.dateStr].numberOfSlots++;
      });

      const result = {
        provider_id: provider_id,
        slots: Object.values(dateSlotMap),
      };

      availabilitySlotsCache.set(provider_id, result);
      return result;
    }
    return [];
  } catch (error) {
    console.log('error', error);
    return [];
  }
}

/**
 * Placeholder for addUtmParamsInLinks (was referenced but not defined)
 */
function addUtmParamsInLinks() {
  // Implement if needed
}

/**
 * Render provider profile - OPTIMIZED with DocumentFragment
 */
function renderProviderProfile(providerProfile) {
  const availability = providerProfile.availability_types || [];
  if (availability.includes('virtual')) {
    $('.visit-type-video')?.removeClass('hide');
  }
  if (availability.includes('in_person')) {
    $('.visit-type-inperson')?.removeClass('hide');
  }

  document
    .querySelectorAll('.available-now-tag')
    .forEach((el) => el.classList.toggle('hide', !providerProfile.is_available_now));

  const selectedSpecialties = urlParams.getAll('specialties');
  const spTagContainer = document.querySelector('.sp-tags');
  const spTagClone = document.querySelector('.sp-tags .sp-tag:first-child');

  if (spTagContainer && spTagClone) {
    // Use DocumentFragment for batch DOM updates
    const fragment = document.createDocumentFragment();

    const selectedList = providerProfile.specialties.filter((s) =>
      selectedSpecialties.includes(s.slug)
    );
    const unselectedList = providerProfile.specialties.filter(
      (s) => !selectedSpecialties.includes(s.slug)
    );

    const orderedSpecialties = [...selectedList, ...unselectedList];

    orderedSpecialties.forEach((specialty) => {
      const spTag = spTagClone.cloneNode(true);
      spTag.querySelector('.sp-tag-text').textContent = specialty.name;
      if (selectedSpecialties.includes(specialty.slug)) {
        spTag.querySelector('.selected-icon').classList.remove('hide');
      }
      spTag.classList.remove('hide');
      fragment.appendChild(spTag);
    });

    spTagClone.remove();
    spTagContainer.appendChild(fragment);
  }

  const insurance = urlParams.get('insurance');
  const specialties = urlParams.getAll('specialties');

  const booking_url = new URL(
    `https://signup.faynutrition.com/book-with/${providerProfile.provider_id}`,
    window.location.origin
  );

  if (insurance) {
    booking_url.searchParams.set('insurance', insurance);
  }

  if (specialties && specialties.length > 0) {
    specialties.forEach((sp) => {
      booking_url.searchParams.append('specialties', sp);
    });
  }

  const iframeParams = buildIframeParams({
    providerId: state.providerId,
  });

  if (iframeParams) {
    Object.keys(iframeParams).forEach(function (key) {
      booking_url.searchParams.append(key, iframeParams[key]);
    });
  }

  $('.book-now-btn').attr('href', booking_url.toString());
  $('#book-now-mb').attr('href', booking_url.toString());

  getRating(providerProfile);

  getAvailabilitySlots(providerProfile.provider_id).then(function (response) {
    const fragment = document.createDocumentFragment();

    response.slots.slice(0, 7).forEach((slot) => {
      const dateClone = $('.rd-card_dates-wr .rd-card_date-link.is-clone').clone(true);
      dateClone.removeClass('is-clone hide');
      dateClone.attr('data-provider-id', response.provider_id);
      dateClone.attr('data-date', slot.date);
      dateClone.find('.rd-card_date-text').text(slot.dateLabel);
      dateClone
        .find('.rd-card_date-amount')
        .text(slot.numberOfSlots + (slot.numberOfSlots > 1 ? ' appts' : ' appt'));

      fragment.appendChild(dateClone[0]);
    });

    $('.rd-card_dates-wr').append(fragment);

    if (response.slots.length > 0) {
      $('.rd-card_dates-wr').removeClass('hide');
    } else {
      $('.is-availability').addClass('hide');
    }

    $('.rd-card-av-pc').hide();
  });

  // Debounced link parameter appending
  setTimeout(() => {
    // debouncedAppendParams();
    appendParamsToLinks();
    addUtmParamsInLinks();
  }, 500); // Reduced from 500
}

/**
 * Get and render provider rating/reviews - OPTIMIZED
 */
async function getRating(providerProfile) {
  try {
    const { provider_id } = providerProfile;
    const { slug } = providerProfile;

    const response = await fetch(
      `https://platform.faynutrition.com/providers/${provider_id}/public-reputation`
    );

    if (response.status === 200) {
      const data = await response.json();
      const ready = await window.statsigReady;
      const gateOn = ready.ok
        ? window.statsigClient.checkGate('dietitian_profile_reviews_and_ratings')
        : false;

      if (gateOn) {
        if (data.rating !== undefined && data.rating && data?.rating?.average !== undefined) {
          const reviewEle = $('.card-reviews-rating');
          if (data.rating.average > 0) {
            reviewEle.find('.cr-r-rating').text(data.rating.average);
            reviewEle
              .find('.cr-r-amount .cr-r-amount-underline')
              .text(data.rating.total_submissions);
            setRating(data.rating.average, reviewEle);

            const reviewRight = $('.dt-reviews-container');
            setRating(data.rating.average, reviewRight);

            reviewEle.removeClass('hide');

            $('.dt-reviews-container .dt-r-result').text(data.rating.average);

            const reviewText = data.rating.total_submissions === 1 ? ' Review' : ' Reviews';
            $('.dt-reviews-container .dt-r-result-amount.is-desktop').text(
              data.rating.total_submissions + reviewText
            );
            $('.dt-reviews-container .dt-r-result-amount.is-mobile').text(
              '(' + data.rating.total_submissions + ')'
            );

            // Optimized rating bar rendering with lookup table
            const ratingKeys = ['five_star', 'four_star', 'three_star', 'two_star', 'one_star'];
            $('.dt-reviews-container .dt-r-lines-wr .dt-r-line-wr').each(function (i, el) {
              const ratingKey = ratingKeys[i];
              const ratingValue = data.rating[ratingKey];
              const percentage = (ratingValue * 100) / data.rating.total_submissions;

              $(el)
                .find('.cr-r-amount')
                .text('(' + ratingValue + ')');
              $(el).find('.dt-r-line-h').css('width', `${percentage}%`);

              if (ratingValue >= 1) {
                $(el).find('.dt-r-line-h').css('min-width', `8px`);
              }
            });

            $('.dt-r-links-wr-overlay').removeClass('hide');
            $('.dt-r-links-wr').removeClass('hide');
            $('.dt-reviews-wr').removeClass('hide');
            $('.dietitian-wrap_col-left').addClass('is-reviews-col');

            if (data.reviews.length > 0) {
              state.reviewsData = data.reviews.sort(
                (a, b) => new Date(b.date_created) - new Date(a.date_created)
              );
              $('.dt-r-links-wr').find('.dt-r-link-r').removeClass('hide');
              $('.dt-r-links-wr').find('.dt-r-link-r-text').text(data.reviews.length);

              $('.dt-reviews-wr').find('.amount-reviews').text(data.reviews.length);

              if (data.reviews.length == 1) {
                $('.amount-reviews-text').text('client');
                $('.amount-reviews-text-s').text('review');
              }

              if (data.reviews.length >= 3) {
                $('.dt-r-ai-wr .dt-r-ai-rich').html(data.review_summary);
                $('.dt-r-ai-wr').removeClass('hide');
              } else {
                $('.dt-r-ai-wr').remove();
              }
              $('.dt-r-empty-wr').remove();

              showReviews(5);

              if (data.reviews.length > 5) {
                $('.show-more-reviews').removeClass('hide');
              }
            } else {
              $('.dt-r-reviews').remove();
              $('.dt-r-ai-wr').remove();
              $('.dt-r-empty-wr').removeClass('hide');
            }
          } else {
            reviewEle.remove();
          }
        }
      }

      const mixpanelStatus = await window.mixpanelReady;
      var userAgentBotTest = navigator.userAgent;
      mixpanel.register({ 'User Agent': userAgentBotTest });
      if (/DatadogSynthetics/i.test(userAgentBotTest)) {
        mixpanel.register({ $ignore: true });
      }

      if (mixpanelStatus?.ok) {
        mixpanel?.track('profile_viewed', {
          RatingShown: gateOn,
          Rating: data?.rating?.average || '',
          ReviewCount: data?.reviews ? data.reviews.length : 0,
          ProviderId: provider_id,
          Slug: slug,
          RatingCount: data?.rating?.total_submissions || 0,
          has_provider_with_instant_bookings: providerProfile?.is_available_now ?? false,
        });
      }
    }
  } catch (err) {
    console.error('getRating failed:', err);

    const mixpanelStatus = await window.mixpanelReady;
    if (mixpanelStatus?.ok) {
      mixpanel?.track('profile_viewed_error', {
        provider_id,
        slug,
        Reason: String(err?.message || err),
      });
    }
  }
}

function setRating(rating, element) {
  rating = parseFloat(rating);

  element.find('.rd-r-stars-wr .rd-r-star').each(function (index) {
    let starIndex = index + 1;
    let fillPercent = 0;

    if (rating >= starIndex) {
      fillPercent = 100;
    } else if (rating > starIndex - 1) {
      const decimal = rating % 1;
      fillPercent = Math.round(decimal * 100);
    }
    $(this)
      .find('.star-fill-rect')
      .attr('width', fillPercent + '%');
  });
}

function timeAgo(utcDateStr) {
  const date = new Date(utcDateStr);
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return years + (years === 1 ? ' year ago' : ' years ago');
  if (months > 0) return months + (months === 1 ? ' month ago' : ' months ago');
  if (weeks > 0) return weeks + (weeks === 1 ? ' week ago' : ' weeks ago');
  if (days > 0) return days + (days === 1 ? ' day ago' : ' days ago');
  if (hours > 0) return hours + (hours === 1 ? ' hour ago' : ' hours ago');
  if (minutes > 0) return minutes + (minutes === 1 ? ' minute ago' : ' minutes ago');
  return seconds + (seconds === 1 ? ' second ago' : ' seconds ago');
}

function showReviews(count) {
  const container = $('.dt-r-reviews-wr');
  const slice = state.reviewsData.slice(
    state.currentReviewsIndex,
    state.currentReviewsIndex + count
  );

  const template = $('.dt-r-card.is-clone');
  const fragment = document.createDocumentFragment();

  slice.forEach((review) => {
    const card = template.clone(true);
    card.removeClass('hide is-clone');
    card.find('.dt-r-card-quote').html(review.content);
    card.find('.dt-r-card-author-name').text(review.reviewer_name);
    card.find('.dt-r-card-date').text(timeAgo(review.date_created));

    card
      .find('.dt-r-card-author-image')
      .attr('src', review.reviewer_avatar_url)
      .attr('alt', review.reviewer_name || 'Reviewer');

    setRating(review.star_rating, card);

    fragment.appendChild(card[0]);
  });

  container.append(fragment);

  state.currentReviewsIndex += slice.length;

  if (state.currentReviewsIndex >= state.reviewsData.length) {
    $('.show-more-reviews').addClass('hide');
  }
}

$('.show-more-reviews').click(function (e) {
  e.preventDefault();
  showReviews(10);
});

// ============================================================================
// MODAL CONTROLS
// ============================================================================

const KEYCODES = {
  ESC: 27,
  TAB: 9,
  RETURN: 13,
};

/**
 * Initialize price modal
 */
function initPriceModal() {
  const btn = getCached('#price-btn');
  const modal = getCached('#price-modal');

  if (!btn || !modal) return;

  const focusableElements =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const closers = document.querySelectorAll('[fay-data="close"]');
  let previousActiveElement;

  const openModal = () => {
    const iframe = document.getElementById('provider-price');
    if (iframe && !iframe.src) {
      updatePriceIframeUrl();
    }

    previousActiveElement = document.activeElement;
    const focusableContent = modal.querySelectorAll(focusableElements);
    modal.classList.add('is-open');

    document.addEventListener('keydown', keyPressed);
    closers.forEach((closer) => closer.addEventListener('click', closeModal));

    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');

    if (focusableContent[0]) {
      focusableContent[0].focus();
    }
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    closers.forEach((closer) => closer.removeEventListener('click', closeModal));
    document.removeEventListener('keydown', keyPressed);
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';

    if (previousActiveElement) {
      previousActiveElement.focus();
    }
  };

  const keyPressed = (event) => {
    if (event.keyCode === KEYCODES.ESC) {
      closeModal();
      return;
    }

    if (event.keyCode !== KEYCODES.TAB) {
      return;
    }

    const focusableContent = modal.querySelectorAll(focusableElements);

    if (event.shiftKey) {
      if (document.activeElement === focusableContent[0]) {
        focusableContent[focusableContent.length - 1].focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === focusableContent[focusableContent.length - 1]) {
        focusableContent[0].focus();
        event.preventDefault();
      }
    }
  };

  btn.addEventListener('click', openModal);
}

/**
 * Initialize appointment popup - OPTIMIZED with event delegation
 */
function initAppointmentPopup() {
  const iframe = document.getElementById('availability-iframe');

  if (iframe && !iframe.src) {
    iframe.src = iframe.dataset.src;
  }

  const closeBtn = getCached('.appointment-popup-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const popup = getCached('#rd-popup');
      if (!popup) return;

      popup.classList.remove('is-visible');
      popup.setAttribute('inert', '');
      popup.setAttribute('aria-hidden', 'true');

      const iframe = getCached('#availability-iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: 'loadAvailabilityForProvider' },
          'https://signup.faynutrition.com'
        );
      }

      document.body.style.overflow = '';
    });
  }

  // Event delegation for dynamically created elements
  $(document).on('click', '.rd-card_date-link', function () {
    const iframe = getCached('#availability-iframe');

    if (iframe && !iframe.src) {
      iframe.src = iframe.dataset.src;
      initAppointmentPopup();
    }

    $('#iframeLoader').css('display', 'flex');

    let formattedDate = $(this).attr('data-date') || '';

    let iframeParams = buildIframeParams({
      providerId: state.providerId,
      focusDate: formattedDate,
    });

    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(iframeParams, 'https://signup.faynutrition.com');
    }

    $('#rd-popup').addClass('is-visible');
    $('#rd-popup').removeAttr('inert');
    $('#rd-popup').attr('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
}

// ============================================================================
// WINDOW MESSAGE HANDLERS
// ============================================================================

/**
 * Handle messages from iframes - OPTIMIZED with single handler
 */
function initMessageHandlers() {
  window.addEventListener('message', handleMessage);
}

function handleMessage(event) {
  if (
    event.origin !== 'https://provider.faynutrition.com' &&
    event.origin !== 'https://signup.faynutrition.com'
  ) {
    return;
  }

  if (event.data.navigateTo) {
    handlePriceNavigation(event.data.navigateTo);
    return;
  }

  if (event.data.name === 'windowResize' && typeof event.data.height === 'number') {
    const wrapper = getCached('#iframe-resize');
    if (wrapper) {
      wrapper.style.height = event.data.height + 'px';
    }
    return;
  }
  if (event.data.source === 'availability-app') {
    if (event.data.type === 'availabilityAppStatusChange' && event.data.status === 'ready') {
      handleAvailabilityReady(event);
    } else if (event.data.type === 'slotConfirmed') {
      handleSlotConfirmed(event.data);
    }
  }
}

/**
 * Handle navigation from price iframe
 */
function handlePriceNavigation(navigateUrl) {
  const insurance = urlParams.get('insurance');
  const specialties = urlParams.getAll('specialties');

  const additionalParams = {};
  if (insurance) additionalParams.insurance = insurance;

  let url = buildUrlWithParams(navigateUrl, additionalParams);

  if (specialties && specialties.length > 0) {
    const urlObj = new URL(url);
    specialties.forEach((sp) => urlObj.searchParams.append('specialties', sp));
    url = urlObj.toString();
  }

  window.location.href = url;
}

/**
 * Handle availability iframe ready event
 */
function handleAvailabilityReady(event) {
  const iframe = getCached('#availability-iframe');
  if (!iframe || !iframe.contentWindow) {
    iframe.src = iframe.dataset.src;
  }

  const iframeParams = buildIframeParams({
    providerId: state.providerId,
  });

  iframe.contentWindow.postMessage(iframeParams, 'https://signup.faynutrition.com');
}

/**
 * Handle slot confirmation from availability iframe
 */
function handleSlotConfirmed(data) {
  const { providerId, start, availabilityType } = data;
  const deviceType = getDeviceType();

  const insurance = urlParams.get('insurance');
  const specialties = urlParams.getAll('specialties');

  const additionalParams = {
    slot_start: start,
    slot_availability_type: availabilityType,
  };

  if (insurance) additionalParams.insurance = insurance;

  const baseUrl = `https://signup.faynutrition.com/book-with/${providerId}`;
  let url = buildUrlWithParams(baseUrl, additionalParams);

  if (specialties && specialties.length > 0) {
    const urlObj = new URL(url);
    specialties.forEach((sp) => urlObj.searchParams.append('specialties', sp));
    url = urlObj.toString();
  }

  const target = deviceType === 'PHONE' || deviceType === 'TABLET' ? '_self' : '_blank';
  window.open(url, target);
}

// ============================================================================
// INITIALIZATION - OPTIMIZED
// ============================================================================

/**
 * Initialize everything when DOM is ready
 */
function init() {
  fetchProviderProfile();
  initUI();
  initAppointmentPopup();
  cleanBackgroundLinks();
  initPriceModal();
  initMessageHandlers();

  // Defer non-critical operations
  /*  requestIdleCallback(
      () => {
        fetchProviderProfile();
      },
      { timeout: 500 }
    ); */
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.onload = function () {
  updatePriceIframeUrl();
};
