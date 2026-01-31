
const urlParamsFind1 = new URLSearchParams(window.location.search);
const isAds = urlParamsFind1.get("ads") === "true";
const customerId = urlParamsFind1.get("customerId");
const sessionId = urlParamsFind1.get("sessionId");
const referralToken = urlParamsFind1.get("referralToken");
const FayBookingCode = urlParamsFind1.get("FayBookingCode");
const withingsToken =
  urlParamsFind1.get("withings_token") ?? urlParamsFind1.get("withingsToken");
const has_withings_plus = urlParamsFind1.get("has_withings_plus");

if (withingsToken) {
  localStorage.setItem("withingsToken", withingsToken);
}

const pcrit =
  (urlParamsFind1.get("pcrit") ?? localStorage.getItem("pcrit")) || null;

// Hit impression endpoint
// Read existing called tokens from sessionStorage (or empty object if none)
let withingsImpressionCalled =
  JSON.parse(sessionStorage.getItem("withingsImpressionCalled")) || {};
// Check if required variables exist and this token hasn't been used yet
if (
  withingsToken &&
  has_withings_plus != null &&
  !withingsImpressionCalled[withingsToken]
) {
  fetch("https://api.faynutrition.com/fay-api/withings/impression", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      withings_token: withingsToken,
      has_withings_plus: has_withings_plus,
    }),
  })
    .then((response) => {
      if (response.ok) {
        // Mark this token as called
        withingsImpressionCalled[withingsToken] = true;
        sessionStorage.setItem(
          "withingsImpressionCalled",
          JSON.stringify(withingsImpressionCalled)
        );
      }
    })
    .catch((error) => {
      console.error("Withings impression error:", error);
    });
}

// Append ads and other params to all internal links
function appendAdsParamOnLinks() {
  document.querySelectorAll("a[href]").forEach((link) => {
    try {
      const href = link.getAttribute("href");
      if (href.startsWith("/")) {
        updatedUrl = new URL(href, window.location.origin);
      } else if (href.startsWith("http")) {
        const tempUrl = new URL(href);
        if (
          !tempUrl.hostname.endsWith(".faynutrition.com") &&
          tempUrl.hostname !== "faynutrition.com"
        ) {
          return;
        }
        updatedUrl = tempUrl;
      } else {
        return;
      }

      const searchParams = new URLSearchParams(updatedUrl.search);
      if (isAds == true || isAds == "true") {
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

      updatedUrl.search = searchParams.toString();
      link.href = updatedUrl.toString();
    } catch (err) {
      console.warn("Invalid link:", link.href);
    }
  });
}

function getDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isTablet = /ipad|tablet|(android(?!.*mobile))/.test(userAgent);
  const isMobile = /iphone|ipod|android.*mobile|windows phone|blackberry/.test(
    userAgent
  );

  if (isMobile) return "PHONE";
  if (isTablet) return "TABLET";
  return "DESKTOP";
}

!(function () {
  let t = "STATSIG_LOCAL_STORAGE_STABLE_ID";
  function e() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    let t = () =>
      Math.floor(65536 * Math.random())
        .toString(16)
        .padStart(4, "0");
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
        let o = window.location.host.split(".");
        o.length > 2 && o.shift();
        let s = `.${o.join(".")}`;
        document.cookie = `statsiguuid=${
          i || e()
        };Expires=${n};Domain=${s};Path=/;Secure`;
      })(o);
  }
})();

// --- Timebox helper: resolves to { ok: true } or { ok: false, timeout: true }
async function withTimeout(promise, ms) {
  return Promise.race([
    promise.then(() => ({ ok: true })),
    new Promise((resolve) =>
      setTimeout(() => resolve({ ok: false, timeout: true }), ms)
    ),
  ]);
}

