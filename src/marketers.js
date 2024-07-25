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

  const handleTagClick = (index) => {
    tags.forEach((t) => t.classList.remove('is-color-inverse'));
    tags[index].classList.add('is-color-inverse');

    wraps.forEach((wrap, i) => {
      gsap.to(wrap, {
        opacity: i === index ? 1 : 0,
        pointerEvents: i === index ? 'auto' : 'none',
        duration: 0.3,
      });
    });
  };

  tags.forEach((tag, index) => {
    tag.addEventListener('click', () => handleTagClick(index));
  });
  // ————— Hero Marquee Filters ————— //

  // ————— Platform Swiper ————— //
  const baseConfig = {
    modules: [Keyboard, Mousewheel, Autoplay],
    direction: 'horizontal',
    grabCursor: true,
    loop: true,
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    mousewheel: {
      enabled: true,
      forceToAxis: true,
      releaseOnEdges: true,
    },
  };

  const platformCarousel = new Swiper('.platform_swiper-container', {
    ...baseConfig,
    wrapperClass: 'platform_swiper-wrapper',
    slideClass: 'platform_swiper-slide',
    spaceBetween: 32,
    slidesPerView: 'auto',
    speed: 500,
    autoplay: {
      delay: 5000,
      disableOnInteraction: true,
      pauseOnMouseEnter: false,
    },
    breakpoints: {
      768: {
        speed: 750,
      },
      480: {
        speed: 500,
      },
    },
    on: {
      afterInit: (swiper) => {
        swiper.autoplay.pause();
        ScrollTrigger.create({
          trigger: swiper.wrapperEl,
          start: 'bottom bottom',
          once: true,
          onEnter: () => {
            setTimeout(() => {
              swiper.slideNext();
              swiper.autoplay.start();
            }, 250);
          },
        });

        // Media query check
        const mq = window.matchMedia('(min-width: 992px)');

        function handleHoverEffects(e) {
          if (e.matches) {
            // Apply hover effects for screens 992px and above
            for (const slide of swiper.slides) {
              const animationDuration = 0.25,
                animationEase = 'power2.out',
                image = slide.querySelector('img');

              image.addEventListener('mouseenter', () => {
                gsap.to(image, {
                  scale: 0.975,
                  duration: animationDuration,
                  ease: animationEase,
                });
              });

              image.addEventListener('mouseleave', () => {
                gsap.to(image, {
                  scale: 1,
                  duration: animationDuration / 1.25,
                  ease: animationEase,
                });
              });
            }
          } else {
            // Remove hover effects for screens below 992px
            for (const slide of swiper.slides) {
              slide.removeEventListener('mouseenter', null);
              slide.removeEventListener('mouseleave', null);
              gsap.set(image, { clearProps: 'all' });
            }
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

  // ————— Platform Swiper ————— //

  // ————— Tools for Growing Faster ————— //
  gsap.utils.toArray('.growing_row').forEach((row) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: row,
          start: 'top bottom',
          end: 'top top',
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
  const testimonialsCarousel = new Swiper(`.testimonials_swiper-wrapper`, {
    ...baseConfig,
    wrapperClass: 'testimonials_swiper-list',
    slideClass: 'testimonials_swiper-item',
    spaceBetween: 24,
    slidesPerView: 'auto',
    speed: 500,
    autoHeight: true,
    centeredSlides: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: true,
      pauseOnMouseEnter: true,
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
    on: {
      beforeInit: (swiper) => {
        for (const slide of swiper.wrapperEl.querySelectorAll('.w-dyn-item')) {
          swiper.wrapperEl.append(slide.cloneNode(true));
        }

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
            for (const slide of swiper.slides) {
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
            }
          } else {
            // Remove hover effects for screens below 992px
            for (const slide of swiper.slides) {
              slide.removeEventListener('mouseenter', null);
              slide.removeEventListener('mouseleave', null);
              gsap.set(slide, { clearProps: 'all' });
            }
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
