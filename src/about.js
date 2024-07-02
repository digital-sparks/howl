import Swiper from 'swiper';
import { Keyboard, Mousewheel } from 'swiper/modules';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// bin/live-reload.js
new EventSource(`${'http://localhost:3000'}/esbuild`).addEventListener('change', () =>
  location.reload()
);

window.Webflow ||= [];
window.Webflow.push(() => {
  console.log('hello');

  // ————— Team Swiper ————— //
  testimonialsCarousel = new Swiper(`.team_swiper-wrapper`, {
    modules: [Keyboard, Mousewheel],
    wrapperClass: 'team_swiper-list',
    slideClass: 'team_swiper-item',
    direction: 'horizontal',
    spaceBetween: 16,
    slidesPerView: 'auto',
    grabCursor: true,
    speed: 400,
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
      beforeInit: function () {
        $(this.wrapperEl).css('grid-column-gap', 'unset');
      },
    },
  });
  // ————— Team Swiper ————— //
});
