import Swiper from 'swiper';
import { Keyboard, Mousewheel } from 'swiper/modules';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

  // ————— Mission Text Size ————— //
  let toSize;
  const mm = gsap.matchMedia();

  mm.add('(min-width: 962px)', () => {
    toSize = '7.375rem';
    missionAnimation(toSize);
  });

  mm.add('(max-width: 991px) and (min-width: 768px)', () => {
    toSize = '5rem';
    missionAnimation(toSize);
  });

  mm.add('(max-width: 767px)', () => {
    toSize = '3.375rem';
    missionAnimation(toSize);
  });

  function missionAnimation(toSize) {
    const headingSpan = $('.mission_component').find('.heading-span');
    gsap
      .timeline({
        scrollTrigger: {
          trigger: $('.mission_component'),
          start: 'top 70%',
          end: 'top bottom',
        },
      })
      .to(headingSpan, { fontSize: toSize, duration: 1 });
  }
  // ————— Mission Text Size ————— //

  // ————— News Hover ————— //
  gsap.set('.news_bg', { y: '100%' });

  $('.news_link').on('mouseenter mouseleave', function (event) {
    const $this = $(this);
    const $newsBg = $this.find('.news_bg');
    const offset = $this.offset();
    const height = $this.outerHeight();
    const mouseY = event.pageY - offset.top;

    if (event.type === 'mouseenter') {
      if (mouseY < height / 2) {
        // Mouse entered from the top half
        gsap.fromTo($newsBg, { y: '-100%' }, { y: '0%', duration: 0.5, ease: 'power1.out' });
      } else {
        // Mouse entered from the bottom half
        gsap.fromTo($newsBg, { y: '100%' }, { y: '0%', duration: 0.5, ease: 'power1.out' });
      }
    } else if (event.type === 'mouseleave') {
      gsap.fromTo(
        $newsBg,
        { y: '0%' },
        {
          y: '-100%',
          duration: 0.5,
          ease: 'power1.in',
          onComplete: function () {
            gsap.set($newsBg, { y: '100%' });
          },
        }
      );
    }
  });
  // ————— News Hover ————— //
});