// --- Retry logic for Statsig initialization
async function waitForStatsig(timeout = 3000, retries = 10, delay = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const { StatsigClient } = window.Statsig || {};

    if (StatsigClient && !window.statsigClient) {
      const userObj = {};
      if (localStorage.getItem("STATSIG_LOCAL_STORAGE_STABLE_ID")) {
        userObj.customIDs = {
          stableID: localStorage.getItem("STATSIG_LOCAL_STORAGE_STABLE_ID"),
        };
      }

      // const client = new StatsigClient("client-qFGr4zDaYW5oH0a40Gf5rZInM1UXVqvLJuByLtwUJQt", userObj, {environment: {tier: 'staging'} });
      const client = new StatsigClient(
        "client-eNg4fu7Fpe036cvkjwJk5AheQdNZUgFIWeSme9TRQMw",
        userObj,
        { environment: { tier: "production" } }
      );

      window.statsigClient = client;
    }

    if (
      window.statsigClient &&
      typeof window.statsigClient.initializeAsync === "function"
    ) {
      const result = await withTimeout(
        window.statsigClient.initializeAsync(),
        timeout
      );
      if (result.ok) {
        return { ok: true };
      }
    }

    if (attempt < retries) {
      console.warn(
        `Statsig not ready (attempt ${attempt}/${retries}). Retrying in ${delay}ms...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  return { ok: false, timeout: true };
}

// --- Global Statsig readiness promise (never rejects)
window.statsigReady = (async () => {
  const result = await waitForStatsig(3000, 10, 1500);
  return result;
})();

// Timebox helper: resolves to { ok: true } or { ok: false, timeout: true }
function withTimeout(promise, ms) {
  return Promise.race([
    promise.then(() => ({ ok: true })),
    new Promise((resolve) =>
      setTimeout(() => resolve({ ok: false, timeout: true }), ms)
    ),
  ]);
}

// Global readiness promise (never rejects)
/*   window.statsigReady = (async () => {
  const result = await withTimeout(client.initializeAsync(), 3000);
  return result.ok ? { ok: true } : { ok: false, timeout: true };
})(); */

async function waitForMixpanel(timeout = 3000, retries = 10, delay = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    if (window.mixpanel) {
      const result = await withTimeout(
        Promise.resolve(window.mixpanel),
        timeout
      );
      if (result.ok) {
        return { ok: true };
      }
    }

    if (attempt < retries) {
      // wait before retrying
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  return { ok: false, timeout: true };
}

// Global promise that retries
window.mixpanelReady = (async () => {
  const result = await waitForMixpanel(3000, 10, 1500);
  return result;
})();

setTimeout(() => {
  appendAdsParamOnLinks();
}, 100);

if (isAds == true || isAds == "true") {
  $(".nav-ads").hide();
  $(".footer-full").hide();
  $(".footer-ads-v").show();
  $(".footer-full").hide();
}

if (withingsToken) {
  $(".am-partners").removeClass("hide");
}

$(".outcomes-slider_component").each(function (index) {
  new Swiper($(this).find(".swiper")[0], {
    slidesPerView: 1,
    keyboard: true,
    mousewheel: {
      forceToAxis: true,
    },
    a11y: {
      slideRole: "listitem",
    },
    slideToClickedSlider: true,
    spaceBetween: "2%",
    breakpoints: {
      480: {
        slidesPerView: 1,
        spaceBetween: "4%",
      },
      768: {
        slidesPerView: 2,
        spaceBetween: "4%",
      },
      992: {
        slidesPerView: 2.5,
        spaceBetween: "2%",
      },
    },
    navigation: {
      nextEl: $(this).find(".swiper-next")[0],
      prevEl: $(this).find(".swiper-prev")[0],
      disabledClass: "is-disabled",
    },
  });
});

const nav = document.querySelector(".static-nav");
const triggers = document.querySelectorAll(".popup-trigger");
const popups = document.querySelectorAll(".mobile-filter-modal");
let lastTrigger = null;

let currentPage = 1;
let selectedState = "";
let tempSelectedState = {};
let tempSearchFilters = {};
let userLocation = null;
let isUrlHasParams = false;
let searchFilters = {};

var togElements = document.querySelectorAll(
  ".find-w-params-wr .navbar_filter-toggle"
);
var dropdownElements = document.querySelectorAll(
  ".find-w-params-wr .hero_dropdown-wrap"
);
var saveElements = document.querySelectorAll(".find-w-params-wr .save");

function toggleDropdown(event) {
  var clickedDropdown = event.currentTarget.nextElementSibling;
  for (var i = 0; i < dropdownElements.length; i++) {
    if (dropdownElements[i] !== clickedDropdown) {
      dropdownElements[i].classList.remove("open");
      dropdownElements[i].removeAttribute("aria-expanded");
      dropdownElements[i].setAttribute("aria-expanded", "false");
    }
  }
  clickedDropdown.classList.toggle("open");
  clickedDropdown.setAttribute("aria-expanded", "true");
}

function closeDropdown(event) {
  var dropdown = event.currentTarget.closest(".hero_dropdown-wrap");
  if (dropdown) {
    dropdown.classList.remove("open");
    dropdown.removeAttribute("aria-expanded");
    dropdown.setAttribute("aria-expanded", "false");
  }
}

function closeDropdownsOutsideForm(event) {
  var clickedElement = event.target;
  var isDropdownClicked =
    clickedElement.closest(".filter-wrapper:not(.search-location-element)") !==
    null;
  if (!isDropdownClicked) {
    for (var i = 0; i < dropdownElements.length; i++) {
      if (
        dropdownElements[i].id == "search-specialty-dropdown" &&
        dropdownElements[i].classList.contains("open")
      ) {
        // resetSpecialtyHeroSearch();
        // Hero Filter - Desktop specialties trigger save button click
        $("#search-specialty-dropdown .save").trigger("click");
      }

      dropdownElements[i].classList.remove("open");
      dropdownElements[i].removeAttribute("aria-expanded");
      dropdownElements[i].setAttribute("aria-expanded", "false");
    }
  }
}

for (var i = 0; i < togElements.length; i++) {
  togElements[i].addEventListener("click", toggleDropdown);
}

for (var i = 0; i < saveElements.length; i++) {
  saveElements[i].addEventListener("click", closeDropdown);
}
document.addEventListener("click", closeDropdownsOutsideForm);

triggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    const popupId = event.currentTarget.getAttribute("data-popup");
    const popup = document.getElementById(popupId);
    if (popup) {
      openPopup(popup, trigger);
    }
  });
});

// Hero Filter - Mobile specialties close button click event
$(".mobile-filter-modal .close").click(function (e) {
  // Hero Filter - Mobile specialties trigger save button click
  $("#search-specialties .save").trigger("click");
  const popup = $(e.target).closest(".mobile-filter-modal");
  closePopup(popup[0]);
});

/* popups.forEach((popup) => {
  const closeButton = popup.querySelectorAll(".close");
  if (closeButton && closeButton.length > 0) {
    closeButton.forEach((button) => {
      button.addEventListener("click", () => closePopup(popup));
    });
  }
  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      closePopup(popup);
    }
  });
}) */

function openPopup(popup, trigger) {
  popups.forEach((otherPopup) => {
    if (otherPopup !== popup) {
      otherPopup.classList.remove("is-visible");
      otherPopup.setAttribute("inert", "");
      otherPopup.setAttribute("aria-hidden", "true");
    }
  });

  popup.classList.add("is-visible");
  popup.removeAttribute("inert");
  popup.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (
    popup.getAttribute("id") == "location-popup" ||
    popup.getAttribute("id") == "location"
  ) {
    if (popup.getAttribute("id") != "location-popup") {
      nav.style.top = "-4.5rem";
    }

    if (isUrlHasParams) {
      const urlParams = new URLSearchParams(window.location.search);
      const state = urlParams.get("state");
      const stateText = urlParams.get("stateText");

      if (state) {
        var inputText = sessionStorage.getItem("stateInputText");
        try {
          inputText = JSON.parse(inputText);
        } catch (error) {
          inputText = null;
        }

        tempSelectedState.state = state;

        if (stateText) {
          tempSelectedState.stateInputText = stateText ? stateText : "";
        } else if (inputText?.stateText) {
          tempSelectedState.stateInputText = inputText.stateText
            ? inputText.stateText
            : "";
        } else {
          $(".dropdown-list .count-state").each(function () {
            if ($(this).attr("state-name") == state) {
              const stateName = $(this).find(".checkbox-label").text();
              tempSelectedState.stateInputText = stateName;
            }
          });
        }

        zipInput.value = tempSelectedState.stateInputText;
        zipInputPopup.value = tempSelectedState.stateInputText;
        zipInputMobile.value = tempSelectedState.stateInputText;

        const locCoo = urlParams.get("location_coordinates");

        if (locCoo != undefined) {
          let locCooAry = locCoo.split(",");
          if (locCooAry.length == 2) {
            tempSelectedState.userLatLong = {
              lat: locCooAry[0],
              lng: locCooAry[1],
            };
          }
        }
        $(".location-save").removeClass("is-disable");
      } else {
        $(".location-save").addClass("is-disable");
      }
    } else {
      if (searchFilters.state !== undefined && searchFilters.state != "") {
        $("#zip-input-mobile").val(searchFilters.stateInputText);
        $(".location-save").removeClass("is-disable");
      } else {
        $(".location-save").addClass("is-disable");
      }
    }
  } else {
    nav.style.top = "-4.5rem";
  }

  if (popup.getAttribute("id") == "location") {
    const focusableElements = popup.querySelectorAll(
      "a, button, input, select, textarea"
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  lastTrigger = trigger;
}

function closePopup(popup) {
  popup.classList.remove("is-visible");
  popup.setAttribute("inert", "");
  popup.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  nav.style.top = "0rem";

  if (popup.id == "location") {
    tempSearchFilters = {};
    tempSelectedState = {};
    zipInputPopup.value = "";
    zipInputMobile.value = "";
  }

  if (lastTrigger) {
    lastTrigger.focus();
    lastTrigger = null;
  }
}

const resultDropdownElements = document.querySelectorAll(
  ".find-data-wr .filter-dropdown_list"
);

function closeResultDropdownsOutsideForm(event) {
  var clickedElement = event.target;
  var isDropdownClicked =
    clickedElement.closest(".filter-dropdown_list") !== null;
  if (!isDropdownClicked) {
    for (var i = 0; i < resultDropdownElements.length; i++) {
      if (
        resultDropdownElements[i].classList.contains("is-specialties") &&
        resultDropdownElements[i].classList.contains("w--open")
      ) {
        // resetSpecialtyResultSearch();
        $(".find-data-wr .filter-dropdown_list.is-specialties .save").trigger(
          "click"
        );
      } else if (
        resultDropdownElements[i].classList.contains("is-modalities") &&
        resultDropdownElements[i].classList.contains("w--open")
      ) {
        //resetModalitiesResultSearch();
        $(".filter-dropdown_list.is-modalities .save").trigger("click");
      }
    }
  }
}

document.addEventListener("click", closeResultDropdownsOutsideForm);

// Changed WEB-165
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    popups.forEach((popup) => {
      if (popup.classList.contains("is-visible")) {
        closePopup(popup);

        if (popup.getAttribute("id") == "all") {
          // $("#all .close").trigger("click");
          $("#all .save").trigger("click");
        } else if (popup.getAttribute("id") == "specialties") {
          // $(".find-data-wr #specialties .close").trigger("click");
          $(".find-data-wr #specialties .save").trigger("click");
        }
      }
    });
  }
});

$(window).keydown(function (event) {
  if (event.keyCode == 13) {
    event.preventDefault();
    return false;
  }
});

const zipInputPopup = document.getElementById("zip-input-popup");
const zipInput = document.getElementById("zip-input");
const zipInputMobile = document.getElementById("zip-input-mobile");
const zipInputSearch = document.getElementById("zip-input-search");
const clearState = document.getElementById("clear-state");

function updateStateParam(newValue, userLocation = null, stateText = null) {
  const url = new URL(window.location.href);
  if (newValue) {
    url.searchParams.set("state", newValue);
    if (stateText) {
      url.searchParams.set("stateText", stateText);
    }

    if (
      userLocation !== null &&
      userLocation.lat !== undefined &&
      userLocation.lng !== undefined
    ) {
      const userLatLong = `${userLocation.lat},${userLocation.lng}`;
      url.searchParams.set("location_coordinates", userLatLong);
    } else {
      url.searchParams.delete("location_coordinates");
    }
  } else {
    url.searchParams.delete("state");
    url.searchParams.delete("location_coordinates");
  }

  url.searchParams.delete("page");
  currentPage = 1;

  const state = {
    page: currentPage,
  };

  window.history.replaceState(state, "", url);

  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => {
    fetchProviderProfiles();
  }, 500);
}

const isOnlyStateSelected = (place) => {
  if (!place || !place.address_components) return false;

  const components = place.address_components;

  const hasState = components.some((comp) =>
    comp.types.includes("administrative_area_level_1")
  );

  const hasCityOrCounty = components.some(
    (comp) =>
      comp.types.includes("locality") ||
      comp.types.includes("administrative_area_level_2")
  );

  return hasState && !hasCityOrCounty;
};

function initMap() {
  const applyAutocomplete = (inputElement) => {
    const autocomplete = new google.maps.places.Autocomplete(inputElement, {
      types: ["(regions)"],
      componentRestrictions: { country: "us" },
    });

    autocomplete.setFields(["address_components", "geometry"]);

    autocomplete.addListener("place_changed", function () {
      const place = autocomplete.getPlace();
      if (place.address_components) {
        let zipCode = null;
        let state = null;

        const isState = isOnlyStateSelected(place);

        let userLatLong = {};

        if (!isState) {
          userLatLong = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
        }

        for (const component of place.address_components) {
          if (component.types.includes("postal_code")) {
            zipCode = component.short_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            state = component.short_name;
          }
        }

        if (zipCode) {
          setTimeout(() => {
            checkStateByZipCode(zipCode, inputElement.getAttribute("id"));
          }, 300);
        }

        if (isUrlHasParams) {
          tempSelectedState.state = state;
          tempSelectedState.userLatLong = userLatLong;
          tempSelectedState.stateInputText =
            zipInputMobile && zipInputMobile.offsetParent !== null
              ? zipInputMobile.value
              : zipInputPopup.value;
        } else {
          if (inputElement.getAttribute("id") == "zip-input-mobile") {
            tempSearchFilters.state = state;
            tempSearchFilters.userLatLong = userLatLong;
            tempSearchFilters.stateInputText =
              zipInputMobile && zipInputMobile.offsetParent !== null
                ? zipInputMobile.value
                : zipInputSearch.value;
          } else {
            searchFilters.state = state;
            searchFilters.userLatLong = userLatLong;
            searchFilters.stateInputText =
              zipInputMobile && zipInputMobile.offsetParent !== null
                ? zipInputMobile.value
                : zipInputSearch.value;
          }
        }

        setTimeout(() => {
          $(".location-save").removeClass("is-disable");
        }, 500);

        $(".search-location-element").removeClass("error");
      }

      var event = new Event("input", { bubbles: true });
      inputElement.dispatchEvent(event);
    });

    inputElement.addEventListener("input", function () {
      const input = this.value.trim();

      if (/^\d{5}$/.test(input)) {
        checkStateByZipCode(input, this.getAttribute("id"));
        if (isUrlHasParams) {
          tempSelectedState.stateInputText = input;
        } else {
          tempSelectedState.stateInputText = input;
        }
      }

      if (input === "") {
        const filtersContainer = document.querySelector(".new-filters");
        clearState.click();
      }
    });
  };

  applyAutocomplete(zipInputPopup);
  applyAutocomplete(zipInputMobile);
  applyAutocomplete(zipInputSearch);

  const form = document.getElementById("hero-form");
  const mobileForm = document.getElementById("location-form");

  form.addEventListener("keypress", function preventSubmit() {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  });

  mobileForm.addEventListener("keypress", function preventSubmit() {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  });

  zipInputPopup.addEventListener("input", function () {
    zipInputMobile.value = this.value;
    $(".location-save").addClass("is-disable");
  });

  zipInputMobile.addEventListener("input", function () {
    zipInputPopup.value = this.value;
    $(".location-save").addClass("is-disable");
  });

  zipInputSearch.addEventListener("input", function () {
    zipInputMobile.value = this.value;
    if (this.value == "") {
      tempSearchFilters.state = "";
      tempSearchFilters.stateInputText = "";
      tempSearchFilters.userLatLong = {};

      searchFilters.state = "";
      searchFilters.stateInputText = "";
      searchFilters.userLatLong = {};
    }
  });

  function clearStateSorting() {
    let selected = null;
    document
      .querySelectorAll(".find-dropdown.is-sort .filter-dropdown_radio")
      .forEach(function (e) {
        if (e.classList.contains("w--current")) {
          selected = e;
        }
      });

    if (selected) {
      selected.click();
    }

    sessionStorage.removeItem("stateInputText");
    updateStateParam("");
  }
}

function checkStateByZipCode(zipCode, inputId) {
  if (/^\d{5}$/.test(zipCode)) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { address: zipCode, componentRestrictions: { country: "us" } },
      function (results, status) {
        if (status === "OK" && results[0]) {
          var addressComponents = results[0].address_components;
          const userLatLong = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          };

          for (const component of addressComponents) {
            if (component.types.includes("administrative_area_level_1")) {
              const state = component.short_name;
              if (isUrlHasParams) {
                tempSelectedState.state = state;
                tempSelectedState.userLatLong = userLatLong;
                tempSelectedState.stateInputText =
                  zipInputMobile && zipInputMobile.offsetParent !== null
                    ? zipInputMobile.value
                    : zipInputPopup.value;
              } else {
                if (inputId == "zip-input-mobile") {
                  tempSearchFilters.state = state;
                  tempSearchFilters.userLatLong = userLatLong;
                  tempSearchFilters.stateInputText =
                    zipInputMobile && zipInputMobile.offsetParent !== null
                      ? zipInputMobile.value
                      : zipInputSearch.value;
                } else {
                  searchFilters.state = state;
                  searchFilters.userLatLong = userLatLong;
                  searchFilters.stateInputText =
                    zipInputMobile && zipInputMobile.offsetParent !== null
                      ? zipInputMobile.value
                      : zipInputSearch.value;
                }
              }
              $(".search-location-element").removeClass("error");
              $(".location-save").removeClass("is-disable");

              return;
            }
          }
        }
      }
    );
  }
}

$(".location-save").click(function () {
  if (isUrlHasParams) {
    if (tempSelectedState.state && tempSelectedState.state != "") {
      updateStateParam(
        tempSelectedState.state,
        tempSelectedState.userLatLong ?? null,
        tempSelectedState.stateInputText ?? null
      );
      sessionStorage.setItem(
        "stateInputText",
        JSON.stringify({
          state: tempSelectedState.state,
          stateText: tempSelectedState.stateInputText,
        })
      );
      zipInput.value = tempSelectedState.stateInputText;
      zipInputMobile.value = tempSelectedState.stateInputText;
      setTimeout(() => {
        addUtmParamsInLinks();
        appendAdsParamOnLinks();
      }, 500);
    }
  } else {
    if (tempSearchFilters.state && tempSearchFilters.state != "") {
      searchFilters = { ...searchFilters, ...tempSearchFilters };
      zipInputSearch.value = searchFilters.stateInputText;
    }
  }
  const popup1 = document.getElementById("location-popup");
  closePopup(popup1);
  const popup2 = document.getElementById("location");
  closePopup(popup2);
});

$(".clear-location").click(function () {
  zipInputPopup.value = "";
  zipInputMobile.value = "";
  tempSelectedState = {};
  tempSearchFilters = {};
  $(".location-save").addClass("is-disable");
});

$(".location-popup-close").click(function () {
  tempSelectedState = {};
  zipInputPopup.value = "";
  zipInputMobile.value = "";
  const popup1 = document.getElementById("location-popup");
  closePopup(popup1);
  const popup2 = document.getElementById("location");
  closePopup(popup2);
});

// Desktop/Mobile insurance selection
$(
  ".find-data-wr .filter-dropdown_list.is-insurance .filter_radio-button-field"
).change(function (e) {
  $(".filter-dropdown_list.is-insurance .filter_radio-button-field")
    .removeClass("is-active")
    .find(".w-radio-input")
    .removeClass("w--redirected-checked");

  $(this).addClass("is-active");

  const labelText = $(this).find(".filter_radio-label").text();
  $(".filter_tag-template.is-insurance").text(labelText).addClass("is-active");

  let value = $(this).find("input").attr("data-value");

  $(
    ".find-data-wr .filter-dropdown_list.is-insurance .filter_radio-button-field input[data-value='" +
      value +
      "']"
  )
    .prop("checked", true)
    .closest(".w-radio")
    .addClass("is-active")
    .find(".w-radio-input")
    .addClass("w--redirected-checked");

  const params = new URLSearchParams(window.location.search);
  params.set("insurance", value);
  params.delete("page");
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newUrl);
  currentPage = 1;
  const insuranceDropdown = document.querySelector(".insurance-dropdown");
  const event = new Event("w-close");
  insuranceDropdown?.dispatchEvent(event);
  closePopup($("#insurance.mobile-filter-modal")[0]);

  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => {
    fetchProviderProfiles();
  }, 500);
});

$("#clear-insurance, #mobile-clear-insurance").click(function () {
  clearInsurance();
});

function clearInsurance(refresh = true) {
  const params = new URLSearchParams(window.location.search);
  params.delete("insurance");
  if (refresh) {
    params.delete("page");
    currentPage = 1;
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }

  $(".filter_tag-template.is-insurance")
    .text("Insurance")
    .removeClass("is-active");

  $(".filter-dropdown_list.is-insurance")
    .find("input")
    .each(function () {
      $(this).prop("checked", false);
    });

  document
    .querySelectorAll(".filter_radio-button.is-insurance")
    .forEach((ele) => {
      if (ele.parentNode.classList.contains("is-active")) {
        ele.parentNode.classList.remove("is-active");
      }
    });
  $(".filter_radio-button.is-insurance").removeClass("w--redirected-checked");
  $(".w-dropdown").trigger("w-close");
  $("body").removeClass("no-scroll");

  if (refresh) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      fetchProviderProfiles();
    }, 500);
  }
}

// Desktop specialties save
$(".find-data-wr .filter-dropdown_list.is-specialties .save").click(function (
  e
) {
  e.preventDefault();
  const selectedSpecialties = [];
  $(
    '.find-data-wr .filter-dropdown_list.is-specialties .w-dyn-item input[type="checkbox"]'
  ).each((index, checkboxInput) => {
    const isChecked = $(checkboxInput).prop("checked");
    if (isChecked) {
      const specialtyText = $(checkboxInput)
        .closest(".filter_checkbox-field")
        .find(".filter_checkbox-label")
        .text()
        .trim();

      selectedSpecialties[$(checkboxInput).attr("data-value")] = specialtyText;
    }
    $(checkboxInput)
      .closest(".w-checkbox")
      .find(".w-checkbox-input")
      .toggleClass("w--redirected-checked", isChecked);

    // Mobile checkbox sync
    $('#specialty-collection .w-dyn-item input[type="checkbox"]').each(
      (index, checkboxInputMobile) => {
        const dataValue = $(checkboxInputMobile).attr("data-value");
        if (dataValue === $(checkboxInput).attr("data-value")) {
          $(checkboxInputMobile)
            .prop("checked", isChecked)
            .closest(".w-checkbox")
            .find(".w-checkbox-input")
            .toggleClass("w--redirected-checked", isChecked);
        }
      }
    );
  });

  const selectedCount = Object.keys(selectedSpecialties).length;

  $(".filter_tag-template.is-specialties").toggleClass(
    "is-active",
    selectedCount > 0
  );

  if (selectedCount > 0) {
    $(".specialties-number").text(`(${selectedCount})`);
    $(".specialties-number").show();
    $(".specialties-number")
      .closest(".mobile-filters")
      .find(".filter_tag-template")
      .addClass("is-active");
  } else {
    $(".specialties-number").hide();
  }

  const params = new URLSearchParams(window.location.search);
  const currentParams = params.getAll("specialties");

  const isSameParams =
    currentParams.length === Object.keys(selectedSpecialties).length &&
    currentParams.every((val) =>
      Object.keys(selectedSpecialties).includes(val)
    );

  if (!isSameParams) {
    // clear old specialties
    params.delete("specialties");
    Object.keys(selectedSpecialties).forEach((value) => {
      params.append("specialties", value);
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;

    window.history.replaceState({}, "", newUrl);

    currentPage = 1;
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      fetchProviderProfiles();
    }, 500);
  }
});

// Mobile specialties save
$(".find-data-wr #specialties .save").click(function (e) {
  e.preventDefault();

  const selectedSpecialties = [];
  $('#specialty-collection .w-dyn-item input[type="checkbox"]').each(
    (index, checkboxInput) => {
      const isChecked = $(checkboxInput).prop("checked");
      if (isChecked) {
        const specialtyText = $(checkboxInput)
          .closest(".filter_checkbox-field")
          .find(".filter_checkbox-label")
          .text()
          .trim();

        selectedSpecialties[$(checkboxInput).attr("data-value")] =
          specialtyText;
      }
      $(checkboxInput)
        .closest(".w-checkbox")
        .find(".w-checkbox-input")
        .toggleClass("w--redirected-checked", isChecked);

      // Desktop checkbox sync
      $(
        '.find-data-wr .filter-dropdown_list.is-specialties .w-dyn-item input[type="checkbox"]'
      ).each((index, checkboxInputDesktop) => {
        const dataValue = $(checkboxInputDesktop).attr("data-value");
        if (dataValue === $(checkboxInput).attr("data-value")) {
          $(checkboxInputDesktop)
            .prop("checked", isChecked)
            .closest(".w-checkbox")
            .find(".w-checkbox-input")
            .toggleClass("w--redirected-checked", isChecked);
        }
      });
    }
  );

  const selectedCount = Object.keys(selectedSpecialties).length;

  $(".filter_tag-template.is-specialties").toggleClass(
    "is-active",
    selectedCount > 0
  );

  if (selectedCount > 0) {
    $(".specialties-number").text(`(${selectedCount})`);
    $(".specialties-number").show();
    $(".specialties-number")
      .closest(".mobile-filters")
      .find(".filter_tag-template")
      .addClass("is-active");
  } else {
    $(".specialties-number").hide();
  }

  const params = new URLSearchParams(window.location.search);

  const currentParams = params.getAll("specialties");

  const isSameParams =
    currentParams.length === Object.keys(selectedSpecialties).length &&
    currentParams.every((val) =>
      Object.keys(selectedSpecialties).includes(val)
    );
  if (!isSameParams) {
    // clear old specialties
    params.delete("specialties");
    Object.keys(selectedSpecialties).forEach((value) => {
      params.append("specialties", value);
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;

    window.history.replaceState({}, "", newUrl);

    currentPage = 1;
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      fetchProviderProfiles();
    }, 500);
  }
  const popup = $(e.target).closest(".mobile-filter-modal");
  closePopup(popup[0]);
});

// Clear Specialties filter
function clearSpecialties(refresh = true) {
  const params = new URLSearchParams(window.location.search);
  params.delete("specialties");
  if (refresh) {
    params.delete("page");
    currentPage = 1;
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }

  $(".specialties-filter")
    .find(".filter_tag-template.is-specialties")
    .removeClass("is-active");
  $("#specialty-collection")
    .find(".filter_tag-template.is-specialties")
    .removeClass("is-active");

  $(
    ".specialties-filter .filter_checkbox-field, #specialty-collection .filter_checkbox-field"
  )
    .find("input")
    .each(function () {
      $(this).prop("checked", false);
    });

  $(".specialties-number")
    .closest(".mobile-filters")
    .find(".filter_tag-template")
    .removeClass("is-active");

  $(".specialties-filter")
    .find(".filter_checkbox.is-specialty")
    .removeClass("w--redirected-checked");

  $(".specialties-filter")
    .find("input[type='checkbox'][name='checkbox-3']")
    .prop("checked", false);

  $("#specialty-collection")
    .find(".filter_checkbox.is-specialty")
    .removeClass("w--redirected-checked");

  $("#specialty-collection")
    .find("input[type='checkbox'][name='checkbox-3']")
    .prop("checked", false);

  $(".w-dropdown").trigger("w-close");
  $("body").removeClass("no-scroll");

  $(".specialties-number").hide();
  $(".specialties-number").text("(0)");

  if (refresh) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      fetchProviderProfiles();
    }, 500);
  }
}

// MObile - Specialties popup close button click event
$(".find-data-wr #specialties .close").click(function (e) {
  // Hero Filter - Mobile specialties trigger save button click
  $(".find-data-wr #specialties .save").trigger("click");
});

// Desktop modalities save
$(".filter-dropdown_list.is-modalities .save").click(function (e) {
  e.preventDefault();
  const selectedModalities = [];
  $(
    '.find-data-wr .filter-dropdown_list.is-modalities .w-dyn-item input[type="checkbox"]'
  ).each((index, checkboxInput) => {
    const isChecked = $(checkboxInput).prop("checked");
    if (isChecked) {
      const modalityText = $(checkboxInput)
        .closest(".filter_checkbox-field")
        .find(".filter_checkbox-label")
        .text()
        .trim();

      selectedModalities[$(checkboxInput).attr("data-value")] = modalityText;
    }
    $(checkboxInput)
      .closest(".w-checkbox")
      .find(".w-checkbox-input")
      .toggleClass("w--redirected-checked", isChecked);

    // Mobile checkbox sync
    $('#modality-collection .w-dyn-item input[type="checkbox"]').each(
      (index, checkboxInputMobile) => {
        const dataValue = $(checkboxInputMobile).attr("data-value");
        if (dataValue === $(checkboxInput).attr("data-value")) {
          $(checkboxInputMobile)
            .prop("checked", isChecked)
            .closest(".w-checkbox")
            .find(".w-checkbox-input")
            .toggleClass("w--redirected-checked", isChecked);
        }
      }
    );
  });

  const selectedCount = Object.keys(selectedModalities).length;

  $(".filter_tag-template.is-modalities").toggleClass(
    "is-active",
    selectedCount > 0
  );

  if (selectedCount > 0) {
    $(".modalities-number").text(`(${selectedCount})`);
    $(".modalities-number").show();
    $(".modalities-number")
      .closest(".mobile-filters")
      .find(".filter_tag-template")
      .addClass("is-active");
  } else {
    $(".modalities-number").hide();
  }

  const params = new URLSearchParams(window.location.search);
  const currentParams = params.getAll("modalities");

  const isSameParams =
    currentParams.length === Object.keys(selectedModalities).length &&
    currentParams.every((val) => Object.keys(selectedModalities).includes(val));
  if (!isSameParams) {
    // clear old modalities
    params.delete("modalities");
    Object.keys(selectedModalities).forEach((value) => {
      params.append("modalities", value);
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;

    window.history.replaceState({}, "", newUrl);

    currentPage = 1;
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      fetchProviderProfiles();
    }, 500);
  }
});

// Mobile modalities save
$("#all .save").click(function (e) {
  e.preventDefault();
  const selectedModalities = [];
  $('#modality-collection .w-dyn-item input[type="checkbox"]').each(
    (index, checkboxInput) => {
      const isChecked = $(checkboxInput).prop("checked");
      if (isChecked) {
        const modalityText = $(checkboxInput)
          .closest(".filter_checkbox-field")
          .find(".filter_checkbox-label")
          .text()
          .trim();

        selectedModalities[$(checkboxInput).attr("data-value")] = modalityText;
      }
      $(checkboxInput)
        .closest(".w-checkbox")
        .find(".w-checkbox-input")
        .toggleClass("w--redirected-checked", isChecked);

      // Desktop checkbox sync
      $(
        '.find-data-wr .filter-dropdown_list.is-modalities .w-dyn-item input[type="checkbox"]'
      ).each((index, checkboxInputDesktop) => {
        const dataValue = $(checkboxInputDesktop).attr("data-value");
        if (dataValue === $(checkboxInput).attr("data-value")) {
          $(checkboxInputDesktop)
            .prop("checked", isChecked)
            .closest(".w-checkbox")
            .find(".w-checkbox-input")
            .toggleClass("w--redirected-checked", isChecked);
        }
      });
    }
  );

  const selectedCount = Object.keys(selectedModalities).length;

  $(".filter_tag-template.is-modalities").toggleClass(
    "is-active",
    selectedCount > 0
  );

  if (selectedCount > 0) {
    $(".modalities-number").text(`(${selectedCount})`);
    $(".modalities-number").show();
    $(".modalities-number")
      .closest(".mobile-filters")
      .find(".filter_tag-template")
      .addClass("is-active");
  } else {
    $(".modalities-number").hide();
  }

  let radius_miles = null;
  const selectedDistance = document.querySelector(
    'input[type="radio"][name="distance-mobile"]:checked'
  );
  if (selectedDistance) {
    radius_miles = selectedDistance.value;
  }

  let availability_type = null;
  const selectedAvailability = document.querySelector(
    'input[name="type"]:checked'
  );

  if (selectedAvailability) {
    availability_type = selectedAvailability.value;
  }

  let sort_order = null;
  const selectedSort = $(".filter-dropdown_list.is-sort").find(
    ".filter-dropdown_radio.is-active"
  );
  if (selectedSort.length > 0) {
    sort_order = selectedSort.text();
  }

  const params = new URLSearchParams(window.location.search);

  const currentModalitiesParams = params.getAll("modalities");
  const currentMilesParam = params.get("radius_miles");
  const currentAvailabilityParam = params.get("availability_type");
  const currentSortOrderParam = params.get("sort_order");

  const isSameModalities =
    currentModalitiesParams.length === Object.keys(selectedModalities).length &&
    currentModalitiesParams.every((val) =>
      Object.keys(selectedModalities).includes(val)
    );

  const isSameMiles = currentMilesParam == radius_miles;
  const isSameAvailability = currentAvailabilityParam == availability_type;
  const isSameSortOrder = currentSortOrderParam == sort_order;

  const isSameParams =
    isSameModalities && isSameMiles && isSameAvailability && isSameSortOrder;

  if (!isSameParams) {
    // clear old modalities
    params.delete("modalities");
    Object.keys(selectedModalities).forEach((value) => {
      params.append("modalities", value);
    });

    if (radius_miles) {
      params.set("radius_miles", radius_miles);
    }

    if (availability_type) {
      params.set("availability_type", availability_type);
    }

    if (sort_order) {
      params.set("sort_order", sort_order);
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;

    window.history.replaceState({}, "", newUrl);

    currentPage = 1;
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      fetchProviderProfiles();
    }, 500);
  }

  const popup = $(e.target).closest(".mobile-filter-modal");
  closePopup(popup[0]);
});

// Mobile modalities close
$("#all .close").click(function (e) {
  e.preventDefault();
  $("#all .save").trigger("click");
});

function clearModalities(refresh = true) {
  const params = new URLSearchParams(window.location.search);
  params.delete("modalities");
  if (refresh) {
    params.delete("page");
    currentPage = 1;
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }

  $(".modalities-filter")
    .find(".filter_tag-template.is-modalities")
    .removeClass("is-active");
  $("#modality-collection")
    .find(".filter_tag-template.is-modalities")
    .removeClass("is-active");

  $('#modality-collection .w-dyn-item input[type="checkbox"]:checked').prop(
    "checked",
    false
  );
  $("#modality-collection")
    .find(".filter_checkbox")
    .removeClass("w--redirected-checked");

  $(
    '.filter-dropdown_list.is-modalities .w-dyn-item input[type="checkbox"]:checked'
  ).prop("checked", false);

  $(".filter-dropdown_list.is-modalities .w-dyn-item")
    .find(".filter_checkbox")
    .removeClass("w--redirected-checked");

  $(".w-dropdown").trigger("w-close");
  $("body").removeClass("no-scroll");
  $(".modalities-number").hide();
  $(".modalities-number").text("");
  if (refresh) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      fetchProviderProfiles();
    }, 500);
  }
}

// Desktop/Mobile distance selection
$('input[name="distance"], input[name="distance-mobile"]').change(function () {
  const selectedDistance = $(this).val();
  $('input[name="distance"], input[name="distance-mobile"]').each(function () {
    if (selectedDistance === $(this).val()) {
      const $wrapper = $(this).closest(".w-radio");
      // $wrapper.addClass("is-checked is-active");
      $wrapper.find(".w-radio-input").addClass("w--redirected-checked");
    } else {
      const $wrapper = $(this).closest(".w-radio");
      // $wrapper.removeClass("is-checked is-active");
      $wrapper.find(".w-radio-input").removeClass("w--redirected-checked");
    }
  });
});

$(".modal-wrap .save").click(saveDistance);
$(".modal-wrap .close-modal").click(saveDistance);

function saveDistance() {
  let selectedDistance = $('input[name="distance"]:checked');
  const selectedDistanceValue = selectedDistance
    ? selectedDistance.val()
    : null;

  const params = new URLSearchParams(window.location.search);
  const currentMilesParam = params.get("radius_miles");
  const isSameMiles = currentMilesParam == selectedDistanceValue;

  if (!isSameMiles) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const selectedValue = selectedDistance.val();

    params.set("radius_miles", selectedValue);
    params.delete("page");
    currentPage = 1;
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);

    setTimeout(() => {
      fetchProviderProfiles();
    }, 500);
  }

  document.querySelector(".modal-wrap .close-modal")?.click();
}

// Clear Filters
$("#clear-modalities").click(function (e) {
  e.preventDefault();
  clearModalities();
});

$("#clear-specialties, #mobile-clear-specialties").click(function (e) {
  e.preventDefault();
  clearSpecialties();
  closePopup($("#specialties.mobile-filter-modal")[0]);
});

const clearMobileFilter = document.getElementById("mobile-clear-filters");
if (clearMobileFilter) {
  clearMobileFilter.addEventListener("click", function () {
    const params = new URLSearchParams(window.location.search);
    params.delete("sort_order");
    params.delete("modalities");
    params.delete("availability_type");
    params.delete("radius_miles");
    params.delete("page");

    currentPage = 1;

    const newUrl = `${window.location.pathname}?${params.toString()}`;

    window.history.replaceState({}, "", newUrl);
    clearSort();
    clearModalities(false);
    clearAvailabilityType();
    clearDistance();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      fetchProviderProfiles();
    }, 500);
    closePopup($("#all.mobile-filter-modal")[0]);
  });
}

const clearDrivingDistanceFilter = document.getElementById(
  "clear-more-filters-1"
);

if (clearDrivingDistanceFilter) {
  clearDrivingDistanceFilter.addEventListener("click", function () {
    const params = new URLSearchParams(window.location.search);
    params.delete("radius_miles");
    params.delete("page");

    currentPage = 1;
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
    clearDistance();
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      fetchProviderProfiles();
    }, 500);
    document.querySelector(".modal-wrap .close-modal")?.click();
  });
}

const clearAllFilter = document.getElementById("clear-trigger");
if (clearAllFilter) {
  clearAllFilter.addEventListener("click", function () {
    currentPage = 1;

    const allowedParams = shouldPersistParams;
    allowedParams.push("state", "insurance", "location_coordinates");

    const url = new URL(window.location.href);
    const params = new URLSearchParams();
    for (const param of allowedParams) {
      const value = url.searchParams.get(param);
      if (value !== null) {
        params.set(param, value);
      }
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, document.title, newUrl);

    currentPage = 1;
    clearSpecialties(false);

    clearModalities(false);
    clearAvailabilityType();
    clearSort();
    clearDistance();
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      fetchProviderProfiles();
    }, 500);
  });
}

function clearDistance() {
  $('input[name="distance"], input[name="distance-mobile"]').each(function () {
    this.checked = false;

    const $wrapper = $(this).closest(".w-radio");
    $wrapper.removeClass("is-checked is-active");
    $wrapper.find(".w-radio-input").removeClass("w--redirected-checked");
  });

  $("#distance-label").text("Distance");
}

function clearAvailabilityType() {
  const radioButtons = document.querySelectorAll(
    'input[type="radio"][name="type"], input[type="radio"][name="type-mobile"]'
  );

  radioButtons.forEach((radio) => {
    radio.checked = false;
    const wrapper = radio.closest("label");
    if (wrapper) {
      wrapper.classList.remove("is-checked", "is-active");
      const visualDiv = wrapper.querySelector(".w-radio-input");
      if (visualDiv) {
        visualDiv.classList.remove("w--redirected-checked");
      }
    }
  });

  const visitLabel = document.getElementById("visit-label");
  if (visitLabel) {
    visitLabel.textContent = "Visit type";
    visitLabel.classList.remove("is-active");
  }
}

function clearSort() {
  const sortLabel = document.querySelector(".filter_tag-template.is-sort");
  if (sortLabel) {
    sortLabel.classList.remove("is-active");
    sortLabel.textContent = "Sort";
  }

  $(".filter-dropdown_list.is-sort")
    .find(".filter-dropdown_radio")
    .removeClass("is-active");
}

Webflow.push(function () {
  $("form").submit(function () {
    return false;
  });
});

$(".save").on("click", function (evt) {
  setTimeout(() => {
    $(this).closest(".w-dropdown").trigger("w-close");
  }, 100);
});

function moveDivOnMobile() {
  const viewportWidth =
    window.innerWidth || document.documentElement.clientWidth;
  const divToMove = document.getElementById("sort");

  if (viewportWidth <= 991) {
    const newParent = document.getElementById("mobile-sort");
    newParent.appendChild(divToMove);
  } else {
    const originalParent = document.getElementById("desktop-sort");
    originalParent.appendChild(divToMove);
  }
}

function handleSortChange(value) {
  const params = new URLSearchParams(window.location.search);
  params.set("sort_order", value);
  params.delete("page");
  currentPage = 1;
  const sortLabel = document.querySelector(".filter_tag-template.is-sort");
  if (sortLabel) {
    sortLabel.textContent = value;
    sortLabel.classList.add("is-active");
  }
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newUrl);
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => {
    fetchProviderProfiles();
  }, 500);
}

function setupSortListeners() {
  $(".filter-dropdown_list.is-sort")
    .find(".filter-dropdown_radio")
    .click(function (e) {
      e.preventDefault();
      const value = this.textContent.trim();

      $(".filter-dropdown_list.is-sort .filter-dropdown_radio").removeClass(
        "is-active"
      );
      $(this).addClass("is-active");
      $(".find-dropdown.is-sort").trigger("w-close");

      const viewportWidth =
        window.innerWidth || document.documentElement.clientWidth;
      if (viewportWidth > 991) {
        handleSortChange(value);
      } else {
        const sortLabel = document.querySelector(
          ".filter_tag-template.is-sort"
        );
        if (sortLabel) {
          sortLabel.textContent = value;
          sortLabel.classList.add("is-active");
        }
      }
    });
}

moveDivOnMobile();
setupSortListeners();
window.addEventListener("resize", moveDivOnMobile);

document
  .querySelectorAll('input[name="type"], input[name="type-mobile"]')
  .forEach(function (radio) {
    radio.addEventListener("change", function (e) {
      e.preventDefault();
      const label = this.closest("label").textContent.trim();
      const value = this.value.trim();
      document.getElementById("visit-label").textContent = label;
      document.getElementById("visit-label").classList.add("is-active");

      $('input[name="type"], input[name="type-mobile"]').each(function (i, rb) {
        if ($(rb).val().trim() === value) {
          $(rb).prop("checked", true);
          $(rb)
            .closest(".filter_radio-button-field:not(.is-mobile)")
            .addClass("is-active");

          $(rb)
            .closest(".filter_radio-button-field:not(.is-mobile)")
            .find(".w-radio-input")
            .addClass("w--redirected-checked");

          $(rb)
            .closest(".filter_radio-button-field.is-mobile")
            .find(".w-radio-input")
            .addClass("w--redirected-checked");
        } else {
          $(rb).prop("checked", false);
          $(rb)
            .closest(".filter_radio-button-field")
            .removeClass("is-active")
            .find(".w-radio-input")
            .removeClass("w--redirected-checked");
        }
      });

      $(".filter-dropdown_list.is-visittype")
        .closest(".find-dropdown")
        .trigger("w-close");

      const viewportWidth =
        window.innerWidth || document.documentElement.clientWidth;
      if (viewportWidth > 991) {
        const params = new URLSearchParams(window.location.search);
        params.set("availability_type", value);
        params.delete("page");
        currentPage = 1;

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", newUrl);

        window.scrollTo({ top: 0, behavior: "smooth" });

        setTimeout(() => {
          fetchProviderProfiles();
        }, 500);
      }
    });
  });

const API_URL =
  "https://9ja7n2qnce.execute-api.us-east-1.amazonaws.com/prod/fay-api/provider-profiles";

function getFiltersFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const filters = {};

  const insurance = urlParams.getAll("insurance");
  if (insurance.length > 0) filters.insurance = insurance;

  const locationUSState = urlParams.get("state");
  if (locationUSState) {
    filters.state = locationUSState;
    const locationCoordinates = urlParams.get("location_coordinates");
    if (locationCoordinates) filters.location_coordinates = locationCoordinates;
  }

  const specialties = urlParams
    .getAll("specialties")
    .map((s) => s.toLowerCase());
  if (specialties.length > 0) filters.specialties = specialties;

  const modalities = urlParams.getAll("modalities").map((m) => m.toLowerCase());
  if (modalities.length > 0) filters.modalities = modalities;

  const availabilityType = urlParams
    .getAll("availability_type")
    .map((m) => m.toLowerCase());
  if (availabilityType.length > 0) filters.availabilityType = availabilityType;

  const sortOrder = urlParams.getAll("sort_order").map((m) => m.toLowerCase());
  if (sortOrder.length > 0) filters.sortOrder = sortOrder;

  const radiusMiles = urlParams.get("radius_miles");
  if (radiusMiles) filters.radiusMiles = radiusMiles;

  return filters;
}

async function fetchProviderProfiles() {
  try {
    const container = document.getElementById("dietitian-items-container");
    container.innerHTML = "";
    const paginationWrapper = document.querySelector(".pagination_buttons");

    if (paginationWrapper) {
      paginationWrapper.classList.add("hide");
    }
    const loader = document.querySelector(".find-preloader");
    const dieitianCount = document.querySelector(".dieitian-count");
    const emptyState = document.querySelector(".empty-state_wrap");

    dieitianCount.style.opacity = "0";
    if (emptyState && loader) {
      emptyState.style.display = "flex";
      [...emptyState.children].forEach((child) => {
        if (child === loader) {
          child.style.display = "flex";
        } else {
          child.style.opacity = "0";
        }
      });
    }

    const filters = getFiltersFromURL();
    const params = new URLSearchParams();

    if (filters.insurance && filters.insurance != "") {
      params.set("insurance", filters.insurance);
    }

    if (filters.state) {
      params.append("location_us_state", filters.state);
      params.append("supported_us_states", filters.state);
      if (filters.location_coordinates)
        params.append("location_coordinates", filters.location_coordinates);
    }
    if (filters.radiusMiles) params.append("radius_miles", filters.radiusMiles);
    if (filters.specialties)
      filters.specialties.forEach((s) => params.append("specialties", s));
    if (filters.modalities)
      filters.modalities.forEach((m) => params.append("modalities", m));

    const availabilityMap = {
      "in-person": ["in_person"],
      "video-only": ["virtual"],
      "video-in-person": ["in_person", "virtual"],
    };
    if (filters.availabilityType) {
      filters.availabilityType.forEach((type) => {
        const values = availabilityMap[type];
        if (values)
          values.forEach((v) => params.append("availability_type", v));
      });
    }

    const sortOrderMap = {
      recommended: "ranking",
      availability: "availability",
      "best health outcomes": "outcomes",
    };
    if (filters.sortOrder) {
      filters.sortOrder.forEach((order) => {
        const value = sortOrderMap[order];
        if (value) params.append("sort_order", value);
      });
    }

    params.append("page", currentPage);
    params.append("limit", 10);

    const urlParams = new URLSearchParams(window.location.search);
    const fayTestProviderHint = urlParams.get("FayTestProviderHint");

    let headers = {};
    if (fayTestProviderHint && fayTestProviderHint == "true") {
      headers["Fay-Test-Provider-Hint"] =
        "lauren+test-provider@faynutrition.com";
    }

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers,
    });
    if (response.status === 422) {
      if (emptyState) emptyState.style.display = "block";
      if (loader) loader.style.display = "none";
      const sectionListTopElements = document.querySelector(
        ".section_list_top .count-text"
      );
      sectionListTopElements.classList.add("hide");

      [...emptyState.children].forEach((child) => {
        if (child === loader) {
          child.style.display = "none";
        } else {
          child.style.opacity = "1";
        }
      });
      return;
    }

    if (response.ok) {
      const data = await response.json();

      if (data.items.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        if (loader) loader.style.display = "none";
        const sectionListTopElements = document.querySelector(
          ".section_list_top .count-text"
        );
        sectionListTopElements.classList.add("hide");

        [...emptyState.children].forEach((child) => {
          if (child === loader) {
            child.style.display = "none";
          } else {
            child.style.opacity = "1";
          }
        });

        loadRatings();
        return;
      }

      renderProviderProfiles(data);
    }
  } catch (error) {}
}

function renderProviderProfiles(data) {
  const container = document.getElementById("dietitian-items-container");
  const template = document.querySelector(".dietitian-item.is-clone");

  if (!container || !template) {
    return;
  }
  container.innerHTML = "";

  const deviceType = getDeviceType();

  if (deviceType === "PHONE" || deviceType === "TABLET") {
    $("dietitian-item.is-clone .book-now-btn").removeAttr("target");
    $("dietitian-item.is-clone .provider-profile-link").removeAttr("target");
    $("dietitian-item.is-clone .card-reviews-rating").removeAttr("target");
  }

  const urlParams = new URLSearchParams(window.location.search);

  data.items.forEach(async (provider) => {
    const card = template.cloneNode(true);
    card.classList.remove("is-clone");
    card.querySelector(".jetboost-list-item").value = provider.slug;
    card.querySelector(".h3").textContent = provider.full_name_and_credentials;
    $(card).attr("id", provider.provider_id);
    const image = card.querySelector(".dietitian_img");
    if (image) {
      image.removeAttribute("srcset");
      image.src = provider.photo_url;
      image.alt = provider.full_name_and_credentials;
    }

    card
      .querySelectorAll(".available-now-tag")
      .forEach((el) => el.classList.toggle("hide", !provider.is_available_now));

    const ins = card.querySelector(".insurance-text");

    const filters = getFiltersFromURL();
    if (provider.insurance_accepted) {
      if (filters.insurance !== undefined && filters.insurance != "") {
        let insMatch = false;
        provider.insurance_accepted.forEach((insurance) => {
          if (filters.insurance.includes(insurance.slug)) {
            ins.textContent = "Accepts " + insurance.name;
            insMatch = true;
          }
        });

        if (!insMatch) {
          let insuAray = [];
          provider.insurance_accepted.forEach((insurance) => {
            insuAray.push(insurance.name);
          });
          card.querySelector(".is-rd-checkmark").remove();
          ins.textContent = insuAray.join(", ");
        }
      } else {
        let insuAray = [];
        provider.insurance_accepted.forEach((insurance) => {
          insuAray.push(insurance.name);
        });
        card.querySelector(".is-rd-checkmark").remove();
        ins.textContent = insuAray.join(", ");
      }
    }

    const selectedSpecialties = urlParams.getAll("specialties") ?? [];
    const spTagContainer = card.querySelector(".sp-tags");
    const spTagClone = card.querySelector(".sp-tags .sp-tag:first-child");

    // const isMobile = deviceType === "PHONE";
    const isMobile = window.innerWidth <= 767;
    let visibleLimit = isMobile ? 3 : 6;

    // Separate selected and unselected specialties
    const selectedList = provider.specialties.filter((s) =>
      selectedSpecialties.includes(s.slug)
    );
    const unselectedList = provider.specialties.filter(
      (s) => !selectedSpecialties.includes(s.slug)
    );

    visibleLimit = Math.max(visibleLimit, selectedSpecialties.length);

    // Merge them: selected first, then others
    const orderedSpecialties = [...selectedList, ...unselectedList];

    for (let i = 0; i < provider.specialties.length; i++) {
      const specialty = orderedSpecialties[i];
      const spTag = spTagClone.cloneNode(true);
      spTag.querySelector(".sp-tag-text").textContent = specialty.name;
      if (selectedSpecialties.includes(specialty.slug)) {
        spTag.querySelector(".selected-icon").classList.remove("hide");
      }
      if (i < Math.min(visibleLimit, provider.specialties.length)) {
        spTag.classList.remove("hide");
      }

      spTagContainer.appendChild(spTag);
    }
    spTagContainer
      .querySelectorAll(".is-last-tag")
      .forEach((el) => el.remove());

    let remaining =
      orderedSpecialties.length -
      Math.min(visibleLimit, provider.specialties.length);
    if (remaining > 0) {
      const visibleLimitMobile = Math.max(3, selectedSpecialties.length);

      const moreTag = spTagClone.cloneNode(true);
      moreTag.querySelector(".sp-tag-text").textContent = `+${
        orderedSpecialties.length - visibleLimitMobile
      } more`;
      moreTag.querySelector(".selected-icon").classList.add("hide");
      moreTag.classList.add("is-last-tag", "is-mobile");

      if (isMobile) {
        moreTag.classList.remove("hide");
      } else {
        moreTag.classList.add("hide");
      }

      spTagContainer.appendChild(moreTag);

      const visibleLimitDesktop = Math.max(6, selectedSpecialties.length);
      const moreTag1 = spTagClone.cloneNode(true);
      moreTag1.querySelector(".sp-tag-text").textContent = `+${
        orderedSpecialties.length - visibleLimitDesktop
      } more`;
      moreTag1.querySelector(".selected-icon").classList.add("hide");
      moreTag1.classList.add("is-last-tag", "is-desktop");

      if (!isMobile) {
        moreTag1.classList.remove("hide");
      } else {
        moreTag1.classList.add("hide");
      }

      spTagContainer.appendChild(moreTag1);
    }

    spTagClone.remove();

    /* const spec = card.querySelector(".specialties-text");
    if (spec && provider.specialties) {
      spec.textContent = provider.specialties.map((s) => s.name).join(", ");
    } */

    const availability = provider.availability_types || [];
    if (!availability.includes("virtual")) {
      $(card).find(".visit-type-video")?.remove();
    }
    if (!availability.includes("in_person")) {
      $(card).find(".visit-type-inperson")?.remove();
    }

    const visitsWrap = card.querySelector(".dietitian_visits-wrap");
    if (visitsWrap) {
      const outerVisitBlock = visitsWrap.querySelector(".dietitian_visit");
      const innerVisitBlock =
        outerVisitBlock?.querySelector(".dietitian_visit");
      const availability = provider.availability_types || [];

      if (!availability.includes("virtual")) {
        outerVisitBlock?.remove();
      } else if (!availability.includes("in_person") && innerVisitBlock) {
        innerVisitBlock.remove();
      }
    }

    $(card).find(".provider-title").text(provider.full_name_and_credentials);
    $(card).find(".background-text").html(provider.approach);

    const insurance = urlParams.get("insurance");
    const specialties = urlParams.getAll("specialties");

    const profile_url = new URL(provider.profile_url, window.location.origin);
    const booking_url = new URL(
      `https://signup.faynutrition.com/book-with/${provider.provider_id}`,
      window.location.origin
    );

    if (insurance != null && insurance != "") {
      booking_url.searchParams.set("insurance", insurance);
      profile_url.searchParams.set("insurance", insurance);
    }

    if (specialties != null && specialties.length > 0) {
      specialties.forEach((sp) => {
        profile_url.searchParams.append("specialties", sp);
        booking_url.searchParams.append("specialties", sp);
      });
    }

    if (deviceType === "PHONE" || deviceType === "TABLET") {
      $(card).find(".book-now-btn").removeAttr("target");
      $(card).find(".provider-profile-link").removeAttr("target");
      $(card).find(".card-reviews-rating").removeAttr("target");
    }

    $(card).find(".book-now-btn").attr("href", booking_url.toString());
    $(card).find(".provider-profile-link").attr("href", profile_url.toString());
    $(card)
      .find(".card-reviews-rating")
      .attr("href", profile_url.toString() + "#reviews");

    card.style.display = "block";
    container.appendChild(card);

    getAvailabilitySlots(provider.provider_id).then(function (response) {
      let element = $("#" + response.provider_id);
      element
        .find(".rd-card_dates-wr .rd-card_date-link:not(.is-clone)")
        .remove();

      response.slots.slice(0, 7).forEach((slot) => {
        const dateClone = element
          .find(".rd-card_dates-wr .rd-card_date-link.is-clone")
          .clone(true);
        dateClone.removeClass("is-clone hide");
        dateClone.attr("data-provider-id", response.provider_id);
        dateClone.attr("data-date", slot.date);
        dateClone.find(".rd-card_date-text").text(slot.dateLabel);
        dateClone
          .find(".rd-card_date-amount")
          .text(
            slot.numberOfSlots + (slot.numberOfSlots > 1 ? " appts" : " appt")
          );
        element.find(".rd-card_dates-wr").append(dateClone);
      });

      element.find(".rd-card-av-pc").remove();

      if (response.slots.length > 0) {
        element.find(".rd-card_dates-wr").removeClass("hide");
      } else {
        element.find(".rd-card_dates-wr").addClass("hide");
      }
    });
  });

  setTimeout(function () {
    const countElement = document.querySelector(
      ".section_list_top .count-text"
    );
    if (countElement) {
      countElement.querySelector("span").textContent =
        data.total.toLocaleString("en-US");
      if (zipInput.value != "") {
        $(".count-state-pretext").show();
        countElement.querySelector(".count-state-text").textContent =
          "" + zipInput.value;
      } else {
        $(".count-state-pretext").hide();
        countElement.querySelector(".count-state-text").textContent = "";
      }

      countElement.classList.remove("hide");
    }

    updatePagination(data.total, data.next_page, data.previous_page ?? 0);
    document.querySelector(".dieitian-count").style.opacity = "1";

    loadRatings();
  }, 500);

  setTimeout(function () {
    checkBackgroundText();
    addUtmParamsInLinks();
    appendAdsParamOnLinks();

    const emptystate_wrap = document.querySelector(".empty-state_wrap");
    const loader = document.querySelector(".find-preloader");
    const emptyState = document.querySelector(".empty-state_wrap");
    if (emptystate_wrap) emptystate_wrap.style.display = "none";
    if (loader) loader.style.display = "none";
    if (emptyState) emptyState.style.display = "none";
    container.classList.remove("no-visibility");
  }, 500);
}

