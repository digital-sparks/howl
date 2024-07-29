import Swiper from 'swiper';
import { Keyboard, Mousewheel, Autoplay, Parallax } from 'swiper/modules';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrambleTextPlugin, SplitText, ScrollTrigger, CustomEase);

window.Webflow ||= [];
window.Webflow.push(() => {
  function heroAnimation() {
    // ————— Hero Animation ————— //
    const duration = 1.5,
      delay = 1.2,
      onceEvery = 2,
      customEase = 'power2.inOut',
      largeDelay = delay * (onceEvery + 1) + duration * onceEvery;

    // Rotations
    gsap.to('.home-hero_logo', {
      rotationY: -360,
      duration: duration,
      repeat: -1,
      delay: delay,
      repeatDelay: delay,
      ease: customEase,
    });

    // Hide/Show
    const logoItems = document.querySelectorAll('.home-hero_logo');
    const bgItems = document.querySelectorAll('.home-hero_span-item');
    const tagItems = document.querySelectorAll('.home-hero_tags-item');
    const videoItems = document.querySelectorAll('.home-hero_video-item');
    const totalItems = logoItems.length;
    let index = 0;

    gsap.set([logoItems, bgItems, tagItems, videoItems], { display: 'none' });
    gsap.set([logoItems[0], bgItems[0], tagItems[0], videoItems[0]], { display: 'block' });
    gsap.set(videoItems, { autoAlpha: 0 });
    gsap.set(videoItems[0], { autoAlpha: 1 });

    //.home-hero_tags-item,
    const rotationAnimation = gsap.to('.home-hero_heading-span, .home-hero_tags-item', {
      rotationY: -360,
      duration: duration,
      repeat: -1,
      delay: largeDelay,
      repeatDelay: largeDelay,
      ease: customEase,
      onUpdate: checkRotation,
      onRepeat: resetIndex,
    });

    let hasReached270 = false;

    function checkRotation() {
      const currentRotation = gsap.getProperty('.home-hero_heading-span', 'rotationY');
      if (currentRotation <= -270 && !hasReached270) {
        switchLogo();
        hasReached270 = true;
      }
    }

    function resetIndex() {
      hasReached270 = false;
    }

    function switchLogo() {
      gsap.set([logoItems[index], bgItems[index], tagItems[index]], { display: 'none' });
      gsap.to(videoItems[index], {
        autoAlpha: 0,
        duration: 0.5,
        onComplete: function () {
          gsap.set(this.targets(), { display: 'none' });
        },
      });

      gsap.set(
        [
          logoItems[(index + 1) % totalItems],
          bgItems[(index + 1) % totalItems],
          tagItems[(index + 1) % totalItems],
          videoItems[(index + 1) % totalItems],
        ],
        {
          display: 'block',
        }
      );
      gsap.to(videoItems[(index + 1) % totalItems], {
        autoAlpha: 1,
        duration: 0.5,
        onStart: function () {
          const video = this.targets()[0].querySelector('video');
          video.currentTime = 0;
          video.play();
        },
      });

      index = (index + 1) % totalItems;
    }
  }

  // start playing the initial video
  // Usage
  playVideoWhenReady('video#adidas');
  heroAnimation();

  // });

  function playVideoWhenReady(videoSelector) {
    const video = document.querySelector(videoSelector);

    if (!video) {
      console.error('Video element not found');
      return;
    }

    function attemptPlay() {
      if (video.readyState >= 4) {
        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video playback started successfully');
            })
            .catch((error) => {
              if (error.name === 'NotAllowedError') {
                console.log('Playback prevented by browser policy. User interaction required.');
                console.log(error);
                // You might want to show a play button or instructions to the user here
              } else {
                console.error('Error attempting to play video:', error);
              }
            });
        }
      } else {
        // Video is not ready yet, check again in a short while
        console.log('video did not start playback, checking again in 100 milliseconds');
        setTimeout(attemptPlay, 100);
      }
    }

    // Start checking if the video is ready
    attemptPlay();

    // Add event listener for iOS low-power mode
    video.addEventListener('loadedmetadata', () => {
      if (video.paused) {
        console.log('Video loaded but paused. User interaction may be required to play.');
        // You might want to show a play button or instructions to the user here
      }
    });
  }

  // ————— Hero Animation ————— //

  // ————— Hero Notifications ————— //
  const notificationsWrap = document.querySelector('.home-hero_notifications-wrap');
  const notifications = notificationsWrap.querySelectorAll('.home-hero_notification');
  const notificationHeight = notifications[0].offsetHeight;

  // Clone the first notification and append it to the end
  notificationsWrap.appendChild(notifications[0].cloneNode(true));

  let heroNotificationsTl = gsap.timeline({ repeat: -1, repeatDelay: 2 });

  notifications.forEach((notification, index) => {
    heroNotificationsTl.to(document.querySelectorAll('.home-hero_notification'), {
      y: `-=${notificationHeight}px`,
      duration: 0.8,
      ease: 'slow(0.7,0.7,false)',
      delay: index === 0 ? 1 : 3,
    });
  });
  // ————— Hero Notifications ————— //

  // ————— Updates - New on Howl Swiper ————— //
  updatesCarousel = new Swiper(`.new_swiper-wrapper`, {
    modules: [Keyboard, Mousewheel, Parallax],
    wrapperClass: 'new_swiper-list',
    slideClass: 'new_swiper-item',
    direction: 'horizontal',
    spaceBetween: 24,
    lazyPreloadPrevNext: 2,
    slidesPerView: 'auto',
    grabCursor: true,
    parallax: true,
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
      beforeInit: (swiper) => {
        swiper.wrapperEl.style.gridColumnGap = 'unset';
      },
    },
  });
  // ————— Updates - New on Howl Swiper ————— //

  // ————— Creator Spotlight Swiper ————— //
  spotlightCarousel = new Swiper(`.spotlight_swiper-wrapper`, {
    modules: [Keyboard, Mousewheel, Parallax],
    wrapperClass: 'spotlight_swiper-list',
    slideClass: 'spotlight_swiper-item',
    direction: 'horizontal',
    parallax: true,
    lazyPreloadPrevNext: 2,
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
      beforeInit: (swiper) => {
        swiper.wrapperEl.style.gridColumnGap = 'unset';
      },
    },
  });
  // ————— Creator Spotlight Swiper ————— //

  // ————— Creators Wanted Text ————— //

  let direction = 1; // 1 = downward, -1 = upward
  let roll1;
  let originalElement, cloneElement;

  function initRoll() {
    // Kill previous animation if it exists
    if (roll1) {
      roll1.kill();
    }

    roll1 = roll('.creators_bg-text-marquee', { duration: 15 });

    const scroll = ScrollTrigger.create({
      onUpdate(self) {
        if (self.direction !== direction) {
          direction *= -1;
          gsap.to(roll1, { timeScale: direction, overwrite: true });
        }
      },
    });

    // Start the animation
    roll1.play();
  }

  function roll(target, vars) {
    const tl = gsap.timeline({
      repeat: -1,
      onReverseComplete() {
        this.totalTime(this.rawTime() + this.duration() * 10);
      },
    });

    vars = vars || {};
    vars.ease || (vars.ease = 'none');

    originalElement = document.querySelector(target);
    cloneElement = originalElement.cloneNode(true);
    originalElement.parentNode.appendChild(cloneElement);

    updateElementPositions();

    tl.to([originalElement, cloneElement], { yPercent: -100, ...vars }, 0);

    return tl;
  }

  function updateElementPositions() {
    gsap.set(cloneElement, {
      position: 'absolute',
      top: originalElement.offsetTop + originalElement.offsetHeight,
      left: originalElement.offsetLeft,
    });
  }

  // Initialize the roll
  initRoll();

  // Store the initial window width
  let prevWindowWidth = window.innerWidth;

  // Add resize event listener
  window.addEventListener(
    'resize',
    debounce(() => {
      const currentWindowWidth = window.innerWidth;

      // Check if the width has changed
      if (currentWindowWidth !== prevWindowWidth) {
        updateElementPositions();
        roll1.restart();

        // Update the stored width
        prevWindowWidth = currentWindowWidth;
      }
    }, 5)
  );

  // Debounce function to limit how often the resize function is called
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ————— Creators Wanted Text ————— //

  const images = gsap.utils.toArray('.creators_gif-wrap img');
  const totalImages = images.length;
  const intervalDuration = 0.25;
  let currentIndex = 0;

  // Hide all images except the first one
  gsap.set(images.slice(1), { autoAlpha: 0 });

  function showNextImage() {
    gsap.to(images[currentIndex], { autoAlpha: 0, delay: intervalDuration, duration: 0 });
    currentIndex++;

    if (currentIndex >= totalImages) {
      // Reset to start when all images have been shown
      currentIndex = 0;
      // gsap.set(images, { autoAlpha: 0 });
    }

    gsap.to(images[currentIndex], {
      autoAlpha: 1,
      delay: intervalDuration,
      duration: 0,
      onComplete: showNextImage,
    });
  }

  // Start the animation
  showNextImage();

  // document.querySelectorAll('.new_component, .spotlight_component').forEach((instance) => {
  //   gsap.from(instance.querySelectorAll('.w-dyn-item'), {
  //     scrollTrigger: {
  //       trigger: instance.querySelector('.w-dyn-list'),
  //       start: 'center bottom',
  //       markers: true,
  //     },
  //     opacity: 0,
  //     duration: 0.6,
  //     // scale: 0.95,
  //     x: '2rem',
  //     // y: '.25rem',
  //     transformOrigin: 'left top',
  //     stagger: 0.025,
  //     ease: 'power2.out',
  //   });
  // });

  gsap.to('.spotlight_f1-brand-logo, .new_f3-logo', {
    rotationY: -360,
    duration: 1.1,
    repeat: -1,
    delay: 1.5,
    repeatDelay: 2.5,
    ease: 'power2.inOut',
  });

  // document
  //   .querySelectorAll('.new_f1-link, .new_f2-link, .new_f3-link, .new_f4-link')
  //   .forEach((item) => {
  //     const imageNode = item.querySelector('.image-absolute');
  //     const imageParentNode = imageNode.parentNode;
  //     const borderRadius = gsap.getProperty(imageParentNode, 'borderRadius') / 16;

  //     item.addEventListener('mouseenter', () => {
  //       gsap.to(imageParentNode, {
  //         borderRadius: `${borderRadius * 3}rem`,
  //         duration: 0.2,
  //         ease: 'power2.out',
  //       });
  //       gsap.to(imageNode, {
  //         scale: 1.025,
  //         duration: 0.4,
  //         ease: 'power2.out',
  //       });
  //     });

  //     item.addEventListener('mouseleave', () => {
  //       gsap.to(imageParentNode, {
  //         borderRadius: `${borderRadius}rem`,
  //         duration: 0.2,
  //         ease: 'power2.out',
  //       });
  //       gsap.to(imageNode, {
  //         scale: 1,
  //         duration: 0.2,
  //         ease: 'power2.out',
  //       });
  //     });
  //   });

  document
    .querySelectorAll(
      '.new_f1-link, .new_f2-link, .new_f4-link, .new_f5-link, .spotlight_f1-link, .spotlight_f2-link'
    )
    .forEach((item) => {
      const imageNodes = item.querySelectorAll('.image-absolute');
      // const imageParentNode = imageNodes[0].parentNode;
      // const borderRadius = gsap.getProperty(imageParentNode, 'borderRadius') / 16;
      // const defaultScaleLarge = 1.05;
      // if (borderRadius) gsap.set(imageNodes, { scale: defaultScaleLarge });

      const animateHover = (isEntering) => {
        // Kill any ongoing animations
        gsap.killTweensOf([imageNodes]);

        if (isEntering) {
          // gsap.to(imageParentNode, {
          //   borderRadius: borderRadius ? `${borderRadius * 1.5}rem` : `1.5rem`,
          //   duration: 0.25,
          //   ease: 'power3.out',
          // });
          gsap.to(imageNodes, {
            delay: 0.05,
            scale: 1.03, //borderRadius ? 1 : 1.04,
            duration: 0.3,
            ease: 'power2.out',
          });
        } else {
          // gsap.to(imageParentNode, {
          //   borderRadius: `${borderRadius}rem`,
          //   duration: 0.2,
          //   ease: 'power2.out',
          // });
          gsap.to(imageNodes, {
            scale: 1, //borderRadius ? defaultScaleLarge : 1,
            duration: 0.2,
            ease: 'power1.out',
          });
        }
      };

      item.addEventListener('mouseenter', () => animateHover(true));
      item.addEventListener('mouseleave', () => animateHover(false));
    });

  // document.querySelectorAll('.new_f3-link').forEach((item) => {
  //   const borderRadius = gsap.getProperty(item, 'borderRadius') / 16;

  //   const animateHover = (isEntering) => {
  //     if (isEntering) {
  //       gsap.to(item, {
  //         borderRadius: `${borderRadius * 1.5}rem`,
  //         scale: 0.985,
  //         duration: 0.3,
  //         ease: 'power2.out',
  //       });
  //     } else {
  //       gsap.to(item, {
  //         borderRadius: `${borderRadius}rem`,
  //         duration: 0.25,
  //         scale: 1,
  //         ease: 'power2.out',
  //       });
  //     }
  //   };

  //   item.addEventListener('mouseenter', () => animateHover(true));
  //   item.addEventListener('mouseleave', () => animateHover(false));
  // });

  // ————— How It Works Video ————— //

  const playerElement = document.querySelector('#howl-it-works-video');

  ScrollTrigger.create({
    trigger: playerElement,
    start: '25% 75%',
    once: true,
    onEnter: () => {
      const player = new playerjs.Player(playerElement);
      player.on('ready', () => {
        player.play();
      });
    },
  });

  // ————— How It Works Video ————— //
});
