window.Webflow ||= [];
window.Webflow.push(() => {
  //autocomplete
  var autocompleteTimer;
  var requestCounter = 0;

  const adsUrlParams = new URLSearchParams(window.location.search);
  const isAds = adsUrlParams.get('ads');
  const customerId = adsUrlParams.get('customerId');
  const sessionId = adsUrlParams.get('sessionId');
  const referralToken = adsUrlParams.get('referralToken');
  const withingsToken = adsUrlParams.get('withings_token') ?? adsUrlParams.get('withingsToken');
  const has_withings_plus = adsUrlParams.get('has_withings_plus');
  const FayBookingCode = adsUrlParams.get('FayBookingCode');

  if (withingsToken) {
    localStorage.setItem('withingsToken', withingsToken);
  }

  if (isAds === 'true') {
    document.querySelector('.br__nav_menu-list').classList.add('is-ads');
    document.querySelector('.br__footer-wr').classList.add('is-ads-hide');
    document.querySelector('.br__nav__menu-button').classList.add('is-ads');
    document.querySelector('.br__footer-wr-ads').classList.remove('is-ads');
  } else {
    document.querySelector('.br__nav_menu-list').classList.remove('is-ads');
    document.querySelector('.br__footer-wr').classList.remove('is-ads-hide');
    document.querySelector('.br__nav__menu-button').classList.remove('is-ads');
    document.querySelector('.br__footer-wr-ads').classList.add('is-ads');
  }

  // Timebox helper: resolves to { ok: true } or { ok: false, timeout: true }
  async function withTimeout(promise, ms) {
    return Promise.race([
      promise.then(() => ({ ok: true })),
      new Promise((resolve) => setTimeout(() => resolve({ ok: false, timeout: true }), ms)),
    ]);
  }

  async function waitForMixpanel(timeout = 1000, retries = 100, delay = 100) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      if (window.mixpanel) {
        const result = await withTimeout(Promise.resolve(window.mixpanel), timeout);
        if (result.ok) {
          return { ok: true };
        }
      }

      if (attempt < retries) {
        console.warn(
          `Mispanel not ready (attempt ${attempt}/${retries}). Retrying in ${delay}ms...`
        );

        // wait before retrying
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    return { ok: false, timeout: true };
  }

  // Global promise that retries
  window.mixpanelReady = (async () => {
    const result = await waitForMixpanel();
    return result;
  })();

  async function mixpanelAction() {
    const statsigStatus = await window.statsigReady;
    await window.mixpanelReady;

    var userAgentBotTest = navigator.userAgent;
    mixpanel.register({ 'User Agent': userAgentBotTest });
    if (/DatadogSynthetics/i.test(userAgentBotTest)) {
      mixpanel.register({ $ignore: true });
    }

    const gateOn = statsigStatus.ok
      ? window.statsigClient.checkGate('dietitian_profile_reviews_and_ratings')
      : false;

    const quizGateOn = statsigStatus.ok
      ? window.statsigClient.checkGate('quiz_flow_marketing_site')
      : false;

    console.log('gateOn:', gateOn, window.statsigClient.checkGate('quiz_flow_marketing_site'));

    console.log('mixpanel loaded');

    mixpanel?.track('home_page_viewed', {
      RatingShown: gateOn,
      QuizShown: quizGateOn,
    });

    mixpanel?.init('b244137ebd6eaed06ec25cc81bec6ad0', {
      record_sessions_percent: 100, //records 100% of all sessions
      record_mask_text_selector: '',
    });

    if (quizGateOn) {
      $('.find-dietitian-link').attr('href', 'https://signup.faynutrition.com/quiz');

      mixpanel?.track('$experiment_started', {
        'Experiment name': 'quiz_flow',
        'Variant name': 'quiz_flow_v1',
      });

      setTimeout(() => {
        addUtmParamsInLinks();
      }, 1000);
    } else {
      mixpanel?.track('$experiment_started', {
        'Experiment name': 'quiz_flow',
        'Variant name': 'booking_flow',
      });
    }
  }

  mixpanelAction();

  let selectedSpecialties = null;
  let selectedInsurance = null;
  let selectedState = {};
  let inputSearchListActiveIndex = -1;

  //alerts - using data attributes for error containers and messages
  let errorContainers = document.querySelectorAll('[data-search-error="container"]');
  let stateErrorMessages = document.querySelectorAll('[data-search-error="location"]');
  let insuranceErrorMessages = document.querySelectorAll('[data-search-error="insurance"]');

  // Field elements that need is-error class
  let insuranceLabelHero = document.getElementById('insurance-label');
  let insuranceLabelNav = document.getElementById('insurance-label-nav');
  let specialtiesLabelHero = document.getElementById('specialties-label');
  let specialtiesLabelNav = document.getElementById('specialties-label-nav');

  const locationInput = document.getElementById('locationInput');
  const locationInputNav = document.getElementById('locationInputNav');
  const locationInputMobile = document.getElementById('inputTextMobile');
  const locationInputScroll = document.getElementById('locationInputScroll');

  var clearSpecialtiesLinkD = document.getElementById('clear-specialties');
  var clearSpecialtiesLinkNavD = document.getElementById('clear-specialties-nav');
  var clearSpecialtiesLinkM = document.getElementById('clear-specialties-m');

  // Open and save dropdowns
  var togElements = document.getElementsByClassName('hero-form_field-wrap');
  var dropdownElements = document.getElementsByClassName('hero_dropdown-wrap');
  var saveElements = document.getElementsByClassName('save');

  const herofilterSection = document.querySelector('.br__h-hero-wr');
  const herofilterFieldElements = herofilterSection.querySelectorAll('.br__search-field-wr');

  const navfilterSection = document.querySelector('.br__header_container');
  const navFilterFieldElements = navfilterSection.querySelectorAll('.br__search-field-wr');

  function ensureDropdownInViewport(dropdownEl, offset = 16) {
    if (!dropdownEl) return;

    const rect = dropdownEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    let scrollAmount = 0;

    // Dropdown goes below viewport
    if (rect.bottom > viewportHeight) {
      scrollAmount = rect.bottom - viewportHeight + offset;
    }

    // Dropdown goes above viewport
    if (rect.top < 0) {
      scrollAmount = rect.top - offset;
    }

    if (scrollAmount !== 0) {
      window.scrollBy({
        top: scrollAmount,
        behavior: 'smooth',
      });
    }
  }

  function toggleDropdown(event) {
    // var clickedDropdown = event.currentTarget.nextElementSibling;
    var clickedDropdown = event.currentTarget.parentElement.querySelector('.hero_dropdown-wrap');

    console.log('clickedDropdown', clickedDropdown);

    // Close other dropdowns
    for (var i = 0; i < dropdownElements.length; i++) {
      if (
        dropdownElements[i].id == 'specialty-dropdown' &&
        dropdownElements[i].classList.contains('is-active')
      ) {
        $('#save-specialty').trigger('click');
      } else if (
        dropdownElements[i].id == 'specialty-dropdown-nav' &&
        dropdownElements[i].classList.contains('is-active')
      ) {
        $('#save-specialty-nav').trigger('click');
      }

      if (
        clickedDropdown &&
        [
          'insurance-dropdown',
          'insurance-dropdown-nav',
          'specialty-dropdown',
          'specialty-dropdown-nav',
        ].includes(clickedDropdown.id)
      ) {
        requestAnimationFrame(() => {
          ensureDropdownInViewport(clickedDropdown);
        });
      }

      if (dropdownElements[i] !== clickedDropdown) {
        dropdownElements[i].classList.remove('is-active');
        dropdownElements[i].removeAttribute('aria-expanded');
        dropdownElements[i].setAttribute('aria-expanded', 'false');
      }
    }

    // Toggle clicked dropdown
    clickedDropdown?.classList.toggle('is-active');
    clickedDropdown?.setAttribute('aria-expanded', 'true');

    inputSearchListActiveIndex = -1;
    setTimeout(() => {
      updateKeyboardHighlight(clickedDropdown?.querySelectorAll('.w-dyn-item') ?? []);
    }, 10);
  }

  function closeDropdown(event) {
    var dropdown = event?.currentTarget?.closest('.hero_dropdown-wrap');
    if (dropdown) {
      dropdown.classList.remove('is-active');
      dropdown.removeAttribute('aria-expanded');
      dropdown.setAttribute('aria-expanded', 'false');
      inputSearchListActiveIndex = -1;
      setTimeout(() => {
        updateKeyboardHighlight(dropdown.querySelectorAll('.w-dyn-item'));
      }, 10);
    }
  }

  function closeDropdownsOutsideForm(event) {
    var clickedElement = event.target;
    var isDropdownClicked =
      clickedElement.closest('.br__search-field-wr') !== null ||
      clickedElement.closest('.cc_step-wr') !== null;

    if (!isDropdownClicked) {
      inputSearchListActiveIndex = -1;

      for (var i = 0; i < dropdownElements.length; i++) {
        if (
          dropdownElements[i].id == 'specialty-dropdown' &&
          dropdownElements[i].classList.contains('is-active')
        ) {
          $('#save-specialty').trigger('click');
          resetSpecialtiesInputSearch();
        }

        if (
          dropdownElements[i].id == 'specialty-dropdown-nav' &&
          dropdownElements[i].classList.contains('is-active')
        ) {
          $('#save-specialty-nav').trigger('click');
          resetSpecialtiesInputSearch();
        }

        if (
          (dropdownElements[i].id == 'insurance-dropdown' ||
            dropdownElements[i].id == 'insurance-dropdown-nav') &&
          dropdownElements[i].classList.contains('is-active')
        ) {
          resetInsuranceInputSearch();
        }

        dropdownElements[i].classList.remove('is-active');
        dropdownElements[i].removeAttribute('aria-expanded');
        dropdownElements[i].setAttribute('aria-expanded', 'false');

        const dropdownItems = dropdownElements[i]?.querySelectorAll('.w-dyn-item');
        setTimeout(() => {
          updateKeyboardHighlight(dropdownItems);
        }, 10);
      }
    }
  }

  // Attach event listeners to toggle elements
  for (var i = 0; i < togElements.length; i++) {
    togElements[i].addEventListener('click', toggleDropdown);
  }

  // Attach event listeners to save elements
  for (var i = 0; i < saveElements.length; i++) {
    saveElements[i].addEventListener('click', closeDropdown);
  }

  document.addEventListener('click', closeDropdownsOutsideForm);
  locationInput.addEventListener('click', closeDropdownsOutsideForm);
  locationInputNav.addEventListener('click', closeDropdownsOutsideForm);
  locationInputScroll.addEventListener('click', closeDropdownsOutsideForm);

  //prevent enter from submitting form
  const form = document.getElementById('wf-form-Select-your-needs-optional');

  form.addEventListener('keypress', function preventSubmit() {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  });

  form.addEventListener('submit', function preventSubmit() {
    event.preventDefault();
    return false;
  });

  //prevent scroll when popup is open
  // window.Webflow ||= [];
  // window.Webflow.push(function () {
  //   $('.popup-trigger').click(function (e) {
  //     e.preventDefault();
  //     $('body').css('overflow', 'hidden');
  //   });
  //   $('.close').click(function (e) {
  //     e.preventDefault();
  //     $('body').css('overflow', 'auto');
  //   });
  // });

  /////POPUPS
  const triggers = document.querySelectorAll('.popup-trigger');
  const popups = document.querySelectorAll('.mobile-filter-modal');
  let lastTrigger = null; // To save the last trigger element

  // Event Listener for Opening Popups
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      const popupId = event.currentTarget.getAttribute('data-popup');
      const popup = document.getElementById(popupId);

      if (popup) {
        openPopup(popup, trigger);
      }
    });
  });

  // Event Listener for Closing Popups
  popups.forEach((popup) => {
    const closeButton = popup.querySelectorAll('.close');
    if (closeButton && closeButton.length > 0) {
      closeButton.forEach((button) => {
        button.addEventListener('click', () => closePopup(popup));
      });
    }

    // Close popup when clicking outside the content
    popup.addEventListener('click', (event) => {
      if (event.target === popup) {
        closePopup(popup);
      }
    });
  });

  // Function to Open Popup
  function openPopup(popup, trigger) {
    // Close all other popups and set inert
    popups.forEach((otherPopup) => {
      if (otherPopup !== popup) {
        otherPopup.classList.remove('is-visible');
        otherPopup.setAttribute('inert', '');
        otherPopup.setAttribute('aria-hidden', 'true');
      }
    });

    popup.classList.add('is-visible');
    popup.removeAttribute('inert');
    popup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus on the first focusable element inside the popup
    const focusableElements = popup.querySelectorAll('a, button, input, select, textarea');
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Save the triggering element
    lastTrigger = trigger;
  }

  // Function to Close Popup
  function closePopup(popup) {
    popup.classList.remove('is-visible');
    popup.setAttribute('inert', '');
    popup.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Return focus to the last trigger
    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null; // Clear after returning focus
    }

    if (popup.id == 'insurance') {
      resetInsuranceInputSearch();
    }

    if (popup.id == 'specialties') {
      resetSpecialtiesInputSearch();
    }
  }

  // Close Popup on Esc Key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      popups.forEach((popup) => {
        if (popup.classList.contains('is-visible')) {
          closePopup(popup);
          if (popup.id == 'specialties') {
            $('#specialties .save').trigger('click');
          }
        }
      });
    }
  });

  let locationInputs = document.querySelectorAll(
    '#locationInput, #locationInputNav, #inputTextMobile, #locationInputScroll'
  );
  const insuranceLabel = document.getElementById('insurance-label');
  const insuranceLabelMobileScroll = document.getElementById('insurance-label-scroll');
  const insuranceRadio = document.querySelectorAll(
    '#insurance .insurance-wrapper input[type="radio"], #insurance-dropdown .insurance-wrapper input[type="radio"], #insurance-dropdown-nav .insurance-wrapper input[type="radio"]'
  );
  const insuranceDropdown = $('#insurance-dropdown');
  const insuranceDropdownNav = $('#insurance-dropdown-nav');
  const specialtyDropdown = $('#specialty-dropdown');
  const specialtyDropdownNav = $('#specialty-dropdown-nav');

  let finalURL = '';

  async function createURL() {
    const statsigStatus = await window.statsigReady;

    let url = 'https://www.faynutrition.com/find';

    const quizGateOn = statsigStatus.ok
      ? window.statsigClient.checkGate('quiz_flow_marketing_site')
      : false;

    if (quizGateOn) {
      url = 'https://signup.faynutrition.com/quiz';
    }

    const buildUrl = new URL(url);

    let stateURL;
    let insuranceURL;
    let specialtyURL;

    if (selectedState.state !== undefined) {
      stateURL = selectedState.state.replace(/\s+/g, '+');
      //.replace(/[^\w\s-]/g, "");
      // finalURL = finalURL.concat("state=", stateURL);
      buildUrl.searchParams.set('state', stateURL);
      if (locationInput.value) {
        buildUrl.searchParams.set('stateText', locationInput.value);
      }

      if (
        selectedState.userLatLong !== undefined &&
        selectedState.userLatLong.lat !== undefined &&
        selectedState.userLatLong.lng !== undefined
      ) {
        const userLatLong = `${selectedState.userLatLong.lat},${selectedState.userLatLong.lng}`;
        buildUrl.searchParams.set('location_coordinates', userLatLong);
      }
    }

    if (selectedInsurance != null) {
      insuranceURL = selectedInsurance.replace(/\s+/g, '+');
      buildUrl.searchParams.set('insurance', insuranceURL);
    }
    if (selectedSpecialties && selectedSpecialties.length > 0) {
      selectedSpecialties.forEach((specialty, index) => {
        buildUrl.searchParams.append('specialties', specialty);
      });
    }

    shouldPersistParams.forEach((key) => {
      const storedVal = localStorage.getItem(key);
      if (storedVal) {
        buildUrl.searchParams.append(key, storedVal);
      }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const isAds = urlParams.get('ads');
    if (isAds == 'true') {
      buildUrl.searchParams.set('ads', 'true');
    }

    if (customerId) {
      buildUrl.searchParams.set('customerId', customerId);
    }
    if (sessionId) {
      buildUrl.searchParams.set('sessionId', sessionId);
    }
    if (referralToken) {
      buildUrl.searchParams.set('referralToken', referralToken);
    }
    if (withingsToken) {
      buildUrl.searchParams.set('withingsToken', withingsToken);
    }

    if (has_withings_plus) {
      buildUrl.searchParams.set('has_withings_plus', has_withings_plus);
    }
    if (FayBookingCode) {
      buildUrl.searchParams.set('FayBookingCode', FayBookingCode);
    }

    finalURL = buildUrl.toString();
  }

  function validateStateField() {
    console.log('selectedState:', selectedState);
    if (selectedState.state !== undefined) {
      // Hide error containers and messages
      errorContainers.forEach((container) => container.classList.add('is-hidden'));
      stateErrorMessages.forEach((msg) => msg.classList.add('is-hidden'));

      // Remove is-error class from location inputs
      locationInput.classList.remove('is-error');
      locationInputNav.classList.remove('is-error');
    } else {
      // Show error containers and state error messages
      errorContainers.forEach((container) => container.classList.remove('is-hidden'));
      stateErrorMessages.forEach((msg) => msg.classList.remove('is-hidden'));

      // Add is-error class to location inputs
      locationInput.classList.add('is-error');
      locationInputNav.classList.add('is-error');
    }
  }

  function validateInsuranceField() {
    if (selectedInsurance != null) {
      // Hide error containers and messages
      errorContainers.forEach((container) => container.classList.add('is-hidden'));
      insuranceErrorMessages.forEach((msg) => msg.classList.add('is-hidden'));

      // Remove is-error class from insurance labels
      if (insuranceLabelHero) insuranceLabelHero.classList.remove('is-error');
      if (insuranceLabelNav) insuranceLabelNav.classList.remove('is-error');
    } else {
      // Show error containers and insurance error messages
      errorContainers.forEach((container) => container.classList.remove('is-hidden'));
      insuranceErrorMessages.forEach((msg) => msg.classList.remove('is-hidden'));

      // Add is-error class to insurance labels
      if (insuranceLabelHero) insuranceLabelHero.classList.add('is-error');
      if (insuranceLabelNav) insuranceLabelNav.classList.add('is-error');
    }
  }

  // Hero Location Input Change
  locationInput.addEventListener('input', function () {
    locationInputNav.value = locationInput.value;
    locationInputMobile.value = locationInput.value;
    locationInputScroll.value = locationInput.value;

    // Hide error messages when user starts typing
    errorContainers.forEach((container) => container.classList.add('is-hidden'));
    stateErrorMessages.forEach((msg) => msg.classList.add('is-hidden'));
    locationInput.classList.remove('is-error');
    locationInputNav.classList.remove('is-error');
  });

  locationInputNav.addEventListener('input', function () {
    locationInput.value = locationInputNav.value;
    locationInputMobile.value = locationInputNav.value;
    locationInputScroll.value = locationInputNav.value;

    // Hide error messages when user starts typing
    errorContainers.forEach((container) => container.classList.add('is-hidden'));
    stateErrorMessages.forEach((msg) => msg.classList.add('is-hidden'));
    locationInput.classList.remove('is-error');
    locationInputNav.classList.remove('is-error');
  });

  locationInputMobile.addEventListener('input', function () {
    locationInput.value = locationInputMobile.value;
    locationInputNav.value = locationInputMobile.value;
    locationInputScroll.value = locationInputMobile.value;

    // Hide error messages when user starts typing
    errorContainers.forEach((container) => container.classList.add('is-hidden'));
    stateErrorMessages.forEach((msg) => msg.classList.add('is-hidden'));
    locationInput.classList.remove('is-error');
    locationInputNav.classList.remove('is-error');
  });

  locationInputScroll.addEventListener('input', function () {
    locationInput.value = locationInputScroll.value;
    locationInputNav.value = locationInputScroll.value;
    locationInputMobile.value = locationInputScroll.value;

    // Hide error messages when user starts typing
    errorContainers.forEach((container) => container.classList.add('is-hidden'));
    stateErrorMessages.forEach((msg) => msg.classList.add('is-hidden'));
    locationInput.classList.remove('is-error');
    locationInputNav.classList.remove('is-error');
  });

  function initAutocomplete() {
    var options = {
      types: ['(regions)'],
      componentRestrictions: { country: 'us' },
    };

    locationInputs.forEach((locInput) => {
      var autocomplete = new google.maps.places.Autocomplete(locInput, options);

      locInput.addEventListener('input', function () {
        clearTimeout(autocompleteTimer);
        var input = locInput.value.trim();
        if (input === '') {
          if (
            locInput.id === 'locationInput' ||
            locInput.id === 'locationInputNav' ||
            locInput.id === 'inputTextMobile' ||
            locInput.id === 'locationInputScroll'
          ) {
            locationInput.classList.remove('is-active');
            locationInputMobile.classList.remove('is-active');
            locationInputNav.classList.remove('is-active');
            locationInputScroll.classList.remove('is-active');
            selectedState = {};
            window.setTimeout(() => {
              createURL();
              validateStateField();
            }, 100);
          }

          return;
        }

        // Check if the input is a valid US ZIP code
        if (/^\d{5}$/.test(input)) {
          fetchStateFromZip(input)
            .then((state) => {
              if (state) {
                if (
                  locInput.id == 'locationInput' ||
                  locInput.id == 'locationInputNav' ||
                  locInput.id == 'inputTextMobile' ||
                  locInput.id == 'locationInputScroll'
                ) {
                  selectedState = state;
                  createURL();
                  locationInput.classList.add('is-active');
                  locationInputNav.classList.add('is-active');
                  locationInputMobile.classList.add('is-active');
                  locationInputScroll.classList.add('is-active');
                  herofilterFieldElements?.[2]?.classList.add('is-active');
                  navFilterFieldElements?.[2]?.classList.add('is-active');

                  if (window.innerWidth > 991) {
                    locInput.blur();
                    validateStateField();
                  }
                }
              } else {
                console.log('Invalid ZIP code');
              }
            })
            .catch((err) => console.error('Error fetching state:', err));
          return; // Skip further autocomplete actions
        }

        // Delay for autocomplete functionality
        autocompleteTimer = setTimeout(function () {
          if (input !== '') {
            autocomplete.getPlace();
            requestCounter++; // Increment the counter
            console.log('calls:', requestCounter);
          }
        }, 500);
      });

      const isOnlyStateSelected = (place) => {
        if (!place || !place.address_components) return false;

        const components = place.address_components;

        const hasState = components.some((comp) =>
          comp.types.includes('administrative_area_level_1')
        );

        const hasCityOrCounty = components.some(
          (comp) =>
            comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')
        );

        return hasState && !hasCityOrCounty;
      };

      autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
          console.log('error');
          return;
        }

        var zipCode = '';
        var city = '';
        var state = '';

        const isState = isOnlyStateSelected(place);

        let userLatLong = {};

        if (!isState) {
          userLatLong = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
        }

        for (var i = 0; i < place.address_components.length; i++) {
          var component = place.address_components[i];
          if (component.types.includes('postal_code')) {
            zipCode = component.long_name;
          }
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            if (city === 'Washington, D.C.') {
              state = 'District of Columbia';
            } else {
              state = component.short_name;
            }
          }
        }

        if (
          locInput.id === 'locationInput' ||
          locInput.id === 'locationInputNav' ||
          locInput.id === 'inputTextMobile' ||
          locInput.id === 'locationInputScroll'
        ) {
          locationInput.classList.add('is-active');
          locationInputNav.classList.add('is-active');
          locationInputMobile.classList.add('is-active');
          locationInputScroll.classList.add('is-active');
          selectedState = { userLatLong, state };
          var event = new Event('input', { bubbles: true });
          locInput.dispatchEvent(event);
          herofilterFieldElements?.[2]?.classList.add('is-active');
          navFilterFieldElements?.[2]?.classList.add('is-active');

          setTimeout(() => {
            closePopup($('#location')[0]);
          }, 100);

          createURL();
          resizeFilterButton();
          validateStateField();
        }
      });
    });

    const observer = new window.MutationObserver(() => {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer && !pacContainer.dataset.moved) {
        pacContainer.classList.add('is-nav');
      }
    });

    observer.observe(document.body, { childList: true });
  }

  // Function to fetch state from a ZIP code using Google Maps Geocoding API
  function fetchStateFromZip(zipCode) {
    return new Promise((resolve, reject) => {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { address: zipCode, componentRestrictions: { country: 'us' } },
        function (results, status) {
          if (status === 'OK' && results[0]) {
            var addressComponents = results[0].address_components;
            const userLatLong = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            };

            for (var i = 0; i < addressComponents.length; i++) {
              var component = addressComponents[i];
              if (component.types.includes('administrative_area_level_1')) {
                resolve({ state: component.short_name, userLatLong });
                //validateForm();
                return;
              }
            }
            resolve(null); // No state found
          } else {
            reject(`Geocoding failed: ${status}`);
          }
        }
      );
    });
  }

  insuranceRadio.forEach(function (radio) {
    radio.addEventListener('change', function () {
      const nextElement = this.nextElementSibling;
      selectedInsurance = radio.getAttribute('data-value');
      insuranceLabel.textContent = nextElement.textContent;
      insuranceLabel.classList.add('is-active');

      insuranceLabelNav.textContent = nextElement.textContent;
      insuranceLabelNav.classList.add('is-active');

      insuranceLabelMobileScroll.textContent = nextElement.textContent;
      insuranceLabelMobileScroll.classList.add('is-active');

      insuranceDropdown.removeClass('is-active');
      insuranceDropdownNav.removeClass('is-active');
      resetInsuranceInputSearch();

      closePopup($('#insurance.mobile-filter-modal')[0]);
      createURL();
      validateInsuranceField();
      resizeFilterButton();

      if (selectedState.state !== undefined) {
        herofilterFieldElements?.[1]?.classList.add('is-active');
        navFilterFieldElements?.[1]?.classList.add('is-active');
        herofilterFieldElements?.[2]?.classList.add('is-active');
        navFilterFieldElements?.[2]?.classList.add('is-active');
      } else {
        herofilterFieldElements?.[1]?.classList.add('is-active');
        navFilterFieldElements?.[1]?.classList.add('is-active');
      }

      $(
        '#insurance .insurance-wrapper input[type="radio"], #insurance-dropdown .insurance-wrapper input[type="radio"], #insurance-dropdown-nav .insurance-wrapper input[type="radio"]'
      ).each(function () {
        if (selectedInsurance == $(this).attr('data-value')) {
          $(this)
            .prop('checked', true)
            .closest('.w-radio')
            .find('.w-radio-input')
            .addClass('w--redirected-checked');
        } else {
          $(this)
            .prop('checked', false)
            .closest('.w-radio')
            .find('.w-radio-input')
            .removeClass('w--redirected-checked');
        }
      });
    });
  });

  // Save Specialty selections desktop
  $('#save-specialty').click(function () {
    var checkboxes = $('#specialty-dropdown .filter-item input[type="checkbox"]');
    selectedSpecialties = [];
    var selectedValues = [];

    checkboxes.each((index, checkbox) => {
      const isChecked = $(checkbox).prop('checked');

      if (isChecked) {
        selectedSpecialties.push(checkbox.getAttribute('data-value'));
        const label = $(checkbox).closest('.filter-item').find('.checkbox-label').text().trim();
        selectedValues.push(label);
      }
    });

    if (selectedSpecialties && selectedSpecialties.length > 0) {
      $('#specialties-label').text(selectedValues.join(', ')).addClass('is-active');

      $('#specialties-label-scroll').text(selectedValues.join(', ')).addClass('is-active');

      $('#specialties-label-nav').text(selectedValues.join(', ')).addClass('is-active');
    } else {
      $('#specialties-label').text('Needs').removeClass('is-active');

      $('#specialties-label-scroll').text('Specialties (Optional)').removeClass('is-active');

      $('#specialties-label-nav').text('Needs').removeClass('is-active');
    }

    resetSpecialtiesInputSearch();

    $(
      '#specialty-dropdown .filter-item input[type="checkbox"], #specialty-dropdown-nav .filter-item input[type="checkbox"], #specialty-collection-mobile .filter-item input[type="checkbox"]'
    ).each((index, checkboxInput) => {
      const value = $(checkboxInput).attr('data-value');
      if (selectedSpecialties.includes(value)) {
        $(checkboxInput).prop('checked', true);
        $(checkboxInput)
          .closest('.specialties-field')
          .find('.w-checkbox-input')
          .addClass('w--redirected-checked');
      } else {
        $(checkboxInput).prop('checked', false);
        $(checkboxInput)
          .closest('.specialties-field')
          .find('.w-checkbox-input')
          .removeClass('w--redirected-checked');
      }
    });

    setTimeout(() => {
      specialtyDropdown.hasClass('is-active') ? specialtyDropdown.removeClass('is-active') : null;
      specialtyDropdownNav.hasClass('is-active')
        ? specialtyDropdownNav.removeClass('is-active')
        : null;
    }, 100);

    createURL();
  });

  // Save Specialty selections desktop nav
  $('#save-specialty-nav').click(function () {
    var checkboxes = $('#specialty-dropdown-nav .filter-item input[type="checkbox"]');
    selectedSpecialties = [];
    var selectedValues = [];

    checkboxes.each((index, checkbox) => {
      const isChecked = $(checkbox).prop('checked');

      if (isChecked) {
        selectedSpecialties.push(checkbox.getAttribute('data-value'));
        const label = $(checkbox).closest('.filter-item').find('.checkbox-label').text().trim();
        selectedValues.push(label);
      }
    });

    if (selectedSpecialties && selectedSpecialties.length > 0) {
      $('#specialties-label').text(selectedValues.join(', ')).addClass('is-active');

      $('#specialties-label-scroll').text(selectedValues.join(', ')).addClass('is-active');

      $('#specialties-label-nav').text(selectedValues.join(', ')).addClass('is-active');
    } else {
      $('#specialties-label').text('Needs').removeClass('is-active');

      $('#specialties-label-scroll').text('Specialties (Optional)').removeClass('is-active');

      $('#specialties-label-nav').text('Needs').removeClass('is-active');
    }
    resetSpecialtiesInputSearch();

    $(
      '#specialty-dropdown .filter-item input[type="checkbox"], #specialty-dropdown-nav .filter-item input[type="checkbox"], #specialty-collection-mobile .filter-item input[type="checkbox"]'
    ).each((index, checkboxInput) => {
      const value = $(checkboxInput).attr('data-value');
      if (selectedSpecialties.includes(value)) {
        $(checkboxInput).prop('checked', true);
        $(checkboxInput)
          .closest('.specialties-field')
          .find('.w-checkbox-input')
          .addClass('w--redirected-checked');
      } else {
        $(checkboxInput).prop('checked', false);
        $(checkboxInput)
          .closest('.specialties-field')
          .find('.w-checkbox-input')
          .removeClass('w--redirected-checked');
      }
    });

    setTimeout(() => {
      specialtyDropdown.hasClass('is-active') ? specialtyDropdown.removeClass('is-active') : null;
      specialtyDropdownNav.hasClass('is-active')
        ? specialtyDropdownNav.removeClass('is-active')
        : null;
    }, 100);

    createURL();
  });

  // Save Specialty selections mobile
  $('#specialties .save').click(function () {
    var checkboxes = $('#specialty-collection-mobile .filter-item input[type="checkbox"]');
    selectedSpecialties = [];
    var selectedValues = [];

    checkboxes.each((index, checkbox) => {
      const isChecked = $(checkbox).prop('checked');

      if (isChecked) {
        selectedSpecialties.push(checkbox.getAttribute('data-value'));
        const label = $(checkbox).closest('.filter-item').find('.checkbox-label').text().trim();
        selectedValues.push(label);
      }
    });

    if (selectedSpecialties && selectedSpecialties.length > 0) {
      $('#specialties-label').text(selectedValues.join(', ')).addClass('is-active');

      $('#specialties-label-scroll').text(selectedValues.join(', ')).addClass('is-active');

      $('#specialties-label-nav').text(selectedValues.join(', ')).addClass('is-active');
    } else {
      $('#specialties-label').text('Needs').removeClass('is-active');

      $('#specialties-label-scroll').text('Specialties (Optional)').removeClass('is-active');

      $('#specialties-label-nav').text('Needs').removeClass('is-active');
    }

    $(
      '#specialty-dropdown .filter-item input[type="checkbox"], #specialty-dropdown-nav .filter-item input[type="checkbox"]'
    ).each((index, checkboxInput) => {
      const value = $(checkboxInput).attr('data-value');
      if (selectedSpecialties.includes(value)) {
        $(checkboxInput).prop('checked', true);
        $(checkboxInput)
          .closest('.specialties-field')
          .find('.w-checkbox-input')
          .addClass('w--redirected-checked');
      } else {
        $(checkboxInput).prop('checked', false);
        $(checkboxInput)
          .closest('.specialties-field')
          .find('.w-checkbox-input')
          .removeClass('w--redirected-checked');
      }
    });

    createURL();
    closePopup($('#specialties.mobile-filter-modal')[0]);
  });

  $('#specialties .close').click(function () {
    $('#specialties .save').trigger('click');
  });

  $('form').submit(function (e) {
    e.preventDefault();
    // storeInputText();
    return false;
  });

  function storeInputText() {
    if (selectedInsurance == null || selectedState.state === undefined) {
      // Show error containers
      errorContainers.forEach((container) => container.classList.remove('is-hidden'));

      if (selectedInsurance == null) {
        // Hide state errors, show insurance errors
        stateErrorMessages.forEach((msg) => msg.classList.add('is-hidden'));
        insuranceErrorMessages.forEach((msg) => msg.classList.remove('is-hidden'));

        // Remove is-error from location inputs, add to insurance labels
        locationInput.classList.remove('is-error');
        locationInputNav.classList.remove('is-error');
        if (insuranceLabelHero) insuranceLabelHero.classList.add('is-error');
        if (insuranceLabelNav) insuranceLabelNav.classList.add('is-error');
      } else if (selectedInsurance != null && selectedState.state === undefined) {
        // Hide insurance errors, show state errors
        insuranceErrorMessages.forEach((msg) => msg.classList.add('is-hidden'));
        stateErrorMessages.forEach((msg) => msg.classList.remove('is-hidden'));

        // Remove is-error from insurance labels, add to location inputs
        if (insuranceLabelHero) insuranceLabelHero.classList.remove('is-error');
        if (insuranceLabelNav) insuranceLabelNav.classList.remove('is-error');
        locationInput.classList.add('is-error');
        locationInputNav.classList.add('is-error');
      }
    } else {
      // Hide all error containers and messages
      errorContainers.forEach((container) => container.classList.add('is-hidden'));
      insuranceErrorMessages.forEach((msg) => msg.classList.add('is-hidden'));
      stateErrorMessages.forEach((msg) => msg.classList.add('is-hidden'));

      // Remove all is-error classes
      locationInput.classList.remove('is-error');
      locationInputNav.classList.remove('is-error');
      if (insuranceLabelHero) insuranceLabelHero.classList.remove('is-error');
      if (insuranceLabelNav) insuranceLabelNav.classList.remove('is-error');

      setTimeout(() => {
        const inputText = locationInput.value;
        sessionStorage.setItem('stateInputText', inputText);
        sessionStorage.setItem(
          'filterValue',
          JSON.stringify({
            selectedSpecialties,
            selectedInsurance,
            selectedState: {
              ...selectedState,
              location: $('#locationInput').val(),
            },
          })
        );
        window.location.href = finalURL;
      }, 50);
    }
    return false;
  }

  // Search input
  const insuranceSearchInputs = document.querySelectorAll(
    '#insurance-dropdown .br__insurance-search-input, #insurance-dropdown-nav .br__insurance-search-input, #insuranceSearchMobile'
  );
  const specialtySearchInputs = document.querySelectorAll(
    '#specialty-dropdown .br__insurance-search-input, #specialty-dropdown-nav .br__insurance-search-input, #specialitiesSearchMobile'
  );

  // All insurance items
  const insuranceItems = document.querySelectorAll('.insurance-wrapper .insurance-item');
  const specialtyItems = document.querySelectorAll(
    '#specialty-dropdown .filter-item, #specialty-dropdown-nav .filter-item, #specialty-collection-mobile.specialtity-collection .filter-item'
  );

  insuranceSearchInputs.forEach((input) => {
    input.addEventListener('input', function () {
      inputSearchListActiveIndex = -1;
      const query = this.value.trim().toLowerCase();
      document
        .getElementById('insurance')
        ?.querySelector('.insurance-wrapper')
        .classList.toggle('is-searching-active', query);

      $(
        '#insurance-dropdown .br__insurance-search-input, #insurance-dropdown-nav .br__insurance-search-input, #insuranceSearchMobile'
      ).val(this.value.trim());

      // Hide error messages when user starts typing
      errorContainers.forEach((container) => container.classList.add('is-hidden'));
      insuranceErrorMessages.forEach((msg) => msg.classList.add('is-hidden'));
      if (insuranceLabelHero) insuranceLabelHero.classList.remove('is-error');
      if (insuranceLabelNav) insuranceLabelNav.classList.remove('is-error');

      insuranceItems.forEach((item) => {
        const label = item.querySelector('.w-form-label');
        const originalText = label.getAttribute('original-text');
        const lowerText = originalText.toLowerCase();

        if (!query || lowerText.includes(query)) {
          item.classList.remove('hide');
        } else {
          item.classList.add('hide');
        }

        if (query) {
          const regex = new RegExp(`(${query})`, 'gi');
          label.innerHTML = originalText.replace(regex, `<span class="pac-matched">$1</span>`);
        } else {
          label.innerHTML = originalText; // restore original
        }
      });
    });
  });

  function resetInsuranceInputSearch() {
    const insuranceInput = document
      .getElementById('insurance-dropdown')
      ?.querySelector('.br__insurance-search-input');

    if (insuranceInput) insuranceInput.value = '';

    const insuranceInputNav = document
      .getElementById('insurance-dropdown-nav')
      ?.querySelector('.br__insurance-search-input');

    if (insuranceInputNav) insuranceInputNav.value = '';

    const mobileInput = document.getElementById('insuranceSearchMobile');
    if (mobileInput) mobileInput.value = '';

    const insuranceWrapper = document
      .getElementById('insurance')
      ?.querySelector('.insurance-wrapper');

    if (insuranceWrapper) insuranceWrapper.classList.remove('is-searching-active');

    insuranceItems.forEach((item) => {
      const label = item.querySelector('.w-form-label');
      if (!label) return;

      // Restore original text
      const originalText = label.getAttribute('original-text');
      if (originalText) {
        label.innerHTML = originalText;
      }
      // Show all items
      item.classList.remove('hide');
    });

    inputSearchListActiveIndex = -1;
    setTimeout(() => {
      updateKeyboardHighlight(insuranceItems);
    }, 10);
  }

  specialtySearchInputs.forEach((input) => {
    input.addEventListener('input', function () {
      const query = this.value.trim().toLowerCase();
      const specialitiesSearch = document
        .getElementById('specialty-dropdown')
        .querySelector('.br__insurance-search-input');
      if (specialitiesSearch) specialitiesSearch.valaue = this.value.trim();

      const specialitiesSearchNav = document
        .getElementById('specialty-dropdown-nav')
        .querySelector('.br__insurance-search-input');
      if (specialitiesSearchNav) specialitiesSearchNav.valaue = this.value.trim();

      const specialitiesSearchMobile = document.getElementById('specialitiesSearchMobile');
      if (specialitiesSearchMobile) specialitiesSearchMobile.valaue = this.value.trim();

      document
        .getElementById('specialties')
        ?.querySelector('.specialties-wrapper')
        .classList.toggle('is-searching-active', query);

      specialtyItems.forEach((item) => {
        const label = item.querySelector('.w-form-label');
        const originalText = label.getAttribute('original-text');
        const lowerText = originalText.toLowerCase();

        if (!query || lowerText.includes(query)) {
          item.classList.remove('hide');
        } else {
          item.classList.add('hide');
        }

        const searchText = this.value.trim();

        if (query) {
          const regex = new RegExp(`(${query})`, 'gi');
          label.innerHTML = originalText.replace(regex, `<span class="pac-matched">$1</span>`);
        } else {
          label.innerHTML = originalText; // restore original
        }
      });
    });
  });

  function resetSpecialtiesInputSearch() {
    const specialtyInput = document
      .getElementById('specialty-dropdown')
      ?.querySelector('.br__insurance-search-input');

    if (specialtyInput) specialtyInput.value = '';

    const specialtyInputNav = document
      .getElementById('specialty-dropdown-nav')
      ?.querySelector('.br__insurance-search-input');

    if (specialtyInputNav) specialtyInputNav.value = '';

    const mobileInput = document.getElementById('specialitiesSearchMobile');
    if (mobileInput) mobileInput.value = '';

    const specialtyWrapper = document
      .getElementById('specialties')
      ?.querySelector('.specialties-wrapper');

    if (specialtyWrapper) specialtyWrapper.classList.remove('is-searching-active');

    specialtyItems.forEach((item) => {
      const label = item.querySelector('.w-form-label');
      if (!label) return;

      // Restore original text
      const originalText = label.getAttribute('original-text');
      if (originalText) {
        label.innerHTML = originalText;
      }
      // Show all items
      item.classList.remove('hide');
    });

    inputSearchListActiveIndex = -1;
    setTimeout(() => {
      updateKeyboardHighlight(specialtyItems);
    }, 10);
  }

  function clearSpecialties(event) {
    specialtyItems.forEach((item) => {
      item.querySelector('input[type=checkbox]').checked = false;
      item.querySelector('.w-checkbox-input')?.classList.remove('w--redirected-checked');
    });
    selectedSpecialties = null;
    $('#specialties-label').text('Needs').removeClass('is-active');

    $('#specialties-label-scroll').text('Specialties (Optional)').removeClass('is-active');

    $('#specialties-label-nav').text('Needs').removeClass('is-active');
    setTimeout(() => {
      createURL();
    }, 200);

    closeDropdown(event);
    closePopup($('#specialties.mobile-filter-modal')[0]);
  }

  clearSpecialtiesLinkD.addEventListener('click', clearSpecialties);
  clearSpecialtiesLinkNavD.addEventListener('click', clearSpecialties);
  clearSpecialtiesLinkM.addEventListener('click', clearSpecialties);

  // Reset Specialty checkbox on closing dropdown without saving
  function resetSpecialtyHeroSearch() {
    let selectedSpecialtiesText = [];
    $(
      '#specialty-dropdown .filter-item, #specialty-dropdown-nav .filter-item, #specialty-collection-mobile .filter-item'
    ).each((index, element) => {
      const input = $(element).find('input[type="checkbox"]');
      const dataValue = input.attr('data-value');
      if (selectedSpecialties && selectedSpecialties.includes(dataValue)) {
        input.prop('checked', true);
        const text = $(element).find('.w-form-label').text().trim();
        selectedSpecialtiesText[dataValue] = text;

        $(element).find('.w-checkbox-input').addClass('w--redirected-checked');
      } else {
        input.prop('checked', false);
        $(element).find('.w-checkbox-input').removeClass('w--redirected-checked');
      }
    });

    if (selectedSpecialties && selectedSpecialties.length > 0) {
      $('#specialties-label').text(Object.values(selectedSpecialtiesText).join(', '));
      $('#specialties-label').addClass('is-active');

      $('#specialties-label-scroll').text(Object.values(selectedSpecialtiesText).join(', '));
      $('#specialties-label-scroll').addClass('is-active');

      $('#specialties-label-nav').text(Object.values(selectedSpecialtiesText).join(', '));
      $('#specialties-label-nav').addClass('is-active');
    } else {
      $('#specialties-label').text('Needs');
      $('#specialties-label').removeClass('is-active');

      $('#specialties-label-scroll').text('Specialties (Optional)');
      $('#specialties-label-scroll').removeClass('is-active');

      $('#specialties-label-nav').text('Needs');
      $('#specialties-label-nav').removeClass('is-active');
    }
  }

  function resizeFilterButton() {
    if (window.innerWidth > 991) {
      $('.br__hero-wr .br__search-wr').addClass('is-active');
    } else {
      if (selectedInsurance) {
        $('.br__hero-wr .br__search-wr').addClass('is-active');
        $('.br__hero-wr #insurance-tog .br__embed-icon').removeClass('is-active');

        if (selectedState?.state) {
          $(
            '.br__hero-wr .br__search-wr button, .br__hero-search-wr .br__search-wr button'
          ).removeClass('is-disable');
        } else {
          $(
            '.br__hero-wr .br__search-wr button, .br__hero-search-wr .br__search-wr button'
          ).addClass('is-disable');
        }
      } else {
        $('.br__hero-wr .br__search-wr').removeClass('is-active');
        $('.br__hero-wr #insurance-tog .br__embed-icon').addClass('is-active');
      }
    }
  }

  resizeFilterButton();

  window.addEventListener('resize', () => {
    resizeFilterButton();
  });

  let userLocation = {};

  async function getUserLocation() {
    try {
      const response = await fetch(`https://marketing-site.cdn.faynutrition.com/_geo`);

      const data = await response.json();
      if (data?.country?.toLowerCase() == 'us') {
        userLocation = {
          userLatLong: { lat: data.latitude, lng: data.longitude },
          state: data.state,
          location: data.stateName,
        };

        try {
          const filterValue = JSON.parse(sessionStorage.getItem('filterValue'));

          if (filterValue?.selectedState?.location) {
          } else {
            $('#locationInput').val(userLocation?.location);
            $('#locationInputNav').val(userLocation?.location);
            $('#inputTextMobile').val(userLocation?.location);
            $('#locationInputScroll').val(userLocation?.location);

            locationInputNav.classList.add('is-active');
            locationInput.classList.add('is-active');
            inputTextMobile.classList.add('is-active');
            locationInputScroll.classList.add('is-active');

            selectedState = userLocation;
          }
        } catch (error) {}
      }
    } catch (error) {
      userLocation = {};
    }
  }

  (async () => {
    getUserLocation();
  })();

  // document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener('pageshow', function (event) {
    $('#loading-div').hide();

    setTimeout(() => {
      preFillHeroFilterAfterBack();
    }, 300);
  });

  function preFillHeroFilterAfterBack() {
    try {
      let filterValue = JSON.parse(sessionStorage.getItem('filterValue'));
      if (filterValue?.selectedInsurance) {
        if (selectedInsurance) {
          filterValue.selectedInsurance = selectedInsurance;
        }

        $('#insurance-dropdown .insurance-item, #insurance-dropdown-nav .insurance-item').each(
          (index, element) => {
            const input = $(element).find('input[type="radio"]');
            const dataValue = input.attr('data-value');
            const dataLabel = $(element).find('.radio-dropdwn-label').text().trim();
            if (dataValue === filterValue.selectedInsurance) {
              input.prop('checked', true);
              $('#insurance-label').text(dataLabel).addClass('is-active');
              $('#insurance-label-scroll').text(dataLabel).addClass('is-active');
              $('#insurance-label-nav').text(dataLabel).addClass('is-active');

              $('#insurance .insurance-item')
                .find('input[data-value="' + filterValue.selectedInsurance + '"]')
                .closest('.filter-item-radio')
                .find('.w-form-formradioinput')
                .addClass('w--redirected-checked');
              $(element).find('.w-form-formradioinput').addClass('w--redirected-checked');
            } else {
              input.prop('checked', false);
              $('#insurance .insurance-item')
                .find('input[data-value="' + filterValue.selectedInsurance + '"]')
                .closest('.filter-item-radio')
                .find('.w-form-formradioinput')
                .removeClass('w--redirected-checked');
              $(element).find('.w-form-formradioinput').removeClass('w--redirected-checked');
            }
          }
        );
        selectedInsurance = filterValue?.selectedInsurance;

        herofilterFieldElements?.[1]?.classList.add('is-active');
        navFilterFieldElements?.[1]?.classList.add('is-active');
        if (window.innerWidth < 992) {
          $('.br__search-wr').addClass('is-active');
        }
      } else {
        if (!selectedInsurance) {
          $('#insurance-label').text('Select your insurance').removeClass('is-active');

          $('#insurance-label-scroll').text('Select your insurance').removeClass('is-active');

          $('#insurance-label-nav').text('Select your insurance').removeClass('is-active');
        }
      }

      if (filterValue?.selectedState?.location) {
        $('#locationInput').val(filterValue?.selectedState?.location);
        $('#locationInputNav').val(filterValue?.selectedState?.location);
        $('#inputTextMobile').val(filterValue?.selectedState?.location);
        $('#locationInputScroll').val(filterValue?.selectedState?.location);
        delete filterValue?.selectedState.location;
        selectedState = filterValue?.selectedState;

        herofilterFieldElements?.[2]?.classList.add('is-active');
        navFilterFieldElements?.[2]?.classList.add('is-active');

        locationInputNav.classList.add('is-active');
        locationInput.classList.add('is-active');
        inputTextMobile.classList.add('is-active');
        locationInputScroll.classList.add('is-active');
      } else if (userLocation && userLocation?.location) {
        $('#locationInput').val(userLocation?.location);
        $('#locationInputNav').val(userLocation?.location);
        $('#inputTextMobile').val(userLocation?.location);
        $('#locationInputScroll').val(userLocation?.location);

        locationInputNav.classList.add('is-active');
        locationInput.classList.add('is-active');
        inputTextMobile.classList.add('is-active');
        locationInputScroll.classList.add('is-active');

        selectedState = userLocation;
      }

      if (filterValue?.selectedSpecialties) {
        if (selectedSpecialties) {
          filterValue.selectedSpecialties = selectedSpecialties;
        } else {
          selectedSpecialties = filterValue?.selectedSpecialties;
        }
      }
      setTimeout(() => {
        resetSpecialtyHeroSearch();
      }, 10);
    } catch (error) {
      console.log('error', error);
    }

    resizeFilterButton();
    createURL();
  }

  // });

  const searchInputs = document.querySelectorAll(
    '.br__insurance-search-input, .input-search-popups'
  );

  searchInputs.forEach((input) => {
    input.addEventListener('keydown', function (e) {
      const visibleItems = input
        .closest('.hero_dropdown-wrap')
        .querySelectorAll('.w-dyn-item:not(.hide)');
      if (visibleItems.length === 0) return;

      // DOWN KEY
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        inputSearchListActiveIndex = (inputSearchListActiveIndex + 1) % visibleItems.length;
        updateKeyboardHighlight(visibleItems);
      }

      // UP KEY
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        inputSearchListActiveIndex =
          (inputSearchListActiveIndex - 1 + visibleItems.length) % visibleItems.length;
        updateKeyboardHighlight(visibleItems);
      }

      // ENTER KEY
      if (e.key === 'Enter') {
        e.preventDefault();
        if (inputSearchListActiveIndex >= 0) {
          const selectedItem = visibleItems[inputSearchListActiveIndex];
          selectedItem.querySelector("input[type='checkbox'], input[type='radio']").click();
          if (
            selectedItem.querySelector("input[type='checkbox'], input[type='radio']").type ===
            'radio'
          ) {
            inputSearchListActiveIndex = -1; // Reset after selection
            updateKeyboardHighlight(visibleItems);
          }
        }
      }
    });
  });

  // Highlight Function
  function updateKeyboardHighlight(visibleItems) {
    visibleItems.forEach((item, idx) => {
      if (idx === inputSearchListActiveIndex) item.classList.add('keyboard-highlight');
      else item.classList.remove('keyboard-highlight');
    });

    // Auto-scroll into view
    if (inputSearchListActiveIndex > -1) {
      visibleItems[inputSearchListActiveIndex].scrollIntoView({
        block: 'nearest',
      });
    }
  }

  // ===========================================================================
  // KEYBOARD HANDLING FOR MOBILE FILTER MODALS
  // ===========================================================================
  // Adjust modal height when keyboard opens on mobile
  function handleKeyboardResize() {
    if (!window.visualViewport) return;

    const modals = document.querySelectorAll('.mobile-filter-modal .home-modal-form');
    // const filter = document.querySelector('m-filter-footer.is-br__wr');
    const viewport = window.visualViewport;
    const keyboardHeight = window.innerHeight - viewport.height;

    if (keyboardHeight > 100) {
      const availableHeight = viewport.height;
      modals.forEach((modal) => {
        // Keyboard is open
        modal.style.maxHeight = `${availableHeight}px`;
        modal.style.height = `${availableHeight}px`;
      });
      // filter.style.bottom = `${availableHeight}px`;
    } else {
      modals.forEach((modal) => {
        // Keyboard is closed - restore original height
        modal.style.maxHeight = '';
        modal.style.height = '';
      });
      // filter.style.bottom = '';
    }
  }

  // Listen for viewport changes (keyboard open/close)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleKeyboardResize);
    window.visualViewport.addEventListener('scroll', handleKeyboardResize);
  }

  window.initMap = initMap;
  window.storeInputText = storeInputText;

  function initMap() {
    initAutocomplete();
  }

  const script = document.createElement('script');
  script.src =
    'https://maps.googleapis.com/maps/api/js?key=AIzaSyCoibblXX0z3Zr5fSF9V0enYBD5_EZIgiA&callback=initMap&loading=async&libraries=places&v=weekly&region=us'; // New Key
  // "https://maps.googleapis.com/maps/api/js?key=AIzaSyBvoUcGtPBjUewpNhFXpf_r6rue6cyVvnY&callback=initMap&loading=async&libraries=places&v=weekly&region=us"; // Old Key
  script.async = true;
  document.head.appendChild(script);
});