function updateVisibleTags() {
  const isMobile = window.innerWidth <= 767;
  let visibleLimit = isMobile ? 3 : 6;
  const urlParams = new URLSearchParams(window.location.search);
  const selectedSpecialties = urlParams.getAll("specialties") ?? [];

  visibleLimit = Math.max(visibleLimit, selectedSpecialties.length);

  document
    .querySelectorAll(".dietitian-item:not(.is-clone)")
    .forEach((item) => {
      const spTags = item.querySelectorAll(
        ".sp-tags .sp-tag:not(.is-last-tag)"
      );

      spTags.forEach((tag, index) => {
        tag.classList.toggle("hide", index >= visibleLimit);
      });

      const mobileELement = item.querySelector(
        ".sp-tags .sp-tag.is-last-tag.is-mobile"
      );
      const desktopELement = item.querySelector(
        ".sp-tags .sp-tag.is-last-tag.is-desktop"
      );
      if (isMobile) {
        mobileELement?.classList.remove("hide");
        desktopELement?.classList.add("hide");
      } else {
        mobileELement?.classList.add("hide");
        desktopELement?.classList.remove("hide");
      }
    });
}

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(updateVisibleTags, 200);
});

function checkBackgroundText() {
  $(".rd-approach-text").each((index, element) => {
    const $description = $(element);
    const $toggleBtn = $(element)
      .closest(".dietitian-item")
      .find(".background-view-more");
    const lineHeight = parseFloat($description.css("line-height"));
    const maxHeight = lineHeight * 3;

    // specialties
    const $title = $(element).closest(".dietitian-item").find("h2").text();
    /* const $specialtiesText = $(element)
      .closest(".dietitian-item")
      .find(".specialties-element")[0]; */

    let isShow = !($description[0].scrollHeight <= maxHeight + 1);

    if (window.innerWidth <= 767) {
      isShow = !($description[0].scrollHeight <= maxHeight + 1);
    }

    if (isShow) {
      $toggleBtn.show();
    } else {
      $toggleBtn.hide();
    }
  });
}

