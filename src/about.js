import Swiper from 'swiper';
import { Keyboard, Mousewheel, Parallax } from 'swiper/modules';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

window.Webflow ||= [];
window.Webflow.push(() => {
  // ————— Team Swiper ————— //
  testimonialsCarousel = new Swiper(`.team_swiper-wrapper`, {
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

  document.querySelectorAll('.news_item').forEach((item) => {
    const link = item.querySelector('a');
    const image = item.querySelector('.news_image');
    const defaultBorderRadius = gsap.getProperty(link, 'borderRadius') / 16;
    const animationDuration = 0.35;
    const animationEase = 'power2.out';

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
        duration: animationDuration,
        ease: animationEase,
        delay: hovered ? 0 : 0.075,
        overwrite: true,
      });

      if (hovered) {
        gsap.to(item.querySelector('img'), {
          opacity: 1,
          duration: animationDuration,
          ease: animationEase,
        });
      }
    }

    item.addEventListener('mouseenter', () => {
      animateOpacity(true);
      gsap.to(tl, {
        time: tl.duration(),
        duration: animationDuration,
        ease: animationEase,
        overwrite: true,
      });
    });

    item.addEventListener('mouseleave', () => {
      animateOpacity(false);
      gsap.to(tl, {
        delay: 0.075,
        time: 0,
        duration: animationDuration / 1.5,
        ease: animationEase,
        overwrite: true,
      });
    });
  });
  // ————— Company News Item Hover ————— //

  // ————— Company News Item Hover ————— //

  // ————— Mission Text Size ————— //
  // let toSize;
  // const mm = gsap.matchMedia();

  // mm.add('(min-width: 962px)', () => {
  //   toSize = '7.375rem';
  //   missionAnimation(toSize);
  // });

  // mm.add('(max-width: 991px) and (min-width: 768px)', () => {
  //   toSize = '5rem';
  //   missionAnimation(toSize);
  // });

  // mm.add('(max-width: 767px)', () => {
  //   toSize = '3.375rem';
  //   missionAnimation(toSize);
  // });

  // function missionAnimation(toSize) {
  //   const headingSpan = $('.mission_component').find('.heading-span');
  //   gsap
  //     .timeline({
  //       scrollTrigger: {
  //         trigger: $('.mission_component'),
  //         start: 'top 70%',
  //         end: 'top bottom',
  //       },
  //     })
  //     .to(headingSpan, { fontSize: toSize, duration: 1 });
  // }
  // ————— Mission Text Size ————— //
});
