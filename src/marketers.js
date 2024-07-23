import Swiper from 'swiper';
import { Keyboard, Mousewheel, Autoplay } from 'swiper/modules';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

window.Webflow ||= [];
window.Webflow.push(() => {
  // ————— Hero Marquee Filters ————— //
  const tags = document.querySelectorAll('.hero-swiper_filters-item .tag');
  const wraps = document.querySelectorAll('.hero-swiper_wrap');

  tags[0].classList.add('is-color-inverse');

  tags.forEach((tag, index) => {
    tag.addEventListener('click', function () {
      tags.forEach((t) => t.classList.remove('is-color-inverse'));
      this.classList.add('is-color-inverse');

      wraps.forEach((wrap) => gsap.to(wrap, { opacity: 0, pointerEvents: 'none', duration: 0.3 }));
      gsap.to(wraps[index], { opacity: 1, pointerEvents: 'auto', duration: 0.3 });
    });
  });
  // ————— Hero Marquee Filters ————— //

  // ————— Tools for Growing Faster ————— //
  gsap.utils.toArray('.growing_row').forEach((row) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: row,
          start: 'top bottom',
          end: 'top top',
          // toggleActions: 'play none none reset',
          // markers: true,
        },
      })
      .from(row.querySelector('img'), {
        opacity: 0,
        scale: 0.95,
        delay: 0.15,
        transformOrigin: 'bottom',
        duration: 0.5,
        ease: 'power2.inOut',
      })
      .from(
        row.querySelector('.text-tag > .background-color-medium-light-grey'),
        {
          scaleX: 0,
          delay: 0.25,
          transformOrigin: 'left center',
          duration: 0.7,
          ease: 'power2.out',
        },
        '<'
      );
  });
  // ————— Tools for Growing Faster ————— //

  // ————— Testimonials Swiper ————— //
  testimonialsCarousel = new Swiper(`.testimonials_swiper-wrapper`, {
    modules: [Keyboard, Mousewheel, Autoplay],
    wrapperClass: 'testimonials_swiper-list',
    slideClass: 'testimonials_swiper-item',
    direction: 'horizontal',
    spaceBetween: 24,
    slidesPerView: 'auto',
    grabCursor: true,
    speed: 500,
    autoHeight: true,
    loop: true,
    centeredSlides: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: true,
      pauseOnMouseEnter: true,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    breakpoints: {
      768: {
        autoHeight: false,
        speed: 650,
      },
      480: {
        speed: 500,
      },
    },
    mousewheel: {
      enabled: true,
      forceToAxis: true,
      releaseOnEdges: true,
    },

    on: {
      beforeInit: (swiper) => {
        swiper.wrapperEl.querySelectorAll('.w-dyn-item').forEach((slide) => {
          swiper.wrapperEl.append(slide.cloneNode(true));
        });

        swiper.wrapperEl.style.gridColumnGap = 'unset';
      },
      afterInit: (swiper) => {
        swiper.autoplay.pause();
        ScrollTrigger.create({
          trigger: swiper.wrapperEl,
          start: 'bottom 75%',
          once: true,
          onEnter: () => {
            swiper.slideNext();
            swiper.autoplay.start();
          },
        });

        // Media query check
        const mq = window.matchMedia('(min-width: 992px)');

        function handleHoverEffects(e) {
          if (e.matches) {
            // Apply hover effects for screens 992px and above
            swiper.slides.forEach((slide) => {
              const borderRadius = gsap.getProperty(slide, 'borderRadius') / 16,
                animationDuration = 0.25,
                animationEase = 'power2.out';

              slide.addEventListener('mouseenter', () => {
                gsap.to(slide, {
                  borderRadius: `${borderRadius * 1.625}rem`,
                  scale: 0.975,
                  duration: animationDuration,
                  ease: animationEase,
                });
              });

              slide.addEventListener('mouseleave', () => {
                gsap.to(slide, {
                  borderRadius: `${borderRadius}rem`,
                  scale: 1,
                  duration: animationDuration / 1.25,
                  ease: animationEase,
                });
              });
            });
          } else {
            // Remove hover effects for screens below 992px
            swiper.slides.forEach((slide) => {
              slide.removeEventListener('mouseenter', null);
              slide.removeEventListener('mouseleave', null);
              gsap.set(slide, { clearProps: 'all' });
            });
            gsap.set(swiper.slides, { clearProps: 'all' });
          }
        }

        // Initial check
        handleHoverEffects(mq);

        // Add listener for window resize
        mq.addListener(handleHoverEffects);
      },
    },
  });

  // ————— Testimonials Swiper ————— //
});