window.addEventListener("resize", checkBackgroundText);

$(document).on("click", ".background-text", function () {
  const viewMoreElement = $(this)
    .closest(".dietitian-item")
    .find(".background-view-more");

  if (viewMoreElement.text() == "View more") {
    viewMoreElement
      .closest(".dietitian_card")
      .find(".background-text")
      .removeClass("is-close");
    viewMoreElement.text("View less");
    /*  if (window.innerWidth <= 767) {
      viewMoreElement
        .closest(".dietitian_card")
        .find(".specialties-element")
        .removeClass("is-close");
    } */
  } else {
    viewMoreElement
      .closest(".dietitian_card")
      .find(".background-text")
      .addClass("is-close");

    /* if (window.innerWidth <= 767) {
      viewMoreElement
        .closest(".dietitian_card")
        .find(".specialties-element")
        .addClass("is-close");
    } */
    viewMoreElement.text("View more");
  }
});

/* $(document).on("click", ".specialties-element", function () {
  if (window.innerWidth <= 767) {
    const viewMoreElement = $(this)
      .closest(".dietitian-item")
      .find(".background-view-more");

    if (viewMoreElement.text() == "View more") {
      viewMoreElement
        .closest(".dietitian_card")
        .find(".background-text")
        .removeClass("is-close");
      viewMoreElement.text("View less");

      viewMoreElement
        .closest(".dietitian_card")
        .find(".specialties-element")
        .removeClass("is-close");
    } else {
      viewMoreElement
        .closest(".dietitian_card")
        .find(".background-text")
        .addClass("is-close");

      viewMoreElement
        .closest(".dietitian_card")
        .find(".specialties-element")
        .addClass("is-close");

      viewMoreElement.text("View more");
    }
  }
}); */

