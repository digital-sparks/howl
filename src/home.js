import Swiper from 'swiper';
import { Keyboard, Mousewheel, Autoplay } from 'swiper/modules';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// bin/live-reload.js
new EventSource(`${'http://localhost:3000'}/esbuild`).addEventListener('change', () =>
  location.reload()
);

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

  // ————— Products Swiper ————— //
  /*
  const productsSwiperSpeed = 8000;
  let productsSwiper = new Swiper('.products_swiper-wrapper', {
    modules: [Keyboard, Mousewheel, Autoplay],
    wrapperClass: 'products_swiper-list',
    slideClass: 'products_swiper-item',
    slidesPerView: 'auto',
    direction: 'horizontal',
    spaceBetween: 112,
    grabCursor: true,
    loop: true,
    loopedSlides: 10,
    loopAdditionalSlides: 10,
    speed: productsSwiperSpeed,
    autoplay: {
      delay: 0,
    },
    on: {
      beforeInit: function () {
        $(this.$wrapperEl).css({
          'grid-column-gap': 'unset',
          'transition-timing-function': 'linear',
        });
      },
      autoplayStop: function () {
        this.params.speed = 400;
        $(productsSwiper.$wrapperEl).css('transition-timing-function', 'ease');
      },
    },
  });

  $('.products_swiper-wrapper').on('mouseleave', function () {
    productsSwiper.params.speed = productsSwiperSpeed;
    $(productsSwiper.$wrapperEl).css('transition-timing-function', 'linear');
    productsSwiper.autoplay.start();
  });
  */
  // ————— Products Swiper ————— //

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
