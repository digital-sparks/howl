import Swiper from 'swiper';
import { Keyboard, Mousewheel } from 'swiper/modules';

window.Webflow ||= [];
window.Webflow.push(() => {
  // ————— Testimonials Swiper ————— //
  testimonialsCarousel = new Swiper(`.testimonials_swiper-wrapper`, {
    modules: [Keyboard, Mousewheel],
    wrapperClass: 'testimonials_swiper-list',
    slideClass: 'testimonials_swiper-item',
    direction: 'horizontal',
    spaceBetween: 24,
    slidesPerView: 'auto',
    grabCursor: true,
    speed: 400,
    autoHeight: true,
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    breakpoints: {
      768: {
        autoHeight: false,
      },
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
  // ————— Testimonials Swiper ————— //
});