$(document).on("click", ".background-view-more", function () {
  if ($(this).text() == "View more") {
    $(this)
      .closest(".dietitian_card")
      .find(".background-text")
      .removeClass("is-close");
    $(this).text("View less");
    /* if (window.innerWidth <= 767) {
      $(this)
        .closest(".dietitian_card")
        .find(".specialties-element")
        .removeClass("is-close");
    } */
  } else {
    $(this)
      .closest(".dietitian_card")
      .find(".background-text")
      .addClass("is-close");

    /* if (window.innerWidth <= 767) {
      $(this)
        .closest(".dietitian_card")
        .find(".specialties-element")
        .addClass("is-close");
    } */
    $(this).text("View more");
  }
});

$(document).on("click", ".rd-card_date-link", function () {
  const providerId = $(this).attr("data-provider-id");
  const providerTitle = $(this)
    .closest(".dietitian-item")
    .find(".provider-title")
    .text();
  let formattedDate = "";
  if ($(this).attr("data-date")) {
    formattedDate = $(this).attr("data-date");
  }

  const urlParams = new URLSearchParams(window.location.search);
  const insurance = urlParams.get("insurance");
  const specialties = urlParams.getAll("specialties");
  const params = new URLSearchParams();

  iframeParams = {
    type: "loadAvailabilityForProvider",
    providerId: providerId,
  };

  if (insurance != null && insurance != "") {
    iframeParams.insurance = insurance;
  }
  if (specialties != null && specialties.length > 0) {
    iframeParams.specialties = specialties;
  }

  if (formattedDate) {
    iframeParams.focusDate = formattedDate;
  }

  if (customerId && sessionId) {
    iframeParams.customerId = customerId;
    iframeParams.sessionId = sessionId;
  }
  if (referralToken) {
    iframeParams.referralToken = referralToken;
  }
  if (withingsToken) {
    iframeParams.withingsToken = withingsToken;
  }
  if (has_withings_plus) {
    iframeParams.has_withings_plus = has_withings_plus;
  }
  if (FayBookingCode) {
    iframeParams.FayBookingCode = FayBookingCode;
  }

  if (isAds == true || isAds == "true") {
    iframeParams.ads = "true";
  }

  for (const param of shouldPersistParams) {
    const storedVal = localStorage.getItem(param);
    if (storedVal) {
      iframeParams[param] = storedVal;
    }
  }

  const iframe = document.getElementById("availability-iframe");
  iframe.setAttribute("params", params.toString());

  iframe.contentWindow.postMessage(
    iframeParams,
    "https://signup.faynutrition.com"
  );
  nav.style.top = "-4.5rem";
  $("#rd-popup").addClass("is-visible");
  document.body.style.overflow = "hidden";
});

window.addEventListener("message", function (event) {
  if (
    event.origin !== "https://signup.faynutrition.com" &&
    event.origin !== "https://provider.faynutrition.com"
  )
    return;
  const { source, type, status } = event.data;

  if (
    source === "availability-app" &&
    type === "availabilityAppStatusChange" &&
    status === "ready"
  ) {
  } else if (
    event.data.source === "availability-app" &&
    event.data.type === "slotConfirmed"
  ) {
    const urlParams = new URLSearchParams(window.location.search);
    const insurance = urlParams.get("insurance");
    const specialties = urlParams.getAll("specialties");

    const { providerId, start, availabilityType } = event.data;

    const url = new URL(
      `https://signup.faynutrition.com/book-with/${providerId}`,
      window.location.origin
    );
    // url.searchParams.set("dietitian_id", providerId);
    url.searchParams.set("slot_start", start);
    url.searchParams.set("slot_availability_type", availabilityType);

    if (insurance != null && insurance != "") {
      url.searchParams.set("insurance", insurance);
    }

    if (specialties != null && specialties.length > 0) {
      specialties.forEach((sp) => {
        url.searchParams.append("specialties", sp);
      });
    }

    if (isAds == true || isAds == "true") {
      url.searchParams.set("ads", "true");
    }

    if (customerId && sessionId) {
      url.searchParams.set("customerId", customerId);
      url.searchParams.set("sessionId", sessionId);
    }
    if (referralToken) {
      url.searchParams.set("referralToken", referralToken);
    }
    if (withingsToken) {
      url.searchParams.set("withingsToken", withingsToken);
    }
    if (has_withings_plus) {
      url.searchParams.set("has_withings_plus", has_withings_plus);
    }
    if (FayBookingCode) {
      url.searchParams.set("FayBookingCode", FayBookingCode);
    }

    for (const param of shouldPersistParams) {
      const storedVal = localStorage.getItem(param);
      if (storedVal) {
        url.searchParams.set(param, storedVal);
      }
    }

    const deviceType = getDeviceType();

    if (deviceType === "PHONE" || deviceType === "TABLET") {
      window.open(url.toString(), "_self");
    } else {
      window.open(url.toString(), "_blank");
    }
  }
});

