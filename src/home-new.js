// =============================================================================
// IMPORTS
// =============================================================================
import { Alignment, Fit, Layout, Rive } from '@rive-app/canvas';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hls from 'hls.js';
import lottie from 'lottie-web/build/player/lottie_light';
import Swiper from 'swiper';
import { Autoplay, EffectCoverflow, Keyboard, Mousewheel, Navigation } from 'swiper/modules';

// Lottie animation CDN URLs
const LOTTIE_URLS = {
  step1:
    'https://cdn.prod.website-files.com/60e33881a96433966407b814/694e52283d24c0d09542c619_Step-1.json',
  step3:
    'https://cdn.prod.website-files.com/60e33881a96433966407b814/6965142abfd7fc30f9716a42_Step-3.json',
  footerMobile:
    'https://cdn.prod.website-files.com/60e33881a96433966407b814/6965142a20216e5f817a2f39_footer-text-mobile.json',
  footerDesktop:
    'https://cdn.prod.website-files.com/60e33881a96433966407b814/696514293eb77f91651366eb_footer-text-desktop.json',
};

// =============================================================================
// GSAP SETUP
// =============================================================================
gsap.registerPlugin(Draggable, InertiaPlugin, ScrollTrigger);

// =============================================================================
// MAIN APPLICATION
// =============================================================================
window.Webflow ||= [];
window.Webflow.push(() => {
  // ===========================================================================
  // STATE MANAGEMENT
  // ===========================================================================
  const state = {
    inited: {
      swipers: false,
      mobileSwiper: false,
      profiles: false,
      steps: false,
      dots: false,
      videoLines: false,
      heroVideo: false,
    },
  };

  // ===========================================================================
  // UTILITY FUNCTIONS
  // ===========================================================================
  function onIdle(fn, timeout = 2000) {
    if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout });
    else window.setTimeout(fn, Math.min(timeout, 3000));
  }

  function duplicateSlides(swiperEl, times = 2) {
    const wrapper = swiperEl.querySelector('.swiper-wrapper');
    if (!wrapper || swiperEl.dataset.duped === '1') return;

    swiperEl.dataset.duped = '1';

    const originals = [...wrapper.children].filter(
      (el) => el.classList.contains('swiper-slide') && !el.classList.contains('is-dupe')
    );

    if (!originals.length) return;

    const fragment = document.createDocumentFragment();

    for (let t = 0; t < times; t++) {
      for (const slide of originals) {
        const clone = slide.cloneNode(true);
        clone.classList.add('is-dupe');
        fragment.appendChild(clone);
      }
    }

    wrapper.appendChild(fragment);
  }

  // ===========================================================================
  // HEADER & NAVIGATION
  // ===========================================================================
  function initMenu() {
    const btn = document.querySelector('.br__nav__menu-button');
    const header = document.querySelector('.br__header_wr');

    if (btn && header) {
      btn.addEventListener('click', () => {
        const isOpen = header.classList.contains('is-open');
        header.classList.toggle('is-open', !isOpen);
        btn.classList.toggle('is-open', !isOpen);
        btn.setAttribute('aria-expanded', (!isOpen).toString());
      });
    }
  }

  function initHeaderDarkMode() {
    // const header = document.querySelector('.br__header_wr');
    // if (!header) return;
    // header.classList.add('is-dark');
    // header.classList.add('is-links-dark');
    // const darkSections = document.querySelectorAll('[data-section="dark"]');
    // const linksDarkSections = document.querySelectorAll('[data-section-links="dark"]');
    // if (!darkSections.length && !linksDarkSections.length) return;
    // // Create ScrollTriggers for dark sections
    // darkSections.forEach((section) => {
    //   ScrollTrigger.create({
    //     trigger: section,
    //     start: 'top top',
    //     end: 'bottom top',
    //     onEnter: () => header.classList.add('is-dark'),
    //     onLeave: () => header.classList.remove('is-dark'),
    //     onEnterBack: () => header.classList.add('is-dark'),
    //     onLeaveBack: () => header.classList.remove('is-dark'),
    //   });
    // });
    // // Create ScrollTriggers for links dark sections
    // linksDarkSections.forEach((section) => {
    //   ScrollTrigger.create({
    //     trigger: section,
    //     start: () => `top ${header.offsetHeight}px`,
    //     end: () => `bottom ${header.offsetHeight}px`,
    //     onEnter: () => header.classList.add('is-links-dark'),
    //     onLeave: () => header.classList.remove('is-links-dark'),
    //     onEnterBack: () => header.classList.add('is-links-dark'),
    //     onLeaveBack: () => header.classList.remove('is-links-dark'),
    //   });
    // });
  }

  function initNavSearch() {
    const hero = document.querySelector('.br__section.is-home_hero');
    const navSearch = document.querySelector('.br__hero-search-wr.is-nav');

    if (!hero || !navSearch) return;

    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      onLeave: () => navSearch.classList.add('is-active'),
      onEnterBack: function () {
        navSearch.classList.remove('is-active');
        gsap.set('.pac-container.is-nav', { display: 'none' });
      },
    });
  }

  // ===========================================================================
  // STEP POINTERS
  // ===========================================================================
  function initStepPointers() {
    const stepItems = document.querySelectorAll('.br__step-item-wr .br__step-item');
    if (!stepItems.length) return;

    let lastScrollY = window.scrollY;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pointer = entry.target.querySelector('.br__steps_line-pointer');
          if (!pointer) return;

          const scrollingDown = window.scrollY > lastScrollY;
          lastScrollY = window.scrollY;

          if (entry.isIntersecting) pointer.classList.add('is-active');
          if (!entry.isIntersecting && !scrollingDown) pointer.classList.remove('is-active');
        });
      },
      { threshold: 0.0, rootMargin: '-50% 0px -50% 0px' }
    );

    stepItems.forEach((item) => observer.observe(item));
  }

  // ===========================================================================
  // SWIPER SLIDERS
  // ===========================================================================
  function initBlogSwiper() {
    const blogEl = document.querySelector('.swiper.br__blog');
    if (!blogEl || blogEl.classList.contains('swiper-initialized')) return;

    duplicateSlides(blogEl, 2);

    new Swiper(blogEl, {
      modules: [Navigation, EffectCoverflow, Mousewheel, Keyboard],
      loop: true,
      initialSlide: 2,
      slidesPerView: 'auto',
      centeredSlides: true,
      effect: 'coverflow',
      grabCursor: false,
      loopAdditionalSlides: 6,
      mousewheel: {
        forceToAxis: true,
        sensitivity: 0.25,
        releaseOnEdges: false,
        thresholdDelta: 12,
        thresholdTime: 120,
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
      navigation: {
        nextEl: '.br__blog-arrow.is-next',
        prevEl: '.br__blog-arrow.is-back',
      },
      watchOverflow: true,
      longSwipesRatio: 0.2,
      threshold: 5,
      coverflowEffect: {
        rotate: 0,
        stretch: -40,
        depth: 150,
        scale: 0.9,
        modifier: 1,
        slideShadows: false,
      },
    });
  }

  function initQuotesSwiper() {
    const sliderEl = document.querySelector('.swiper.br__quotes');
    const nameEl = document.querySelector('#quotes-name');

    if (!sliderEl || !nameEl) return;

    function updateQuoteName(swiper) {
      const activeSlide = swiper.slides[swiper.activeIndex];
      const name = activeSlide?.querySelector('.br__quote-wr')?.getAttribute('data-name') || '';
      nameEl.textContent = name;
    }

    new Swiper(sliderEl, {
      modules: [Navigation, Keyboard, Mousewheel],
      loop: true,
      slidesPerView: 1,
      speed: 500,
      spaceBetween: 100,
      grabCursor: true,
      mousewheel: {
        forceToAxis: true,
        sensitivity: 0.25,
        releaseOnEdges: false,
        thresholdDelta: 12,
        thresholdTime: 120,
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
      navigation: {
        nextEl: '.br__quotes-arrow.is-next',
        prevEl: '.br__quotes-arrow.is-back',
      },
      on: {
        init: updateQuoteName,
        slideChangeTransitionStart: updateQuoteName,
      },
    });
  }

  function initMobileSwiper() {
    if (typeof Swiper === 'undefined') return;

    const swiperEl = document.querySelector('.swiper.br__slide-m-wr');
    if (!swiperEl) return;

    if (!initMobileSwiper._instance) initMobileSwiper._instance = null;

    const shouldEnable = window.innerWidth < 992;

    if (shouldEnable && !initMobileSwiper._instance) {
      initMobileSwiper._instance = new Swiper(swiperEl, {
        modules: [Autoplay, Keyboard, Mousewheel],
        mousewheel: {
          forceToAxis: true,
          sensitivity: 0.25,
          releaseOnEdges: false,
          thresholdDelta: 12,
          thresholdTime: 120,
        },
        keyboard: {
          enabled: true,
          onlyInViewport: true,
        },
        slidesPerView: 'auto',
        spaceBetween: 24,
        grabCursor: true,
        centeredSlides: false,
        autoplay: {
          delay: 4000,
          disableOnInteraction: true,
          pauseOnMouseEnter: false,
        },
      });

      const sw = initMobileSwiper._instance;
      const stopAutoplay = () => {
        if (!sw || !sw.autoplay) return;
        sw.autoplay.stop();
        swiperEl.removeEventListener('pointerdown', stopAutoplay);
        swiperEl.removeEventListener('touchstart', stopAutoplay, { passive: true });
        swiperEl.removeEventListener('wheel', stopAutoplay, { passive: true });
      };

      swiperEl.addEventListener('pointerdown', stopAutoplay, { passive: true });
      swiperEl.addEventListener('touchstart', stopAutoplay, { passive: true });
      swiperEl.addEventListener('wheel', stopAutoplay, { passive: true });
    }

    if (!shouldEnable && initMobileSwiper._instance) {
      initMobileSwiper._instance.destroy(true, true);
      initMobileSwiper._instance = null;
    }
  }

  function initBlueCardsSwiper() {
    if (typeof Swiper === 'undefined') return;

    const el = document.querySelector('.swiper.is-blue-cards');
    if (!el) return;

    if (!initBlueCardsSwiper._instance) initBlueCardsSwiper._instance = null;

    const shouldEnable = window.innerWidth <= 479;

    const cleanupDupes = () => {
      el.querySelectorAll('.swiper-slide.is-dupe').forEach((n) => n.remove());
      delete el.dataset.duped;
    };

    if (shouldEnable && !initBlueCardsSwiper._instance) {
      duplicateSlides(el, 2);

      initBlueCardsSwiper._instance = new Swiper(el, {
        modules: [Autoplay],
        loop: true,
        grabCursor: true,
        slidesPerView: 'auto',
        initialSlide: 2,
        autoplay: {
          delay: 4000,
          disableOnInteraction: true,
          pauseOnMouseEnter: false,
        },
      });
    }

    if (!shouldEnable && initBlueCardsSwiper._instance) {
      initBlueCardsSwiper._instance.destroy(true, true);
      initBlueCardsSwiper._instance = null;
      cleanupDupes();
    }
  }

  function initAllSwipers() {
    if (state.inited.swipers || typeof Swiper === 'undefined') return;

    initBlogSwiper();
    initQuotesSwiper();

    state.inited.swipers = true;
  }

  // ===========================================================================
  // PROFILES DRAGGABLE CAROUSEL
  // ===========================================================================
  function initProfilesDraggable() {
    if (state.inited.profiles) return;
    if (typeof gsap === 'undefined' || typeof Draggable === 'undefined') return;

    const container = document.querySelector('.swiper.is-br__profiles');
    const wrapper = container?.querySelector('.swiper-wrapper.is-br__profiles');
    let slides = gsap.utils.toArray('.swiper-slide.is-br__profiles');
    const prevBtn = document.querySelector('.br__profiles_arrow-link.prev');
    const nextBtn = document.querySelector('.br__profiles_arrow-link.next');

    if (!container || !wrapper || !slides.length) return;

    const originalSlides = [...slides];

    // Clone slides for infinite loop
    originalSlides.forEach((slide) => {
      const clone = slide.cloneNode(true);
      clone.classList.add('is-clone');
      wrapper.appendChild(clone);
    });

    originalSlides
      .slice()
      .reverse()
      .forEach((slide) => {
        const clone = slide.cloneNode(true);
        clone.classList.add('is-clone');
        wrapper.insertBefore(clone, wrapper.firstChild);
      });

    slides = gsap.utils.toArray('.swiper-slide.is-br__profiles');

    let currentIndex = 0;
    let baseIndex = 0;
    let slideWidth = slides[0].offsetWidth;
    let smallWidth = slideWidth * 0.5;
    const gap = 24;

    gsap.set(slides, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      xPercent: -50,
      yPercent: -50,
    });

    const proxy = document.createElement('div');
    gsap.set(proxy, { x: 0 });

    function clearHover() {
      slides.forEach((slide) => slide.classList.remove('is-hover'));
    }

    function positionSlides(immediate = false, animateLimit = 4) {
      slides.forEach((slide, i) => {
        let offset = i - currentIndex;
        if (offset > slides.length / 2) offset -= slides.length;
        if (offset < -slides.length / 2) offset += slides.length;

        const xPos =
          offset === 0
            ? 0
            : Math.sign(offset) *
              (slideWidth / 2 + smallWidth / 2 + gap + (Math.abs(offset) - 1) * (smallWidth + gap));

        const scale = offset === 0 ? 1 : 0.5;
        slide.classList.toggle('is-active', offset === 0);

        const shouldAnimate = !immediate && Math.abs(offset) <= animateLimit;
        if (shouldAnimate) {
          gsap.to(slide, { duration: 0.4, x: xPos, scale, ease: 'power2.out' });
        } else {
          gsap.set(slide, { x: xPos, scale });
        }
      });
    }

    function wrapSlides() {
      slides.forEach((slide) => {
        const x = gsap.getProperty(slide, 'x');
        if (x > slideWidth * (slides.length / 2)) {
          gsap.set(slide, { x: x - slideWidth * slides.length });
        }
        if (x < -slideWidth * (slides.length / 2)) {
          gsap.set(slide, { x: x + slideWidth * slides.length });
        }
      });
    }

    function updateFromDrag() {
      const x = parseFloat(proxy._gsap?.x || 0);
      const steps = Math.round(-x / slideWidth);
      const newIndex = baseIndex + steps;

      currentIndex = ((newIndex % slides.length) + slides.length) % slides.length;

      wrapSlides();
      positionSlides();
      clearHover();
    }

    positionSlides(true);

    // Hover effects
    container.addEventListener('mouseover', (e) => {
      const activeSlide = e.target.closest('.swiper-slide.is-active');
      if (activeSlide) activeSlide.classList.add('is-hover');
    });

    container.addEventListener('mouseout', (e) => {
      const activeSlide = e.target.closest('.swiper-slide.is-active');
      if (activeSlide) activeSlide.classList.remove('is-hover');
    });

    // Click to navigate or open link
    let didDrag = false;
    let pressX = 0;

    function handleSlideClick(e) {
      if (didDrag) return;

      const clickedSlide = e.target.closest('.swiper-slide.is-br__profiles');
      if (!clickedSlide) return;

      // Don't intercept clicks on interactive elements
      if (e.target.closest('a, button, input, textarea, select, label')) return;

      // If clicking active slide, open the link
      if (clickedSlide.classList.contains('is-active')) {
        const a = clickedSlide.querySelector('a[href]');
        if (!a) return;

        if (a.target === '_blank' || e.ctrlKey || e.metaKey) {
          window.open(a.href, '_blank');
        } else {
          window.location.href = a.href;
        }
        return;
      }

      // If clicking non-active slide, navigate to it
      const clickedIndex = slides.indexOf(clickedSlide);
      if (clickedIndex === -1) return;

      // Calculate direction to clicked slide
      let offset = clickedIndex - currentIndex;
      if (offset > slides.length / 2) offset -= slides.length;
      if (offset < -slides.length / 2) offset += slides.length;

      // Navigate to clicked slide
      gsap.killTweensOf(proxy);
      currentIndex = clickedIndex;
      clearHover();
      positionSlides();
      baseIndex = currentIndex;
      gsap.set(proxy, { x: 0 });
    }

    container.addEventListener('click', handleSlideClick, true);

    // Navigation buttons
    function goToSlide(direction) {
      gsap.killTweensOf(proxy);
      currentIndex = (currentIndex + direction + slides.length) % slides.length;
      clearHover();
      positionSlides();
      baseIndex = currentIndex;
      gsap.set(proxy, { x: 0 });
    }

    prevBtn?.addEventListener('click', () => goToSlide(-1));
    nextBtn?.addEventListener('click', () => goToSlide(1));

    // Autoplay functionality
    const AUTOPLAY_DELAY = 4000;
    let autoplayTimer = null;
    let pauseByHover = false;
    let pauseByDrag = false;

    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    function startAutoplay() {
      stopAutoplay();
      if (document.hidden || pauseByHover || pauseByDrag) return;

      autoplayTimer = setInterval(() => {
        if (document.hidden || pauseByHover || pauseByDrag) return;
        goToSlide(1);
      }, AUTOPLAY_DELAY);
    }

    function updateAutoplay() {
      if (document.hidden || pauseByHover || pauseByDrag) stopAutoplay();
      else startAutoplay();
    }

    // Hover pause
    let hoverCount = 0;

    function hoverOn() {
      hoverCount++;
      pauseByHover = true;
      updateAutoplay();
    }

    function hoverOff() {
      hoverCount = Math.max(0, hoverCount - 1);
      pauseByHover = hoverCount > 0;
      updateAutoplay();
    }

    [container, prevBtn, nextBtn].forEach((el) => {
      if (!el) return;
      el.addEventListener('mouseenter', hoverOn);
      el.addEventListener('mouseleave', hoverOff);
    });

    document.addEventListener('visibilitychange', updateAutoplay);
    startAutoplay();

    // Mousewheel scrolling
    let wheelEndTimer = null;

    const WHEEL_CFG = {
      axisRatio: 0.35,
      snapDelayMs: 140,
      maxStepPx: 80,
      speed: 1.0,
    };

    function snapToNearest() {
      const x = gsap.getProperty(proxy, 'x') || 0;
      const snapped = Math.round(x / slideWidth) * slideWidth;

      if (Math.abs(snapped - x) < 0.5) {
        didDrag = false;
        pauseByDrag = false;
        updateAutoplay();
        return;
      }

      gsap.to(proxy, {
        x: snapped,
        duration: 0.28,
        ease: 'power3.out',
        onUpdate: updateFromDrag,
        onComplete: () => {
          didDrag = false;
          pauseByDrag = false;
          updateAutoplay();
        },
      });
    }

    function onWheel(e) {
      if (!e.cancelable) return;

      let dx = e.deltaX || 0;
      let dy = e.deltaY || 0;

      if (Math.abs(dx) < 0.5 && e.shiftKey) dx = dy;
      if (Math.abs(dx) < Math.abs(dy) * WHEEL_CFG.axisRatio) return;

      e.preventDefault();
      e.stopPropagation();

      pauseByDrag = true;
      updateAutoplay();
      didDrag = true;

      dx = Math.max(-WHEEL_CFG.maxStepPx, Math.min(WHEEL_CFG.maxStepPx, dx));

      gsap.killTweensOf(proxy);
      gsap.set(proxy, { x: (gsap.getProperty(proxy, 'x') || 0) - dx * WHEEL_CFG.speed });

      updateFromDrag();

      clearTimeout(wheelEndTimer);
      wheelEndTimer = setTimeout(snapToNearest, WHEEL_CFG.snapDelayMs);
    }

    container.addEventListener('wheel', onWheel, { passive: false, capture: true });

    // Set cursor to pointer
    container.style.cursor = 'pointer';

    // Draggable
    Draggable.create(proxy, {
      type: 'x',
      trigger: container,
      inertia: true,
      // dragClickables: true,
      maxDuration: 0.6,
      throwResistance: 4000,

      onPress() {
        pauseByDrag = true;
        updateAutoplay();
        didDrag = false;
        pressX = this.x;
        gsap.killTweensOf(proxy);
        // container.style.cursor = 'grabbing';
      },

      onDrag() {
        if (Math.abs(this.x - pressX) > 6) didDrag = true;
        updateFromDrag();
      },

      onThrowUpdate: updateFromDrag,

      onRelease() {
        wrapSlides();
        container.style.cursor = 'pointer';
        setTimeout(() => {
          didDrag = false;
          pauseByDrag = false;
          updateAutoplay();
        }, 0);
      },

      snap: { x: (value) => Math.round(value / slideWidth) * slideWidth },
    });

    // Resize handler
    window.addEventListener(
      'resize',
      () => {
        slideWidth = slides[0].offsetWidth;
        smallWidth = slideWidth * 0.5;
        gsap.set(proxy, { x: -currentIndex * slideWidth });
        positionSlides(true);
      },
      { passive: true }
    );

    state.inited.profiles = true;
  }

  // ===========================================================================
  // STEPS ANIMATION (LOTTIE + SCROLL)
  // ===========================================================================
  function initStepsScrollAndLottie() {
    if (state.inited.steps) return;
    if (
      typeof gsap === 'undefined' ||
      typeof ScrollTrigger === 'undefined' ||
      typeof lottie === 'undefined'
    )
      return;

    const stepsRoot = document.querySelector('.br__steps-wr');
    if (!stepsRoot) return;

    const line = document.querySelector('.br__steps_line');
    const pointer = document.querySelector('.br__steps_line-pointer');

    const linePoints = {
      1: document.querySelector('.br__steps_line-point.is-01'),
      2: document.querySelector('.br__steps_line-point.is-02'),
      3: document.querySelector('.br__steps_line-point.is-03'),
    };

    function getPointerTopForStep(step) {
      if (!line || !pointer || !linePoints[step]) return null;

      const lineRect = line.getBoundingClientRect();
      const ptRect = linePoints[step].getBoundingClientRect();

      const pointerH = pointer.offsetHeight || 0;
      const ptCenterY = ptRect.top - lineRect.top + ptRect.height / 2;

      return ptCenterY - pointerH / 2;
    }

    const pointerTo = pointer
      ? gsap.quickTo(pointer, 'top', {
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      : null;

    let rafId = null;
    function cancelFollow() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    function followPointerToStep(step, followMs = 300) {
      if (!pointerTo) return;
      cancelFollow();

      const start = performance.now();

      const tick = () => {
        const target = getPointerTopForStep(step);
        if (target != null) pointerTo(target);

        if (performance.now() - start < followMs) {
          rafId = requestAnimationFrame(tick);
        } else {
          rafId = null;
          const finalTarget = getPointerTopForStep(step);
          if (finalTarget != null) pointerTo(finalTarget);
        }
      };

      rafId = requestAnimationFrame(tick);
    }

    // Track loaded Lottie animations
    const loadedLotties = {
      footerDesktop: false,
      footerMobile: false,
      step1: false,
      step3: false,
      mobileStep1: false,
      mobileStep3: false,
    };

    let lottieStep1 = null;
    let lottieStep3 = null;

    // Track previous step to detect direction changes
    let previousStep = null;

    const asset01 = document.querySelector('.br__steps-asset-wr.is-01');
    const asset02 = document.querySelector('.br__steps-asset-wr.is-02');
    const asset03 = document.querySelector('.br__steps-asset-wr.is-03');
    const step2Videos = document.querySelectorAll('.step-02-video');

    // Initialize HLS for all step 2 videos if they have an HLS source
    const step2HlsInstances = [];
    step2Videos.forEach((video) => {
      const { src } = video.dataset;
      if (src) {
        const hlsInstance = initHlsVideo(video, src, {
          autoplay: false,
          startHighQuality: true,
        });
        if (hlsInstance) {
          step2HlsInstances.push(hlsInstance);
        }
      }
    });

    // Lazy load footer Lottie animations
    const footerDesktopContainer = document.querySelector('.br__footer-heading.is-des');
    if (footerDesktopContainer) {
      ScrollTrigger.create({
        trigger: footerDesktopContainer,
        start: 'top bottom+=300px',
        once: true,
        onEnter: () => {
          if (!loadedLotties.footerDesktop) {
            lottie.loadAnimation({
              container: footerDesktopContainer,
              renderer: 'svg',
              loop: true,
              autoplay: true,
              path: LOTTIE_URLS.footerDesktop,
            });
            loadedLotties.footerDesktop = true;
          }
        },
      });
    }

    const footerMobileContainer = document.querySelector('.br__footer-heading.is-mob');
    if (footerMobileContainer) {
      ScrollTrigger.create({
        trigger: footerMobileContainer,
        start: 'top bottom+=300px',
        once: true,
        onEnter: () => {
          if (!loadedLotties.footerMobile) {
            lottie.loadAnimation({
              container: footerMobileContainer,
              renderer: 'svg',
              loop: true,
              autoplay: true,
              path: LOTTIE_URLS.footerMobile,
            });
            loadedLotties.footerMobile = true;
          }
        },
      });
    }

    // Lazy load step Lottie animations (desktop)
    const step1Container = document.querySelector('.br__steps-asset-wr.is-01');
    if (step1Container) {
      ScrollTrigger.create({
        trigger: '.br__steps-wr',
        start: 'top bottom',

        once: true,
        onEnter: () => {
          if (!loadedLotties.step1) {
            lottieStep1 = lottie.loadAnimation({
              container: step1Container,
              renderer: 'svg',
              loop: false,
              autoplay: false,
              path: LOTTIE_URLS.step1,
            });
            loadedLotties.step1 = true;
          }
        },
      });
    }

    const step3Container = document.querySelector('.br__steps-asset-wr.is-03');
    if (step3Container) {
      ScrollTrigger.create({
        trigger: '.br__steps-wr',
        start: 'top bottom',
        once: true,
        onEnter: () => {
          if (!loadedLotties.step3) {
            lottieStep3 = lottie.loadAnimation({
              container: step3Container,
              renderer: 'svg',
              loop: false,
              autoplay: false,
              path: LOTTIE_URLS.step3,
            });
            loadedLotties.step3 = true;
          }
        },
      });
    }

    // Lazy load mobile step animations - play once when scrolled into view
    const mobileStep1Container = document.querySelector('.br__steps-asset-mobile-wr.is-01');
    if (mobileStep1Container) {
      ScrollTrigger.create({
        trigger: mobileStep1Container,
        start: 'center bottom',
        once: true,
        onEnter: () => {
          if (!loadedLotties.mobileStep1) {
            const mobileStep1Anim = lottie.loadAnimation({
              container: mobileStep1Container,
              renderer: 'svg',
              loop: false,
              autoplay: true,
              path: LOTTIE_URLS.step1,
            });
            loadedLotties.mobileStep1 = true;
          }
        },
      });
    }

    // Lazy load mobile step animations - play once when scrolled into view
    const mobileStep2Container = document.querySelector('.br__steps-asset-mobile-wr.is-02');
    if (mobileStep2Container) {
      ScrollTrigger.create({
        trigger: mobileStep2Container,
        start: 'center bottom',
        once: true,
        onEnter: () => {
          step2Videos[1].play();
        },
      });
    }

    const mobileStep3Container = document.querySelector('.br__steps-asset-mobile-wr.is-03');
    if (mobileStep3Container) {
      ScrollTrigger.create({
        trigger: mobileStep3Container,
        start: 'center bottom',
        once: true,
        onEnter: () => {
          if (!loadedLotties.mobileStep3) {
            const mobileStep3Anim = lottie.loadAnimation({
              container: mobileStep3Container,
              renderer: 'svg',
              loop: false,
              autoplay: true,
              path: LOTTIE_URLS.step3,
            });
            loadedLotties.mobileStep3 = true;
          }
        },
      });
    }

    let activeStep = null;
    let stepsST = null;

    function killStepsST() {
      if (stepsST) {
        stepsST.kill();
        stepsST = null;
      }
      cancelFollow();
    }

    function initStepsST() {
      killStepsST();
      if (window.innerWidth <= 767) return;

      let height = document.querySelector('.br__steps-asset-wr.is-01').clientHeight;

      stepsST = ScrollTrigger.create({
        trigger: '.br__steps-wr',
        start: `${height / 2 + 160}px bottom`,
        end: 'bottom bottom',
        scrub: 1.5,
        markers: false,
        onUpdate: (self) => {
          const { progress } = self;
          const items = document.querySelectorAll('.br__step-item_desckription-wr');

          function setActiveDesc(index) {
            items.forEach((el) => el.classList.remove('is-active'));
            items[index]?.classList.add('is-active');
          }

          let newStep;

          if (progress < 0.45) {
            newStep = 1;
            gsap.to('.bg-stes-video-tab-bg', { x: '-4rem', duration: 0.4, ease: 'power2.out' });
            setActiveDesc(0);
          } else if (progress < 0.9) {
            newStep = 2;
            gsap.to('.bg-stes-video-tab-bg', { x: '0rem', duration: 0.4, ease: 'power2.out' });
            setActiveDesc(1);
          } else if (progress < 1) {
            newStep = 3;
            gsap.to('.bg-stes-video-tab-bg', { x: '4rem', duration: 0.4, ease: 'power2.out' });
            setActiveDesc(2);
          } else {
            // After 90%, keep step 3 active but allow natural unsticking
            newStep = 3;
          }

          if (newStep !== activeStep) {
            previousStep = activeStep;
            activeStep = newStep;
            followPointerToStep(activeStep, 300);

            // Pause and reset all step 2 videos
            step2Videos[0].pause();
            step2Videos[0].currentTime = 0;

            // Stop all animations
            if (lottieStep1) lottieStep1.stop();
            if (lottieStep3) lottieStep3.stop();

            // Play animations from start whenever entering a step
            if (activeStep === 1 && lottieStep1) {
              lottieStep1.goToAndPlay(0, true);
            }
            if (activeStep === 2) {
              // Play all step 2 videos
              step2Videos[0].play();
            }
            if (activeStep === 3 && lottieStep3) {
              lottieStep3.goToAndPlay(0, true);
            }

            asset01?.classList.remove('is-active');
            asset02?.classList.remove('is-active');
            asset03?.classList.remove('is-active');

            if (activeStep === 1) asset01?.classList.add('is-active');
            if (activeStep === 2) asset02?.classList.add('is-active');
            if (activeStep === 3) asset03?.classList.add('is-active');
          }
        },
      });

      const initialTop = getPointerTopForStep(activeStep || 1);
      if (initialTop != null && pointerTo) pointerTo(initialTop);
      followPointerToStep(activeStep || 1, 300);
    }

    initStepsST();
    window.addEventListener('resize', () => initStepsST(), { passive: true });

    state.inited.steps = true;
  }

  // ===========================================================================
  // DOTS CARDS ANIMATION
  // ===========================================================================
  function initDotsCards() {
    if (state.inited.dots) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const trigger = document.querySelector('.br__grid-abs-wr');
    if (!trigger) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 992px)', () => {
      gsap.set('.br__dots-card.is-00', { scale: 0.6 });
      gsap.set('.br__dots-card.is-01', { scale: 0.8 });
      gsap.set('.br__dots-card.is-02', { scale: 1 });
      gsap.set('.br__dots-card.is-03', { scale: 0.8 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.br__grid-abs-wr',
          start: 'top 75%',
          markers: false,
          toggleActions: 'play none none none',
        },
      });

      tl.to(
        '.br__dots-card.is-00',
        { x: '40rem', y: '-45rem', scale: 0.8, duration: 1.4, ease: 'power3.out' },
        0
      )
        .to(
          '.br__dots-card.is-01',
          { x: '30rem', y: '-18rem', scale: 1, duration: 1.4, ease: 'power3.out' },
          0
        )
        .to(
          '.br__dots-card.is-02',
          { x: '32rem', y: '-8rem', scale: 0.8, duration: 1.4, ease: 'power3.out' },
          0
        )
        .to(
          '.br__dots-card.is-03',
          { x: '32rem', scale: 0.6, duration: 1.4, ease: 'power3.out' },
          0
        );

      return () => tl.kill();
    });

    state.inited.dots = true;
  }

  // ===========================================================================
  // HLS VIDEO HELPER
  // ===========================================================================
  function initHlsVideo(videoElement, hlsSrc, options = {}) {
    if (!videoElement || !hlsSrc) return null;

    const { autoplay = true, startHighQuality = true } = options;

    // Remove loop attribute to prevent re-fetching segments
    const shouldLoop = videoElement.hasAttribute('loop');
    if (shouldLoop) {
      videoElement.removeAttribute('loop');
    }

    // Check if HLS.js is supported
    if (Hls.isSupported()) {
      const hlsConfig = {
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 600, // Keep up to 10 minutes of video in buffer
        maxMaxBufferLength: 600,
      };

      // Add high quality settings if requested
      if (startHighQuality) {
        hlsConfig.startLevel = -1;
        hlsConfig.capLevelToPlayerSize = false;
        hlsConfig.abrEwmaDefaultEstimate = 5000000;
      }

      const hls = new Hls(hlsConfig);

      hls.loadSource(hlsSrc);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        // Force start at highest quality level if requested
        if (startHighQuality) {
          const highestLevel = data.levels.length - 1;
          hls.startLevel = highestLevel;
          hls.currentLevel = highestLevel;
        }

        // Auto-play if requested
        if (autoplay) {
          videoElement.play().catch((e) => {
            console.warn('Video autoplay prevented:', e);
          });
        }
      });

      // Handle looping without re-fetching segments
      if (shouldLoop) {
        videoElement.addEventListener('ended', () => {
          videoElement.currentTime = 0;
          videoElement.play().catch((e) => {
            console.warn('Video loop replay prevented:', e);
          });
        });
      }

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('Fatal HLS error:', data);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      return hls;
    }
    if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoElement.src = hlsSrc;

      // Handle looping without re-fetching segments
      if (shouldLoop) {
        videoElement.addEventListener('ended', () => {
          videoElement.currentTime = 0;
          videoElement.play().catch((e) => {
            console.warn('Video loop replay prevented:', e);
          });
        });
      }

      if (autoplay) {
        videoElement.addEventListener('loadedmetadata', () => {
          videoElement.play().catch((e) => {
            console.warn('Video autoplay prevented:', e);
          });
        });
      }
      return null;
    }

    return null;
  }

  // ===========================================================================
  // HERO HLS VIDEO
  // ===========================================================================
  function initHeroVideo() {
    if (state.inited.heroVideo) return;

    const videoElement = document.querySelector('.br__hero-video');
    if (!videoElement) return;

    const { src } = videoElement.dataset;
    if (!src) return;

    initHlsVideo(videoElement, src, {
      autoplay: true,
      startHighQuality: true,
    });

    document
      .querySelectorAll('.br__embed-video-wr.is-load')
      .forEach((el) => el.classList.remove('is-load'));
    state.inited.heroVideo = true;
  }

  // ===========================================================================
  // VIDEO LINES (SCROLLING BACKGROUND VIDEOS)
  // ===========================================================================
  function initVideoLines() {
    if (state.inited.videoLines) return;

    const lines = document.querySelectorAll('.br__vdieos-lines-wr');
    if (!lines.length) return;

    lines.forEach((line, index) => {
      const collections = line.querySelectorAll('.br__vdieos-lines-collection');
      if (collections.length < 2) return;

      const videos = line.querySelectorAll('.br__vdieos-line__item video');
      const singleWidth = collections[0].offsetWidth;
      if (!singleWidth) return;

      const direction = index === 0 ? 1 : -1;
      let animation = null;
      let videosLoaded = false;

      // Function to load and play videos
      const loadVideos = () => {
        if (videosLoaded) return;
        videosLoaded = true;

        videos.forEach((video) => {
          const dataSrc = video.dataset.src;
          if (!dataSrc) return;

          // Check if this is an HLS video (m3u8 file)
          if (dataSrc.includes('.m3u8')) {
            // Remove loop attribute to prevent re-fetching
            if (video.hasAttribute('loop')) {
              video.removeAttribute('loop');
            }

            if (Hls.isSupported()) {
              const hlsConfig = {
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90,
                maxBufferLength: 600,
                maxMaxBufferLength: 600,
              };

              const hls = new Hls(hlsConfig);
              hls.loadSource(dataSrc);
              hls.attachMedia(video);

              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
              });

              // Handle looping
              video.addEventListener('ended', () => {
                video.currentTime = 0;
                video.play().catch(() => {});
              });

              hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                  console.error('Fatal HLS error:', data);
                  switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      hls.startLoad();
                      break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      hls.recoverMediaError();
                      break;
                    default:
                      hls.destroy();
                      break;
                  }
                }
              });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              // Native HLS support (Safari)
              video.src = dataSrc;
              video.addEventListener('loadedmetadata', () => {
                video.play().catch(() => {});
              });

              video.addEventListener('ended', () => {
                video.currentTime = 0;
                video.play().catch(() => {});
              });
            }
          } else {
            // Handle regular video sources (non-HLS)
            const sources = video.querySelectorAll('source[data-src]');

            if (sources.length) {
              sources.forEach((source) => {
                const realSrc = source.getAttribute('data-src');
                if (realSrc && !source.getAttribute('src')) {
                  source.setAttribute('src', realSrc);
                }
              });
              video.load();
            } else if (!video.src) {
              video.src = dataSrc;
              video.load();
            }

            video.play().catch(() => {});
          }
        });
      };

      // Function to start animation
      const startAnimation = () => {
        if (animation) {
          animation.play();
          return;
        }

        animation = gsap.fromTo(
          line,
          { x: 0 },
          {
            x: direction * singleWidth,
            duration: 60,
            ease: 'none',
            repeat: -1,
            paused: false,
          }
        );
      };

      // Function to pause animation
      const pauseAnimation = () => {
        if (animation) {
          animation.pause();
        }
      };

      // Use ScrollTrigger to control everything
      ScrollTrigger.create({
        trigger: line,
        start: 'top-=200px bottom', // Start when 200px before entering viewport
        end: 'bottom+=200px top', // End when 200px after leaving viewport
        // markers: false,
        onEnter: () => {
          loadVideos();
          startAnimation();
        },
        onEnterBack: () => {
          startAnimation();
        },
        onLeave: () => {
          pauseAnimation();
        },
        onLeaveBack: () => {
          pauseAnimation();
        },
      });
    });

    state.inited.videoLines = true;
  }

  // ===========================================================================
  // RIVE ANIMATIONS
  // ===========================================================================
  function initRiveAnimations() {
    const items = document.querySelectorAll('.br__grid-item');
    if (!items.length) return;

    const riveInstances = new Map();

    const loadCanvas = (canvas) => {
      if (riveInstances.has(canvas)) return;

      const src = canvas.dataset.riveSrc;
      if (!src) return;

      const smName = canvas.dataset.riveStateMachine;

      const opts = {
        src,
        canvas,
        autoplay: false,
        layout: new Layout({
          fit: Fit.Cover,
          alignment: Alignment.Center,
        }),
        onLoad: () => {
          inst.resizeDrawingSurfaceToCanvas();
          inst.pause();
        },
      };

      if (smName) {
        opts.stateMachines = [smName];
      }

      let inst;
      try {
        inst = new Rive(opts);
        riveInstances.set(canvas, inst);
      } catch (error) {
        console.error('Error loading Rive animation:', error);
      }
    };

    document.querySelectorAll('.rive-animation').forEach(loadCanvas);

    // Use ScrollTrigger to control Rive playback and animate grid items
    items.forEach((item) => {
      const canvas = item.querySelector('.rive-animation');
      if (!canvas) return;

      // Set initial state
      gsap.set(item, { opacity: 0, y: 40 });

      ScrollTrigger.create({
        trigger: item,
        start: 'center bottom',
        end: 'center top',
        markers: false,
        onEnter: () => {
          // Animate item in
          gsap.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
          });

          // Play Rive animation
          const inst = riveInstances.get(canvas);
          if (inst) inst.play();
        },
        onEnterBack: () => {
          // Animate item in
          gsap.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
          });

          // Play Rive animation
          const inst = riveInstances.get(canvas);
          if (inst) inst.play();
          //   // Play Rive animation when scrolling back
          //   const inst = riveInstances.get(canvas);
          //   if (inst) inst.play();
        },
        // onLeave: () => {
        //   // Pause Rive animation when leaving viewport
        //   const inst = riveInstances.get(canvas);
        //   if (inst) inst.pause();
        // },
        // onLeaveBack: () => {
        //   // Pause Rive animation when scrolling up past
        //   const inst = riveInstances.get(canvas);
        //   if (inst) inst.pause();
        // },
      });
    });
  }

  // ===========================================================================
  // MOBILE SEARCH
  // ===========================================================================
  function initMobileSearch() {
    const cta = document.querySelector('.mobile-cta-wr');
    const searchWr = document.querySelector('.mobile-search-wr');
    const hero = document.querySelector('.br__section.is-home_hero');
    const openBtn = document.querySelector('#find-mobile');
    const closeBtn = document.querySelector('.mobile-search-close');

    if (!cta || !searchWr || !hero) return;

    let searchOpen = false;
    let heroInView = true;

    const setCtaClosed = (closed) => cta.classList.toggle('is-close', !!closed);
    const setSearchClosed = (closed) => searchWr.classList.toggle('is-close', !!closed);

    // Hero scroll behavior
    const io = new IntersectionObserver(
      ([entry]) => {
        heroInView = !!entry.isIntersecting;
        if (!searchOpen) setCtaClosed(heroInView);
      },
      { threshold: 0.2 }
    );

    io.observe(hero);

    // Open search
    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchOpen = true;
        setCtaClosed(true);
        setSearchClosed(false);
      });
    }

    // Close search
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchOpen = false;
        setSearchClosed(true);
        setCtaClosed(heroInView);
      });
    }
  }

  // ===========================================================================
  // LOADING STATES
  // ===========================================================================
  function removeLoadingClasses() {
    document
      .querySelectorAll('.br__section.br__section.is-load')
      .forEach((el) => el.classList.remove('is-load'));
  }

  // ===========================================================================
  // MARQUEE ANIMATION
  // ===========================================================================
  function initMarqueeAnimation() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If user prefers reduced motion, don't animate
    if (prefersReducedMotion) {
      console.log('Marquee animation disabled: user prefers reduced motion');
      return;
    }

    const PIXELS_PER_SECOND_DESKTOP = 50; // Desktop speed
    const PIXELS_PER_SECOND_MOBILE = 25; // Mobile speed (slower)
    const isMobile = window.innerWidth <= 991;

    // Desktop marquee elements
    const marqueeElements = document.querySelectorAll('.br_sp-loop-wr');

    // Mobile marquee elements
    const mobileMarqueeElements = document.querySelectorAll('.br_d-loop-wr');

    // Animate desktop elements
    if (marqueeElements.length) {
      const speed = isMobile ? PIXELS_PER_SECOND_MOBILE : PIXELS_PER_SECOND_DESKTOP;

      marqueeElements.forEach((element) => {
        // Get the width of the element
        const elementWidth = element.offsetWidth;

        // Calculate duration based on width to maintain consistent speed
        // We need to move -50% (half the width), so divide by 2
        const distance = elementWidth / 2;
        const duration = distance / speed;

        // Create the animation
        gsap.fromTo(
          element,
          { x: 0 },
          {
            x: -distance,
            duration: duration,
            ease: 'none',
            repeat: -1,
            paused: false,
          }
        );
      });
    }

    // Animate mobile elements (only on mobile)
    if (isMobile && mobileMarqueeElements.length) {
      mobileMarqueeElements.forEach((container) => {
        // Get all .br_sp-rich children within this container
        const children = container.querySelectorAll('.br_sp-rich');

        if (children.length === 0) return;

        // Get the width of the first child (they should be identical)
        const childWidth = children[0].offsetWidth;

        // Calculate duration based on child width
        const distance = childWidth;
        const duration = distance / PIXELS_PER_SECOND_MOBILE;

        // Animate each child
        children.forEach((child) => {
          gsap.fromTo(
            child,
            { x: 0 },
            {
              x: -distance,
              duration: duration,
              ease: 'none',
              repeat: -1,
              paused: false,
            }
          );
        });
      });
    }
  }

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================
  function initLightweightFeatures() {
    initMenu();
    initHeaderDarkMode();
    initStepPointers();
    initNavSearch();
    initMarqueeAnimation();
  }

  async function initHeavyFeatures() {
    const needSwiper = !!document.querySelector(
      '.swiper.br__blog, .swiper.br__quotes, .swiper.br__slide-m-wr, .swiper.is-blue-cards'
    );
    const hasProfiles = !!document.querySelector('.swiper.is-br__profiles');
    const hasSteps = !!document.querySelector('.br__steps-wr');
    const hasDots = !!document.querySelector('.br__grid-abs-wr');
    const hasVideoLines = !!document.querySelector('.br__vdieos-lines-wr');
    const hasHeroVideo = !!document.querySelector('.br__hero-video');

    // Initialize Swipers
    if (needSwiper) {
      onIdle(() => {
        try {
          initAllSwipers();
          initMobileSwiper();
          initBlueCardsSwiper();

          const onResize = () => {
            initMobileSwiper();
            initBlueCardsSwiper();
          };

          window.addEventListener('resize', onResize, { passive: true });
        } catch (e) {
          console.error(e);
        }
      }, 600);
    }

    // Initialize GSAP animations
    if (hasSteps || hasDots || hasProfiles) {
      onIdle(() => {
        try {
          if (hasDots) initDotsCards();
        } catch (e) {
          console.error(e);
        }
      }, 900);
    }

    // Initialize Profiles
    if (hasProfiles) {
      onIdle(() => {
        try {
          initProfilesDraggable();
        } catch (e) {
          console.error(e);
        }
      }, 1200);
    }

    // Initialize Steps & Lottie
    if (hasSteps) {
      onIdle(() => {
        try {
          initStepsScrollAndLottie();
        } catch (e) {
          console.error(e);
        }
      }, 1500);
    }

    // Initialize Hero Video
    if (hasHeroVideo) {
      onIdle(() => {
        try {
          initHeroVideo();
        } catch (e) {
          console.error(e);
        }
      }, 300);
    }

    // Initialize Video Lines
    if (hasVideoLines) {
      onIdle(() => {
        try {
          initVideoLines();
        } catch (e) {
          console.error(e);
        }
      }, 800);
    }
  }

  // ===========================================================================
  // BOOT SEQUENCE
  // ===========================================================================
  initLightweightFeatures();
  initHeavyFeatures();

  initRiveAnimations();
  initMobileSearch();

  // Remove loading states
  window.addEventListener('load', removeLoadingClasses, { once: true });
});
