import Swiper from 'swiper';
import { Keyboard, Mousewheel, Parallax } from 'swiper/modules';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

window.Webflow ||= [];
window.Webflow.push(() => {
  // ————— Team Swiper ————— //
  const testimonialsCarousel = new Swiper('.team_swiper-wrapper', {
    modules: [Keyboard, Mousewheel, Parallax],
    wrapperClass: 'team_swiper-list',
    slideClass: 'team_swiper-item',
    direction: 'horizontal',
    spaceBetween: 16,
    slidesPerView: 'auto',
    grabCursor: true,
    parallax: true,
    speed: 250,
    breakpoints: {
      991: {
        spaceBetween: 40,
      },
    },
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
      beforeInit: (swiper) => {
        swiper.wrapperEl.style.gridColumnGap = 'unset';
      },
    },
  });
  // ————— Team Swiper ————— //

  // ————— Company News Item Hover ————— //

  const animConfig = { duration: 0.35, ease: 'power2.out' };
  const newsItems = document.querySelectorAll('.news_item');

  newsItems.forEach((item) => {
    const [link, image] = item.querySelectorAll('a, .news_image');

    // Get the computed style and parse the border-radius
    const borderRadiusString = window.getComputedStyle(link).borderRadius;
    const defaultBorderRadius = parseFloat(borderRadiusString) / 16;

    // Create a timeline for each item
    const tl = gsap
      .timeline({ paused: true })
      .to(link, {
        borderRadius: `${defaultBorderRadius * 1.375}rem`,
        scale: 0.98,
      })
      .fromTo(image, { scale: 1.04 }, { scale: 1, transformOrigin: 'center center' }, '<');

    function animateOpacity(hovered) {
      gsap.to('.news_item img', {
        opacity: hovered ? 0.75 : 1,
        ...animConfig,
        delay: hovered ? 0 : 0.075,
        overwrite: true,
      });

      if (hovered) {
        gsap.to(item.querySelector('img'), {
          opacity: 1,
          ...animConfig,
        });
      }
    }

    item.addEventListener('mouseenter', () => {
      animateOpacity(true);
      gsap.to(tl, {
        time: tl.duration(),
        ...animConfig,
        overwrite: true,
      });
    });

    item.addEventListener('mouseleave', () => {
      animateOpacity(false);
      gsap.to(tl, {
        delay: 0.075,
        time: 0,
        duration: animConfig.duration / 1.5,
        ease: animConfig.ease,
        overwrite: true,
      });
    });
  });

  // ————— Company News Item Hover ————— //
});