$(document).on("click", ".appointment-popup-close", function () {
  $("#rd-popup").removeClass("is-visible");

  const iframe = document.getElementById("availability-iframe");
  iframe.contentWindow.postMessage(
    {
      type: "loadAvailabilityForProvider",
    },
    "https://signup.faynutrition.com"
  );

  document.body.style.overflow = "";
  nav.style.top = "0rem";
});

function getISOWithTimezone(date) {
  const pad = (n) => String(n).padStart(2, "0");

  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
  const offsetMins = Math.abs(offsetMinutes) % 60;
  const timezoneOffset = `${sign}${pad(offsetHours)}:${pad(offsetMins)}`;

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}` +
    `${timezoneOffset}`
  );
}

const formatDate = (slotDate) => {
  const year = slotDate.getFullYear();
  const month = String(slotDate.getMonth() + 1).padStart(2, "0");
  const day = String(slotDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function formatDateLabel(dateString) {
  const slotDate = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const slotDay = new Date(
    slotDate.getFullYear(),
    slotDate.getMonth(),
    slotDate.getDate()
  );
  const slot = formatDate(slotDay);

  if (slotDay.getTime() === today.getTime()) return { slot, dateStr: "Today" };

  if (slotDay.getTime() === tomorrow.getTime())
    return { slot, dateStr: "Tomorrow" };

  const options = { month: "short", day: "numeric" };

  return { slot, dateStr: slotDate.toLocaleDateString("en-US", options) };
}

async function getRating(provider_id, gateOn) {
  try {
    const response = await fetch(
      `https://9ja7n2qnce.execute-api.us-east-1.amazonaws.com/prod/fay-api/providers/${provider_id}/public-rating`
    );

    if (response.status === 200) {
      const data = await response.json();
      if (
        gateOn &&
        data.rating !== undefined &&
        data.rating.average !== undefined
      ) {
        let element = $("#" + provider_id);
        const reviewEle = element.find(".card-reviews-rating");

        if (data.rating.average > 0) {
          reviewEle.find(".cr-r-rating").text(data.rating.average);
          reviewEle
            .find(".cr-r-amount .cr-r-amount-underline")
            .text(data.rating.total_submissions);
          setRating(data.rating.average, provider_id);
          reviewEle.removeClass("hide");
        } else {
          reviewEle.remove();
        }
      }

      return data;
    }
  } catch (error) {
    console.log("error", error);
    return {};
  }
}

function setRating(rating, provider_id) {
  rating = parseFloat(rating);
  let element = $("#" + provider_id);
  const reviewEle = element.find(".card-reviews-rating:not(.is-mobile)");
  const reviewEleMobile = element.find(".card-reviews-rating.is-mobile");
  reviewEle.find(".rd-r-stars-wr .rd-r-star").each(function (index) {
    let starIndex = index + 1;
    let fillPercent = 0;

    if (rating >= starIndex) {
      fillPercent = 100;
    } else if (rating > starIndex - 1) {
      const decimal = rating % 1;
      fillPercent = Math.round(decimal * 100);
    }

    $(this)
      .find(".star-fill-rect")
      .attr("width", fillPercent + "%");
    $(this)
      .find(".star-fill-rect")
      .attr("clip-path", `url(#starClip-${provider_id}-desktop)`);
    $(this)
      .find(".star-fill-rect")
      .closest("svg")
      .find("clipPath")
      .attr("id", `starClip-${provider_id}-desktop`);

    reviewEleMobile
      .find(".rd-r-stars-wr .rd-r-star")
      .eq(index)
      .find(".star-fill-rect")
      .attr("width", fillPercent + "%");
    reviewEleMobile
      .find(".rd-r-stars-wr .rd-r-star")
      .eq(index)
      .find(".star-fill-rect")
      .attr("clip-path", `url(#starClip-${provider_id}-mobile)`);
    reviewEleMobile
      .find(".rd-r-stars-wr .rd-r-star")
      .eq(index)
      .find(".star-fill-rect")
      .closest("svg")
      .find("clipPath")
      .attr("id", `starClip-${provider_id}-mobile`);
  });
}

async function getAvailabilitySlots(provider_id) {
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

    if (pcrit) {
      params.append("pcrit", pcrit);
    }

    const AVAILABILITY_SLOTS_API_URL = `https://platform.faynutrition.com/providers/${provider_id}/availability-slots`;

    const response = await fetch(
      `${AVAILABILITY_SLOTS_API_URL}?${params.toString()}`
    );

    if (response.status === 200) {
      const data = await response.json();
      const dateSlotMap = {};

      data.available_slots.forEach((slot) => {
        const startTime = slot.window.start;
        const dateLabel = formatDateLabel(startTime);

        if (!dateSlotMap[dateLabel.dateStr]) {
          dateSlotMap[dateLabel.dateStr] = {};
        }

        dateSlotMap[dateLabel.dateStr]["date"] = dateLabel.slot;
        dateSlotMap[dateLabel.dateStr]["dateLabel"] = dateLabel.dateStr;
        dateSlotMap[dateLabel.dateStr]["numberOfSlots"] =
          (dateSlotMap[dateLabel.dateStr]["numberOfSlots"] || 0) + 1;
      });
      return { provider_id: provider_id, slots: Object.values(dateSlotMap) };
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}

function updatePagination(total, next_page, previous_page) {
  const prevBtn = document.getElementById("pagination-prev");
  const nextBtn = document.getElementById("pagination-next");
  const paginationWrapper = document.querySelector(".pagination_buttons");
  const totalPages = Math.ceil(total / 10);
  if (prevBtn) {
    if (currentPage === 1) {
      prevBtn.classList.add("hide");
    } else {
      prevBtn.classList.remove("hide");
    }
  }

  if (nextBtn) {
    if (currentPage < totalPages) {
      nextBtn.classList.remove("hide");
    } else {
      nextBtn.classList.add("hide");
    }
  }

  if (paginationWrapper) {
    paginationWrapper.classList.remove("hide");
  }
  prevBtn.href = "?page=" + previous_page;
  nextBtn.href = "?page=" + next_page;
}

function checkIsFilterOrResult() {
  const urlParams = new URLSearchParams(window.location.search);
  let allUrlParams = {};
  for (const [key, value] of urlParams.entries()) {
    allUrlParams[key] = value;
  }

  const state = allUrlParams?.state ?? undefined;
  const insurance = allUrlParams?.insurance ?? undefined;

  if (
    (state === "" && insurance === undefined) ||
    (state !== undefined && insurance !== undefined && state !== "")
  ) {
    isUrlHasParams = true;
  } else {
    isUrlHasParams = false;
  }

  return isUrlHasParams;
}

let isInternalNavigation = false;
document.addEventListener("DOMContentLoaded", () => {
  $("#loading-div").addClass("hide");
  window.addEventListener("popstate", function (event) {
    const params = new URLSearchParams(window.location.search);
    currentPage = parseInt(params.get("page") || "1");

    applyPreselectedValues();
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(function () {
        fetchProviderProfiles();
      }, 500);
    }, 300);
  });

  const nextBtn = document.getElementById("pagination-next");
  const prevBtn = document.getElementById("pagination-prev");

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      currentPage += 1;
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", currentPage);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({ page: currentPage }, "", newUrl);
        fetchProviderProfiles();
      }, 500);
      return false;
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage > 0) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        currentPage--;

        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          params.set("page", currentPage);
          const newUrl = `${window.location.pathname}?${params.toString()}`;
          window.history.pushState({ page: currentPage }, "", newUrl);
          fetchProviderProfiles();
        }, 500);

        return false;
      }
    });
  }

  applyPreselectedValues();
  checkIsFilterOrResult();

  if (isUrlHasParams) {
    $(".find-w-params-wr").addClass("hide");
    $(".find-data-wr").removeClass("hide");
    $("#review-section").addClass("hide");
    fetchProviderProfiles();
  } else {
    $(".find-w-params-wr").removeClass("hide");
    $("#review-section").removeClass("hide");
    $(".find-data-wr").addClass("hide");
    initSearchElement();
  }
});

