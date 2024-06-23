import Swiper from 'swiper';
import { Keyboard, Mousewheel } from 'swiper/modules';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

window.Webflow ||= [];
window.Webflow.push(() => {
  // ————— Career Swiper ————— //
  let careerCarouselInitialized = false,
    careerCarousel;
  const careerCarouselClasNames = ['career_component', 'career_wrapper', 'career_item'];

  function initCareerCarousel() {
    if (window.innerWidth <= 767) {
      if (!careerCarouselInitialized) {
        careerCarousel = new Swiper(`.${careerCarouselClasNames[0]}`, {
          modules: [Keyboard, Mousewheel],
          wrapperClass: careerCarouselClasNames[1],
          slideClass: careerCarouselClasNames[2],
          direction: 'horizontal',
          spaceBetween: 16,
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
      }
    } else if (careerCarouselInitialized) {
      careerCarousel.destroy(true, true);
      careerCarouselInitialized = false;
    }
  }

  initCareerCarousel();
  window.addEventListener('resize', initCareerCarousel);
  // ————— Career Swiper ————— //
});
