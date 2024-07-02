import Swiper from 'swiper';
import { Keyboard, Mousewheel } from 'swiper/modules';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

window.Webflow ||= [];
window.Webflow.push(() => {
  console.log('hello');

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
  // ————— Testimonials Swiper ————— //
});