function initSearchElement() {
  setTimeout(() => {
    preFillSearchAfterBack();
  }, 10);

  // Fires when a page is loaded or restored from the session history
  window.addEventListener("pageshow", function (event) {
    $("#loading-div").addClass("hide");
    const urlParams = new URLSearchParams(window.location.search);
    let allUrlParams = {};
    for (const [key, value] of urlParams.entries()) {
      allUrlParams[key] = value;
    }

    const isResultForm = checkIsFilterOrResult();

    if (!isResultForm) {
      // if (event.persisted) {
      /*  if (sessionStorage.getItem("form-reset-on-restore")) {
        document.querySelector("#email-form.hero-form")?.reset();
        searchFilters = {};
        sessionStorage.removeItem("form-reset-on-restore");
        sessionStorage.removeItem("navigated");
        sessionStorage.removeItem("preSearchValue");
      } */
      const navigated = sessionStorage.getItem("navigated");

      if (navigated) {
        setTimeout(() => {
          preFillSearchAfterBack();
        }, 10);
      } else {
        document.querySelector("#email-form.hero-form")?.reset();
        $(
          "#insurance-dropdown .insurance-wrapper .filter-item-radio, #search-insurance .filter-dropdown_list .filter_radio-button-field"
        ).each((index, element) => {
          const input = $(element).find('input[type="radio"]');

          $("#search-insurance-label")
            .text("Insurance*")
            .removeClass("is-active");
          $(input).prop("checked", false);
          $(element)
            .find(".w-form-formradioinput")
            .removeClass("w--redirected-checked");

          $(element).removeClass("is-active");
        });

        $("#search-specialties-label")
          .text("Specialties")
          .removeClass("is-active");

        // sessionStorage.removeItem("navigated");
        // sessionStorage.removeItem("preSearchValue");

        setTimeout(() => {
          preFillSearchAfterBack();
        }, 10);
      }
    } else {
      preFillSearchAfterBack();
    }
  });

let userLocation = {};

async function getUserLocation() {
  try {
    const response = await fetch(
      `https://marketing-site.cdn.faynutrition.com/_geo`
    );

    const data = await response.json();
    if(data?.country?.toLowerCase() == "us") {
      userLocation = {
        "userLatLong": { lat: data.latitude, lng: data.longitude },
        "state": data.state,
        "location": data.stateName
      }

      try {
        const filterValue = JSON.parse(sessionStorage.getItem("preSearchValue"));

        const urlParams1 = new URLSearchParams(window.location.search);

        if (urlParams1.has("state") && urlParams1.get("state") != null) {
          filterValue.state = urlParams1.get("state");
        }

        if (filterValue?.state) {
    
        } else {
          zipInputSearch.value = userLocation?.location;
          zipInputMobile.value = userLocation?.location;

          searchFilters.stateInputText = userLocation?.location;
          searchFilters.state = userLocation?.state;
          searchFilters.userLatLong = userLocation?.userLatLong;
        }
      } catch (error) {
        
      }
    
      
    }
  } catch (error) {
    userLocation = {}
  }
}

(async () => {
    getUserLocation();
})();

  function preFillSearchAfterBack() {
    $("#loading-div").addClass("hide");

    try {
      let preSearchValue = {};
      try {
        preSearchValue = JSON.parse(
          sessionStorage.getItem("preSearchValue") || {}
        );
      } catch (error) {
        preSearchValue = {};
      }

      const urlParams1 = new URLSearchParams(window.location.search);

      if (urlParams1.has("state") && urlParams1.get("state") != null) {
        preSearchValue.state = urlParams1.get("state");
        preSearchValue.stateInputText = "";
        preSearchValue.userLatLong = {};
      }

      if (urlParams1.has("insurance") && urlParams1.get("insurance") != null) {
        preSearchValue.insurance = urlParams1.get("insurance");
      }

      if (
        preSearchValue?.specialties == undefined &&
        urlParams1.has("specialties") &&
        urlParams1.getAll("specialties") != null &&
        urlParams1.getAll("specialties").length > 0
      ) {
        preSearchValue.specialties = urlParams1.getAll("specialties");
      }

      if (preSearchValue?.state) {
        if (
          preSearchValue?.stateInputText !== undefined &&
          preSearchValue?.stateInputText != ""
        ) {
          zipInputSearch.value = preSearchValue.stateInputText;
          zipInputMobile.value = preSearchValue.stateInputText;
        } else {
          let stateCodeMatched = false;
          $(".dropdown-list .count-state").each(function () {
            if ($(this).attr("state-name") == preSearchValue?.state) {
              const stateName = $(this).find(".checkbox-label").text();
              preSearchValue.stateInputText = stateName;
              zipInputSearch.value = stateName;
              zipInputMobile.value = stateName;
              stateCodeMatched = true;
            }
          });
          if (!stateCodeMatched) {
            preSearchValue.state = "";
          }
        }
      } else if(userLocation && userLocation?.location) {
        zipInputSearch.value = userLocation?.location;
        zipInputMobile.value = userLocation?.location;
        preSearchValue.stateInputText = userLocation?.location;
        preSearchValue.state = userLocation?.state;
        preSearchValue.userLatLong = userLocation?.userLatLong;
      }

      if (preSearchValue?.insurance) {
        let isInsuMatched = false;
        $(
          "#insurance-dropdown .insurance-wrapper .filter-item-radio, #search-insurance .filter-dropdown_list .filter_radio-button-field"
        ).each((index, element) => {
          const input = $(element).find('input[type="radio"]');
          const dataValue = input.attr("data-value");

          if (dataValue === preSearchValue.insurance) {
            $("#search-insurance-label")
              .text($(element).find(".w-form-label").text())
              .addClass("is-active");

            $(input).prop("checked", true);
            $(element)
              .find(".w-form-formradioinput")
              .addClass("w--redirected-checked");

            $(element).addClass("is-active");
            isInsuMatched = true;
          }
        });
        if (!isInsuMatched) {
          preSearchValue.insurance = "";
        }
      } else {
        $("#search-insurance-label")
          .text("Insurance*")
          .removeClass("is-active");

        $(
          "#insurance-dropdown .insurance-wrapper .filter-item-radio, #search-insurance .filter-dropdown_list .filter_radio-button-field"
        ).each((index, element) => {
          const input = $(element).find('input[type="radio"]');

          $(input).prop("checked", false);
          $(element)
            .find(".w-form-formradioinput")
            .removeClass("w--redirected-checked");

          $(element).removeClass("is-active");
        });
      }

      if (
        preSearchValue?.specialties &&
        preSearchValue?.specialties.length > 0
      ) {
        let selectedSpecialtiesText = [];
        $(
          "#search-specialty-dropdown .specialties-field, #search-specialty-dropdown-mobile .filter_checkbox-field"
        ).each((index, element) => {
          const input = $(element).find('input[type="checkbox"]');
          const dataValue = input.attr("data-value");
          if (preSearchValue.specialties.includes(dataValue)) {
            $('input[data-value="' + dataValue + '"]').prop("checked", true);
            const text = $(element).find(".w-form-label").text().trim();
            if (!selectedSpecialtiesText.includes(text)) {
              selectedSpecialtiesText.push(text);
            }

            $(element)
              .find(".w-checkbox-input")
              .addClass("w--redirected-checked");
          }
        });

        if (selectedSpecialtiesText.length > 0) {
          $("#search-specialties-label")
            .text(selectedSpecialtiesText.join(", "))
            .addClass("is-active");
        }
      }
      searchFilters = preSearchValue;
    } catch (error) {}
    // sessionStorage.removeItem("navigated");
    // sessionStorage.removeItem("preSearchValue");
  }

  // Hero Filter - Desktop insurance change event
  $("#insurance-dropdown .insurance-wrapper .filter-item-radio").change(
    function (e) {
      $(
        "#insurance-dropdown .insurance-wrapper  .filter-item-radio"
      ).removeClass("is-active");
      $(this).addClass("is-active");

      const labelText = $(this).find(".radio-dropdwn-label").text();
      searchFilters.insurance = $(this)
        .find('input[type="radio"]')
        .attr("data-value");

      $("#search-insurance-label").text(labelText).addClass("is-active");

      let value = $(this).find("input").attr("data-value");
      const dropdownElement = document.getElementById("insurance-dropdown");
      dropdownElement.classList.remove("open");
      dropdownElement.removeAttribute("aria-expanded");
      dropdownElement.setAttribute("aria-expanded", "false");

      $(".search-insurance-element").removeClass("error");

      $('#search-insurance input[type="radio"]').each((index, radioInput) => {
        const dataValue = $(radioInput).attr("data-value");
        if (dataValue === searchFilters.insurance) {
          $(radioInput)
            .prop("checked", true)
            .closest(".filter_radio-button-field")
            .addClass("is-active")
            .find(".w-form-formradioinput")
            .addClass("w--redirected-checked");
        } else {
          $(radioInput)
            .prop("checked", false)
            .closest(".filter_radio-button-field")
            .removeClass("is-active")
            .find(".w-form-formradioinput")
            .removeClass("w--redirected-checked");
        }
      });
    }
  );

  // Hero Filter - Mobile insurance change event
  $(
    "#search-insurance .filter-dropdown_list .filter_radio-button-field"
  ).change(function (e) {
    $(
      "#search-insurance .filter-dropdown_list .filter_radio-button-field"
    ).removeClass("is-active");
    $(this).addClass("is-active");

    const labelText = $(this).find(".filter_radio-label").text();
    searchFilters.insurance = $(this)
      .find('input[type="radio"]')
      .attr("data-value");

    $("#search-insurance-label").text(labelText).addClass("is-active");
    $(".search-insurance-element").removeClass("error");
    closePopup($("#search-insurance")[0]);

    $('#insurance-dropdown input[type="radio"]').each((index, radioInput) => {
      const dataValue = $(radioInput).attr("data-value");
      if (dataValue === searchFilters.insurance) {
        $(radioInput)
          .prop("checked", true)
          .closest(".filter-item-radio")
          .addClass("is-active")
          .find(".w-form-formradioinput")
          .addClass("w--redirected-checked");
      } else {
        $(radioInput)
          .prop("checked", false)
          .closest(".filter-item-radio")
          .removeClass("is-active")
          .find(".w-form-formradioinput")
          .removeClass("w--redirected-checked");
      }
    });
  });

  // Hero Filter - Desktop specialties save button click event
  $("#search-specialty-dropdown .save").click(function (e) {
    const selectedSpecialties = [];
    const selectedSpecialtiesText = [];
    $(
      '#search-specialty-dropdown .specialties-field input[type="checkbox"]'
    ).each((index, checkboxInput) => {
      const isChecked = $(checkboxInput).prop("checked");
      if (isChecked) {
        selectedSpecialties.push($(checkboxInput).attr("data-value"));
        const specialtyText = $(checkboxInput)
          .closest(".specialties-field")
          .find(".checkbox-label")
          .text()
          .trim();
        selectedSpecialtiesText.push(specialtyText);
      }
    });

    searchFilters.specialties = selectedSpecialties;
    if (selectedSpecialties.length > 0) {
      $("#search-specialties-label")
        .text(selectedSpecialtiesText.join(", "))
        .addClass("is-active");
    } else {
      $("#search-specialties-label")
        .text("Specialties")
        .removeClass("is-active");
    }

    $(
      '#search-specialty-dropdown-mobile .filter_checkbox-field input[type="checkbox"]'
    ).each((index, checkboxInput) => {
      const value = $(checkboxInput).attr("data-value");
      if (selectedSpecialties.includes(value)) {
        $(checkboxInput)
          .prop("checked", true)
          .closest(".filter_checkbox-field")
          .find(".w-checkbox-input")
          .addClass("w--redirected-checked");
      } else {
        $(checkboxInput)
          .prop("checked", false)
          .closest(".filter_checkbox-field")
          .find(".w-checkbox-input")
          .removeClass("w--redirected-checked");
      }
    });
  });

  // Hero Filter - Mobile specialties save button click event
  $("#search-specialties .save").click(function (e) {
    e.preventDefault();
    const selectedSpecialties = [];
    const selectedSpecialtiesText = [];
    $(
      '#search-specialty-dropdown-mobile .filter_checkbox-field input[type="checkbox"]'
    ).each((index, checkboxInput) => {
      const isChecked = $(checkboxInput).prop("checked");
      if (isChecked) {
        selectedSpecialties.push($(checkboxInput).attr("data-value"));
        const specialtyText = $(checkboxInput)
          .closest(".filter_checkbox-field")
          .find(".filter_checkbox-label")
          .text()
          .trim();
        selectedSpecialtiesText.push(specialtyText);
      }
    });

    searchFilters.specialties = selectedSpecialties;
    if (selectedSpecialties.length > 0) {
      $("#search-specialties-label")
        .text(selectedSpecialtiesText.join(", "))
        .addClass("is-active");
    } else {
      $("#search-specialties-label")
        .text("Specialties")
        .removeClass("is-active");
    }

    $(
      '#search-specialty-dropdown .specialties-field input[type="checkbox"]'
    ).each((index, checkboxInput) => {
      const value = $(checkboxInput).attr("data-value");
      if (selectedSpecialties.includes(value)) {
        $(checkboxInput).prop("checked", true);
      } else {
        $(checkboxInput).prop("checked", false);
      }
    });

    const popup = $(e.target).closest(".mobile-filter-modal");
    closePopup(popup[0]);
  });

  // Hero Filter - Mobile specialties clear button click event
  $("#search-clear-specialties, #mobile-clear-specialties").click(function (e) {
    e.preventDefault();
    $(
      '#search-specialty-dropdown .specialties-field input[type="checkbox"], #search-specialty-dropdown-mobile .filter_checkbox-field input[type="checkbox"]'
    ).each((index, checkboxInput) => {
      const isChecked = $(checkboxInput).prop("checked");
      if (isChecked) {
        $(checkboxInput).prop("checked", false);
        $(checkboxInput)
          .closest(".filter_checkbox-field")
          .find(".filter_checkbox")
          .removeClass("w--redirected-checked");

        searchFilters.specialties = [];
      }
    });

    $("#search-specialties-label").text("Specialties").removeClass("is-active");

    const popup = $(e.target).closest(".mobile-filter-modal");
    if (popup.length > 0) {
      closePopup(popup[0]);
    }
    closeDropdown(e);
  });
}

function applySearch() {
  const params = new URLSearchParams();
  
  let hasError = false;

  if (!!searchFilters?.state) {
    $(".search-location-element").removeClass("error");
    params.set("state", searchFilters.state);
    sessionStorage.setItem(
      "stateInputText",
      JSON.stringify({
        state: searchFilters.state,
        stateText: searchFilters.stateInputText,
      })
    );
    params.set("stateText", searchFilters.stateInputText);
    if (
      searchFilters.userLatLong !== undefined &&
      searchFilters.userLatLong.lat !== undefined &&
      searchFilters.userLatLong.lng != undefined
    ) {
      const userLatLong = `${searchFilters.userLatLong.lat},${searchFilters.userLatLong.lng}`;
      params.set("location_coordinates", userLatLong);
    }
  } else {
    hasError = true;
    $(".search-location-element").addClass("error");
  }

  if (!!searchFilters?.insurance) {
    $(".search-insurance-element").removeClass("error");
    params.set("insurance", searchFilters.insurance);
  } else {
    hasError = true;
    $(".search-insurance-element").addClass("error");
  }

  if (!!searchFilters?.specialties && searchFilters.specialties.length > 0) {
    searchFilters.specialties.forEach((specialty, index) => {
      params.append("specialties", specialty);
    });
  }
  if (!hasError) {
    isInternalNavigation = true;

    const url = new URL(window.location.href);
    for (const param of shouldPersistParams) {
      const value = url.searchParams.get(param);
      if (value !== null) {
        params.set(param, value);
      }
    }

    if (isAds == true || isAds == "true") {
      params.set("ads", "true");
    }

    if (customerId && sessionId) {
      params.set("customerId", customerId);
      params.set("sessionId", sessionId);
    }
    if (referralToken) {
      params.set("referralToken", referralToken);
    }
    if (withingsToken) {
      params.set("withingsToken", withingsToken);
    }

    if (has_withings_plus) {
      params.set("has_withings_plus", has_withings_plus);
    }
    if (FayBookingCode) {
      params.set("FayBookingCode", FayBookingCode);
    }

    sessionStorage.setItem("stateInputText1", searchFilters.stateInputText);

    sessionStorage.setItem("navigated", "yes");
    sessionStorage.setItem("preSearchValue", JSON.stringify(searchFilters));

    $("#loading-div").removeClass("hide");
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.location.href = newUrl;
  }
}

