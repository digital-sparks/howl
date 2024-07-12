import Swiper from 'swiper';
import { Keyboard, Mousewheel } from 'swiper/modules';
import gsap from 'gsap';

window.Webflow ||= [];
window.Webflow.push(() => {
  // ————— Hero Marquee Filters ————— //
  $('.hero-swiper_filters-item:first .tag').addClass('is-color-inverse');

  $('.hero-swiper_filters-item .tag').on('click', function () {
    $('.hero-swiper_filters-item .tag').removeClass('is-color-inverse');
    $(this).addClass('is-color-inverse');

    const filterIndex = $(this).closest('.hero-swiper_filters-item').index();

    $('.hero-swiper_wrap').each(function () {
      gsap.to($(this), { opacity: 0, pointerEvents: 'none', duration: 0.3 });
    });

    const filterWrap = $('.hero-swiper_wrap').eq(filterIndex);
    gsap.to(filterWrap, { opacity: 1, pointerEvents: 'auto', duration: 0.3 });
  });
  // ————— Hero Marquee Filters ————— //

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
