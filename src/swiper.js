import Swiper from 'swiper';
import { Autoplay, EffectCoverflow, Keyboard, Mousewheel, Navigation } from 'swiper/modules';

window.Webflow ||= [];
window.Webflow.push(() => {
  console.log('swiper');
  const swiper = new Swiper('.swiper', {
    // Changed from 'swiper' to '.swiper'
    wrapperClass: 'swiper-wrapper', // Removed the dot - should be just the class name
    slideClass: 'swiper-slide', // Changed from '.slide' to 'swiper-slide' and removed dot
    modules: [Navigation, EffectCoverflow, Mousewheel, Keyboard],
    // loop: true,
    grabCursor: true,
    spaceBetween: 32,
    slidesPerView: 'auto',
    touchEventsTarget: 'container',
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    on: {
      init: (swiper) => {
        swiper.wrapperEl.style.columnGap = 'unset';
      },
    },
  });
  console.log(swiper);
});