function applyPreselectedValues() {
  const urlParams = new URLSearchParams(window.location.search);
  let page = urlParams.get("page");

  if (page) {
    page = parseInt(page);
    currentPage = Number.isInteger(page) ? parseInt(page) : 1;
  }

  const insurance = urlParams.get("insurance");
  if (insurance && insurance.length > 0) {
    $(
      ".find-data-wr .filter-dropdown_list.is-insurance  .filter_radio-button-field"
    ).each(function (e) {
      if ($(this).find("input").attr("data-value") == insurance) {
        $(this).addClass("is-active");
        $(this).find(".filter_radio-button").addClass("w--redirected-checked");

        const labelText = $(this).find(".filter_radio-label").text();
        $(".find-data-wr #insurance-label")
          .text(labelText)
          .addClass("is-active");
      }
    });
  } else {
    clearInsurance(false);
  }

  const specialties = urlParams.getAll("specialties");
  if (specialties && specialties.length > 0) {
    $(".specialties-number").text(`(${specialties.length})`);
    $(".specialties-number").show();

    const labels = document.querySelectorAll(
      ".filter_checkbox-label.is-api-ip"
    );
    $(".specialties-filter .filter_tag-template").addClass("is-active");

    $(".specialties-number").text(`(${specialties.length})`);
    $(".specialties-number").show();
    $(".specialties-number")
      .closest(".mobile-filters")
      .find(".filter_tag-template")
      .addClass("is-active");

    labels.forEach((label) => {
      specialties.forEach((specialty) => {
        const labelValue = label.parentNode
          .querySelector('input[type="checkbox"]')
          .getAttribute("data-value");
        if (labelValue === specialty.trim().toLowerCase()) {
          const checkboxDiv = label
            .closest("label")
            .querySelector(".filter_checkbox.is-specialty");
          label.parentNode.querySelector(
            'input[type="checkbox"]'
          ).checked = true;

          if (checkboxDiv) {
            $(checkboxDiv).addClass("w--redirected-checked");
          }
        }
      });
    });
  } else {
    clearSpecialties(false);
  }

  const modalities = urlParams.getAll("modalities");
  if (modalities.length > 0) {
    $(
      ".filter-dropdown_list.is-modalities .w-dyn-item, #modality-collection .w-dyn-item"
    ).map(function () {
      const index = $.inArray(
        $(this).find('input[type="checkbox"]').attr("data-value"),
        modalities
      );
      if (index !== -1) {
        $(this).find('input[type="checkbox"]').prop("checked", true);
        $(this).find(".filter_checkbox").addClass("w--redirected-checked");
      }
    });

    document.querySelector(
      ".modalities-number"
    ).innerHTML = `(${modalities.length})`;
    document.querySelector(".is-modalities").classList.add("is-active");

    $(".modalities-number").text(`(${modalities.length})`);
    $(".modalities-number").show();
  } else {
    clearModalities(false);
  }

  const availabilityType = urlParams.get("availability_type");
  if (availabilityType) {
    const radioInput = $(`input[type="radio"][value="${availabilityType}"]`);
    radioInput.prop("checked", true);
    const label = radioInput.first()
      .closest(".filter_radio-button-field")
      .find(".filter_radio-label")
      .text();

    $("#visit-label").text(label);
    $("#visit-label").addClass("is-active");
    radioInput
      .closest(".filter_radio-button-field:not(.is-mobile)")
      .addClass("is-active");
    radioInput
      .closest(".filter_radio-button-field")
      .find(".filter_radio-button")
      .addClass("w--redirected-checked");

    radioInput
      .closest(".filter_radio-button-field")
      .find(".w-radio-input")
      .addClass("w--redirected-checked");
  } else {
    clearAvailabilityType();
  }

  const sortValue = urlParams.get("sort_order");
  if (sortValue) {
    const dropdownToggle = document.querySelector(
      ".filter_tag-template.is-sort"
    );
    if (dropdownToggle) {
      dropdownToggle.textContent = sortValue;
      dropdownToggle.classList.add("is-active");
    }

    $(".filter-dropdown_list.is-sort .filter-dropdown_radio").each(function () {
      if ($(this).text() == sortValue) {
        $(this).addClass("is-active");
      }
    });
  } else {
    clearSort();
  }

  const radiusMiles = urlParams.get("radius_miles");
  if (radiusMiles) {
    $('input[name="distance"][value="' + radiusMiles + '"]')
      .prop("checked", true)
      .closest(".w-radio")
      .find(".w-radio-input")
      .addClass("w--redirected-checked");
    $('input[name="distance-mobile"][value="' + radiusMiles + '"]')
      .prop("checked", true)
      .closest(".w-radio")
      .find(".w-radio-input")
      .addClass("w--redirected-checked");
  } else {
    clearDistance();
  }

  const state = urlParams.get("state");
  const stateText = urlParams.get("stateText");
  if (state) {
    var inputText = sessionStorage.getItem("stateInputText");

    try {
      inputText = JSON.parse(inputText);
    } catch (error) {
      inputText = null;
    }

    if (stateText) {
      zipInputPopup.value = stateText;
      zipInput.value = stateText;
      zipInputMobile.value = stateText;
    } else if (inputText && inputText?.state == state) {
      zipInputPopup.value = inputText.stateText;
      zipInput.value = inputText.stateText;
      zipInputMobile.value = inputText.stateText;
    } else {
      $(".dropdown-list .count-state").each(function () {
        if ($(this).attr("state-name") == state) {
          const stateName = $(this).find(".checkbox-label").text();
          zipInputPopup.value = stateName;
          zipInputMobile.value = stateName;
          zipInput.value = stateName;
        }
      });
    }
  } else {
    zipInputPopup.value = "";
    zipInputMobile.value = "";
    sessionStorage.removeItem("stateInputText");
  }
}

function resetSpecialtyHeroSearch() {
  let selectedSpecialtiesText = [];
  $(
    "#search-specialty-dropdown .specialties-field, #search-specialty-dropdown-mobile .filter_checkbox-field"
  ).each((index, element) => {
    const input = $(element).find('input[type="checkbox"]');
    const dataValue = input.attr("data-value");
    if (
      searchFilters.specialties &&
      searchFilters.specialties.includes(dataValue)
    ) {
      input.prop("checked", true);
      $(element).find(".w-checkbox-input").addClass("w--redirected-checked");

      const text = $(element).find(".w-form-label").text().trim();
      if (!selectedSpecialtiesText.includes(text)) {
        selectedSpecialtiesText.push(text);
      }
    } else {
      input.prop("checked", false);
      $(element).find(".w-checkbox-input").removeClass("w--redirected-checked");
    }
  });

  if (selectedSpecialtiesText.length > 0) {
    $("#search-specialties-label")
      .text(selectedSpecialtiesText.join(", "))
      .addClass("is-active");
  }
}

function resetSpecialtyResultSearch() {
  const urlParams = new URLSearchParams(window.location.search);
  const specialties = urlParams.getAll("specialties");

  const labels = document.querySelectorAll(
    ".filter-dropdown_list.is-specialties .filter_checkbox-field"
  );

  if (specialties && specialties.length > 0) {
    $(".specialties-number").text(`(${specialties.length})`);
    $(".specialties-number").show();
    $(".specialties-filter .filter_tag-template").addClass("is-active");
    $(".specialties-number")
      .closest(".mobile-filters")
      .find(".filter_tag-template")
      .addClass("is-active");
  } else {
    $(".specialties-number").hide();
    $(".specialties-filter .filter_tag-template").removeClass("is-active");
    $(".specialties-number")
      .closest(".mobile-filters")
      .find(".filter_tag-template")
      .removeClass("is-active");
  }

  labels.forEach((label) => {
    const input = $(label).find('input[type="checkbox"]');
    const labelValue = input.attr("data-value");
    if (specialties && specialties.includes(labelValue)) {
      input.prop("checked", true);

      const checkboxDiv = label.querySelector(".filter_checkbox.is-specialty");

      if (checkboxDiv) {
        $(checkboxDiv).addClass("w--redirected-checked");
      }
    } else {
      input.prop("checked", false);

      const checkboxDiv = label.querySelector(".filter_checkbox.is-specialty");
      if (checkboxDiv) {
        $(checkboxDiv).removeClass("w--redirected-checked");
      }
    }
  });
}

function resetModalitiesResultSearch() {
  const urlParams = new URLSearchParams(window.location.search);
  const modalities = urlParams.getAll("modalities");

  const labels = document.querySelectorAll(
    ".filter-dropdown_list.is-modalities .filter_checkbox-field"
  );

  if (modalities && modalities.length > 0) {
    $(".modalities-number").text(`(${modalities.length})`);
    $(".modalities-number").show();
    $(".modalities-filter .filter_tag-template").addClass("is-active");
    $(".modalities-number")
      .closest(".mobile-filters")
      .find(".filter_tag-template")
      .addClass("is-active");
  } else {
    $(".modalities-number").hide();
    $(".modalities-filter .filter_tag-template").removeClass("is-active");
    $(".modalities-number")
      .closest(".mobile-filters")
      .find(".filter_tag-template")
      .removeClass("is-active");
  }

  labels.forEach((label) => {
    const input = $(label).find('input[type="checkbox"]');
    const labelValue = input.attr("data-value");
    if (modalities && modalities.includes(labelValue)) {
      input.prop("checked", true);

      const checkboxDiv = label.querySelector(".filter_checkbox.is-modality");

      if (checkboxDiv) {
        $(checkboxDiv).addClass("w--redirected-checked");
      }
    } else {
      input.prop("checked", false);

      const checkboxDiv = label.querySelector(".filter_checkbox.is-modality");
      if (checkboxDiv) {
        $(checkboxDiv).removeClass("w--redirected-checked");
      }
    }
  });
}

const script = document.createElement("script");
script.src =
  "https://maps.googleapis.com/maps/api/js?key=AIzaSyCoibblXX0z3Zr5fSF9V0enYBD5_EZIgiA&callback=initMap&loading=async&libraries=places&v=weekly&region=us"; // New Key
// "https://maps.googleapis.com/maps/api/js?key=AIzaSyBvoUcGtPBjUewpNhFXpf_r6rue6cyVvnY&callback=initMap&loading=async&libraries=places&v=weekly&region=us"; // Old Key
script.async = true;
document.head.appendChild(script);

window.addEventListener("popstate", function (event) {
  const isResultForm = checkIsFilterOrResult();
  if (event.persisted && isResultForm) {
    applyPreselectedValues();
    setTimeout(() => {
      loadRatings();
    }, 1000);
  }
});

window.addEventListener("pageshow", function (event) {
  const isResultForm = checkIsFilterOrResult();
  if (event.persisted && isResultForm) {
    applyPreselectedValues();
    setTimeout(() => {
      loadRatings();
    }, 1000);
  }
});

async function loadRatings() {
  const ready = await window.statsigReady;
  const gateOn = ready.ok
    ? window.statsigClient.checkGate("dietitian_profile_reviews_and_ratings")
    : false;

  console.log("gateOn", gateOn);

  let ratingsData = [];

  const promises = $("#dietitian-items-container .dietitian-item").map(
    async function (i, element) {
      const providerId = $(element).attr("id");
      const ratingData = await getRating(providerId, gateOn);
      ratingsData.push(
        ratingData?.rating !== undefined ? ratingData.rating : {}
      );
    }
  );

  await Promise.all(promises);

  const urlParams = new URLSearchParams(window.location.search);
  let cPage = urlParams.get("page");

  if (cPage) {
    cPage = parseInt(cPage);
  } else {
    cPage = 1;
  }

  const insurance = urlParams.get("insurance");
  const state = urlParams.get("state");
  const specialties = urlParams.getAll("specialties");
  const modalities = urlParams.getAll("modalities");

  let insuranceText = null;
  if (insurance) {
    const insuranceElement = $(".filter-dropdown_list.is-insurance").find(
      '.filter_radio-button-field input[name="Insurance"][data-value="' +
        insurance +
        '"]'
    );
    insuranceText = insuranceElement
      .closest(".filter_radio-button-field")
      .find(".filter_radio-label")
      .text();
  }

  let specialtiesText = [];
  if (specialties && specialties.length > 0) {
    for (let i = 0; i < specialties.length; i++) {
      const specialtyElement = $(".filter-dropdown_list.is-specialties").find(
        '.filter_checkbox-field input[data-value="' + specialties[i] + '"]'
      );
      specialtiesText.push(
        specialtyElement
          .closest(".filter_checkbox-field")
          .find(".filter_checkbox-label")
          .text()
      );
    }
  }

  let modalitiesText = [];
  if (modalities && modalities.length > 0) {
    for (let i = 0; i < modalities.length; i++) {
      const specialtyElement = $(".filter-dropdown_list.is-modalities").find(
        '.filter_checkbox-field input[data-value="' + modalities[i] + '"]'
      );
      modalitiesText.push(
        specialtyElement
          .closest(".filter_checkbox-field")
          .find(".filter_checkbox-label")
          .text()
      );
    }
  }

  let eventData = {
    Page: `Find Page ${cPage}`,
    AverageRating: null,
    AverageRatingCount: null,
    MedianRating: null,
    MedianRatingCount: null,
    NewDietitians: null,
    Insurance: insuranceText,
    Location: state,
    Specialties:
      specialtiesText && specialtiesText.length > 0
        ? specialtiesText.join(", ")
        : null,
    Modalities:
      modalitiesText && modalitiesText.length > 0
        ? modalitiesText.join(", ")
        : null,
  };

  if (ratingsData.length > 0) {
    let newDietitians = 0;
    let totalRatings = 0;
    let totalRatingsCount = 0;
    let totalRecords = ratingsData.length;
    let allRetings = [];
    let allRetingCounts = [];
    $.each(ratingsData, function (_, d) {
      let avg = d?.average && d.average != null ? parseFloat(d.average) : 0;
      let count =
        d?.total_submissions && d.total_submissions != null
          ? parseInt(d.total_submissions)
          : 0;

      totalRatings += avg;
      totalRatingsCount += count;

      // Count NewDietitians if no rating or count
      if (!d || (d && d.average == null && d.total_submissions == null)) {
        newDietitians += 1;
      }
      allRetings.push(avg);
      allRetingCounts.push(count);
    });

    // --- Average Rating ---
    const averageRating = totalRecords > 0 ? totalRatings / totalRecords : 0;

    // --- Average Rating Count ---
    const averageRatingCount =
      totalRecords > 0 ? totalRatingsCount / totalRecords : 0;

    const medianRating = findMedian(allRetings);
    const medianCount = findMedian(allRetingCounts);

    eventData = {
      Page: `Find Page ${cPage}`,
      AverageRating: parseFloat(averageRating.toFixed(2)),
      AverageRatingCount: Math.round(parseFloat(averageRatingCount)),
      MedianRating: parseFloat(medianRating.toFixed(2)),
      MedianRatingCount: Math.round(parseFloat(medianCount)),
      NewDietitians: newDietitians,
      Insurance: insuranceText,
      Location: state,
      Specialties:
        specialtiesText && specialtiesText.length > 0
          ? specialtiesText.join(", ")
          : null,
      Modalities:
        modalitiesText && modalitiesText.length > 0
          ? modalitiesText.join(", ")
          : null,
    };
  }

  const availableTags = document.querySelectorAll(".available-now-tag");

  let has_provider_with_instant_bookings = false;
  let available_dietitian_count = 0;
  // Check if at least one is visible
  availableTags.forEach((tag) => {
    const isVisible = !!(
      tag.offsetWidth ||
      tag.offsetHeight ||
      tag.getClientRects().length
    );
    if (isVisible) {
      has_provider_with_instant_bookings = true;
      available_dietitian_count += 1;
    }
  });

  const mixpanelStatus = await window.mixpanelReady;
  var userAgentBotTest = navigator.userAgent;
  // var userAgentBotTest = 'Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/143.0.4 DatadogSynthetics';
  mixpanel.register({ "User Agent": userAgentBotTest });
  if (/DatadogSynthetics/i.test(userAgentBotTest)) {
    mixpanel.register({ $ignore: true });
  }

  if (mixpanelStatus?.ok) {
    mixpanel?.track("find_page_viewed", {
      RatingShown: gateOn,
      ...eventData,
      available_dietitian_count: available_dietitian_count,
      has_provider_with_instant_bookings,
    });
  } else {
    console.log("mixpanel script not loaded");
  }
}

function findMedian(numbers) {
  if (!numbers || numbers.length === 0) return null; // handle empty array

  // Sort numbers in ascending order
  const sorted = numbers.slice().sort((a, b) => a - b);

  const middle = Math.floor(sorted.length / 2);

  // If odd, return the middle number
  if (sorted.length % 2 !== 0) {
    return sorted[middle];
  } else {
    // If even, return average of two middle numbers
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
}