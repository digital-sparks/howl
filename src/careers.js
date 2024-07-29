import Swiper from 'swiper';
import { Keyboard, Mousewheel } from 'swiper/modules';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

window.Webflow ||= [];
window.Webflow.push(() => {
  // ————— Career Swiper ————— //
  let careerCarouselInitialized = false,
    careerCarousel;
  const careerCarouselClassNames = {
    container: 'career_component',
    wrapper: 'career_wrapper',
    slide: 'career_item',
  };

  function initCareerCarousel() {
    const isMobile = window.innerWidth <= 767;
    if (isMobile && !careerCarouselInitialized) {
      careerCarousel = new Swiper(`.${careerCarouselClassNames.container}`, {
        modules: [Keyboard, Mousewheel],
        wrapperClass: careerCarouselClassNames.wrapper,
        slideClass: careerCarouselClassNames.slide,
        lazyPreloadPrevNext: 2,
        direction: 'horizontal',
        spaceBetween: 8,
        slidesPerView: 'auto',
        grabCursor: true,
        speed: 400,
        keyboard: {
          enabled: true,
          onlyInViewport: true,
        },
        mousewheel: {
          enabled: true,
          forceToAxis: true,
          releaseOnEdges: true,
        },
        on: {
          beforeInit: function () {
            $(this.wrapperEl).css('grid-column-gap', 'unset');
          },
          afterInit: function () {
            careerCarouselInitialized = true;
          },
        },
      });
    } else if (!isMobile && careerCarouselInitialized) {
      careerCarousel.destroy(true, true);
      careerCarouselInitialized = false;
    }
  }

  initCareerCarousel();

  let resizeTimer;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeTimer);
    resizeTimer = requestAnimationFrame(initCareerCarousel);
  });
  // ————— Career Swiper ————— //

  // ————— Career item Hover ————— //
  document.querySelectorAll('.career_item-link').forEach((item, index) => {
    const image = item.querySelector('.image-absolute'),
      defaultBorderRadius = gsap.getProperty(item, 'borderRadius') / 16,
      animationDuration = 0.35,
      animationEase = 'power2.out';

    const tl = gsap
      .timeline({ paused: true })
      .to(item, {
        borderRadius: `${defaultBorderRadius * 1.625}rem`,
        scale: 0.975,
      })
      .fromTo(
        image,
        { autoAlpha: 0, scale: 1.2 },
        {
          autoAlpha: 1,
          scale: 1,
        },
        '<'
      );

    item.addEventListener('mouseenter', () => {
      gsap.to(tl, {
        time: tl.duration(),
        duration: animationDuration,
        ease: animationEase,
        overwrite: true,
      });
    });

    item.addEventListener('mouseleave', () => {
      gsap.to(tl, {
        delay: 0.075,
        time: 0,
        duration: animationDuration / 1.5,
        ease: animationEase,
        overwrite: true,
      });
    });
  });

  // ————— Career item Hover ————— //
});
