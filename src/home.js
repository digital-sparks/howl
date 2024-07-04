import Swiper from 'swiper';
import { Keyboard, Mousewheel, Autoplay } from 'swiper/modules';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

window.Webflow ||= [];
window.Webflow.push(() => {
  console.log('hello');

  // ————— Updates - New on Howl Swiper ————— //
  updatesCarousel = new Swiper(`.new_swiper-wrapper`, {
    modules: [Keyboard, Mousewheel],
    wrapperClass: 'new_swiper-list',
    slideClass: 'new_swiper-item',
    direction: 'horizontal',
    spaceBetween: 24,
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
    },
  });
  // ————— Updates - New on Howl Swiper ————— //

  // ————— Creator Spotlight Swiper ————— //
  spotlightCarousel = new Swiper(`.spotlight_swiper-wrapper`, {
    modules: [Keyboard, Mousewheel],
    wrapperClass: 'spotlight_swiper-list',
    slideClass: 'spotlight_swiper-item',
    direction: 'horizontal',
    spaceBetween: 24,
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
    },
  });
  // ————— Creator Spotlight Swiper ————— //
});
