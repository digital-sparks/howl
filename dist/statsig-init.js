"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/statsig-init.js
  var EXPERIMENT_NAME = "homepage_redesign";
  var EXPERIMENT_STORAGE_KEY = "fay_homepage_experiment";
  var SEEN_WITHOUT_CONSENT_KEY = "fay_homepage_seen_no_consent";
  var NEW_HOMEPAGE_PATH = "/re-design/home-ds";
  async function waitForService(checkFn, timeout = 5e3, delay = 50) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (checkFn()) return true;
      await new Promise((r) => window.setTimeout(r, delay));
    }
    return false;
  }
  async function waitForStatsigGates(timeout = 5e3) {
    return waitForService(() => window.statsigGates?.ready, timeout);
  }
  async function waitForMixpanel(timeout = 5e3) {
    return waitForService(() => window.mixpanel, timeout);
  }
  async function waitForOsano(timeout = 5e3) {
    return waitForService(() => window.Osano, timeout);
  }
  function hidePreloader() {
    const preloader = document.querySelector(".statsig-loader");
    if (preloader) {
      preloader.style.display = "none";
    }
  }
  function getRedirectUrl(path) {
    const url = new URL(path, window.location.origin);
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  }
  function getExperimentAssignment(statsigReady) {
    const stored = localStorage.getItem(EXPERIMENT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    const shouldRedirect = statsigReady && window.statsigGates?.homepageRedesign;
    const assignment = {
      variant: shouldRedirect ? "redesign" : "control",
      assignedAt: Date.now(),
      experimentTracked: false
    };
    localStorage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(assignment));
    return assignment;
  }
  function markExperimentTracked(assignment) {
    assignment.experimentTracked = true;
    localStorage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(assignment));
  }
  function isBot() {
    const botPattern = /DatadogSynthetics/i;
    return botPattern.test(window.navigator.userAgent);
  }
  function markSeenWithoutConsent() {
    localStorage.setItem(SEEN_WITHOUT_CONSENT_KEY, Date.now().toString());
  }
  function hasSeenWithoutConsent() {
    return localStorage.getItem(SEEN_WITHOUT_CONSENT_KEY) !== null;
  }
  var adsUrlParams = new window.URLSearchParams(window.location.search);
  var isAds = adsUrlParams.get("ads");
  var customerId = adsUrlParams.get("customerId");
  var sessionId = adsUrlParams.get("sessionId");
  var referralToken = adsUrlParams.get("referralToken");
  var withingsToken = adsUrlParams.get("withings_token") ?? adsUrlParams.get("withingsToken");
  var has_withings_plus = adsUrlParams.get("has_withings_plus");
  var FayBookingCode = adsUrlParams.get("FayBookingCode");
  if (withingsToken) {
    window.localStorage.setItem("withingsToken", withingsToken);
  }
  function handleDefaultHomepage(reason) {
    console.log(`Showing default homepage - reason: ${reason}`);
    window.Webflow ||= [];
    window.Webflow.push(async () => {
      hidePreloader();
      const quizGateOn = window.statsigGates?.quizFlow || false;
      if (quizGateOn) {
        window.localStorage.setItem("hasQuizFlow", "true");
        document.querySelectorAll(".find-dietitian-link").forEach((el) => el.setAttribute("href", "https://signup.faynutrition.com/quiz"));
        $(".find-dietitian-link").attr("href", "https://signup.faynutrition.com/quiz");
      } else {
        window.localStorage.removeItem("hasQuizFlow");
      }
      if (isAds === "true") {
        $(".nav-ads").hide();
        $(".footer-full").hide();
        $(".footer-ads-v").show();
        $(".is-cities-home").remove();
        $(".nav-ads-active").addClass("nav-ads-show");
      }
      appendAdsParamOnLinks();
    });
  }
  function handleFallback() {
    markSeenWithoutConsent();
    window.Webflow ||= [];
    window.Webflow.push(async () => {
      hidePreloader();
      if (isAds === "true") {
        $(".nav-ads").hide();
        $(".footer-full").hide();
        $(".footer-ads-v").show();
        $(".is-cities-home").remove();
        $(".nav-ads-active").addClass("nav-ads-show");
      }
      appendAdsParamOnLinks();
    });
  }
  (async function() {
    const mixpanelReady = await waitForMixpanel(1e3);
    const statsigReady = await waitForStatsigGates(1e3);
    const osanoReady = await waitForOsano(1e3);
    const servicesReady = mixpanelReady && statsigReady && window.mixpanel && window.statsigGates && osanoReady && window.Osano;
    if (!servicesReady) {
      console.log("Timeout waiting for services - skipping experiment");
      handleFallback();
      return;
    }
    console.log("Statsig, Mixpanel and Osano loaded");
    window.mixpanel.register({ "User Agent": window.navigator.userAgent });
    if (isBot()) {
      window.mixpanel.register({ $ignore: true });
    }
    const hasAnalyticsConsent = window.Osano.cm.analytics;
    if (!hasAnalyticsConsent) {
      markSeenWithoutConsent();
      handleDefaultHomepage("no_consent");
      return;
    }
    if (hasSeenWithoutConsent()) {
      console.log("User previously saw homepage without consent - excluding from experiment");
      handleDefaultHomepage("previously_seen_without_consent");
      return;
    }
    const experimentAssignment = getExperimentAssignment(statsigReady);
    console.log("Experiment assignment:", experimentAssignment);
    if (experimentAssignment.variant === "redesign") {
      if (!experimentAssignment.experimentTracked) {
        window.sessionStorage.setItem("fay_redirect_pending", "true");
        window.mixpanel.track(
          "$experiment_started",
          {
            "Experiment name": EXPERIMENT_NAME,
            "Variant name": "redesign"
          },
          { send_immediately: true },
          () => {
            markExperimentTracked(experimentAssignment);
            window.location.href = getRedirectUrl(NEW_HOMEPAGE_PATH);
          }
        );
      } else {
        window.location.href = getRedirectUrl(NEW_HOMEPAGE_PATH);
      }
      return;
    }
    window.Webflow ||= [];
    window.Webflow.push(async () => {
      hidePreloader();
      if (!experimentAssignment.experimentTracked) {
        console.log("Tracking $experiment_started for control variant");
        window.mixpanel.track("$experiment_started", {
          "Experiment name": EXPERIMENT_NAME,
          "Variant name": "control"
        });
        markExperimentTracked(experimentAssignment);
      }
      window.mixpanel.init("b244137ebd6eaed06ec25cc81bec6ad0", {
        record_sessions_percent: 100,
        record_mask_text_selector: ""
      });
      const quizGateOn = window.statsigGates?.quizFlow || false;
      const ratingsGateOn = window.statsigClient?.checkGate("dietitian_profile_reviews_and_ratings") || false;
      if (quizGateOn) {
        window.localStorage.setItem("hasQuizFlow", "true");
        document.querySelectorAll(".find-dietitian-link").forEach((el) => el.setAttribute("href", "https://signup.faynutrition.com/quiz"));
      } else {
        window.localStorage.removeItem("hasQuizFlow");
      }
      window.mixpanel.track("home_page_viewed", {
        // 'Experiment name': EXPERIMENT_NAME,
        // 'Variant name': 'control',
        RatingShown: ratingsGateOn,
        QuizShown: quizGateOn
      });
      window.mixpanel.track("$experiment_started", {
        "Experiment name": "quiz_flow",
        "Variant name": quizGateOn ? "quiz_flow_v1" : "booking_flow"
      });
      if (quizGateOn) {
        $(".find-dietitian-link").attr("href", "https://signup.faynutrition.com/quiz");
        window.setTimeout(() => {
          if (typeof addUtmParamsInLinks === "function") {
            addUtmParamsInLinks();
          }
        }, 1e3);
      }
      if (isAds === "true") {
        $(".nav-ads").hide();
        $(".footer-full").hide();
        $(".footer-ads-v").show();
        $(".is-cities-home").remove();
        $(".nav-ads-active").addClass("nav-ads-show");
      }
      appendAdsParamOnLinks();
    });
  })();
  function appendAdsParamOnLinks() {
    document.querySelectorAll("a[href]").forEach((link) => {
      try {
        const href = link.getAttribute("href");
        let updatedUrl;
        if (href.startsWith("/")) {
          updatedUrl = new URL(href, window.location.origin);
        } else if (href.startsWith("http")) {
          const tempUrl = new URL(href);
          if (!tempUrl.hostname.endsWith(".faynutrition.com") && tempUrl.hostname !== "faynutrition.com") {
            return;
          }
          updatedUrl = tempUrl;
        } else {
          return;
        }
        const searchParams = new URLSearchParams(updatedUrl.search);
        if (isAds === true || isAds === "true") {
          searchParams.set("ads", "true");
        }
        if (customerId && sessionId) {
          searchParams.set("customerId", customerId);
          searchParams.set("sessionId", sessionId);
        }
        if (referralToken) {
          searchParams.set("referralToken", referralToken);
        }
        if (withingsToken) {
          searchParams.set("withingsToken", withingsToken);
        }
        if (has_withings_plus) {
          searchParams.set("has_withings_plus", has_withings_plus);
        }
        if (FayBookingCode) {
          searchParams.set("FayBookingCode", FayBookingCode);
        }
        const urlParams = new URLSearchParams(window.location.search);
        const insurance = urlParams.get("insurance");
        if (insurance != null && insurance !== "") {
          searchParams.set("insurance", insurance);
        }
        updatedUrl.search = searchParams.toString();
        link.href = updatedUrl.toString();
      } catch (err) {
        console.warn("Invalid link:", link.href);
      }
    });
  }
})();
//# sourceMappingURL=statsig-init.js.map
