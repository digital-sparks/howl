import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin, SplitText, ScrollTrigger, Draggable, InertiaPlugin);

window.Webflow ||= [];
window.Webflow.push(() => {
  // ————— Vimeo Videos ————— //
  const vimeoReady = setInterval(() => {
    if (window.Vimeo && window.Vimeo.Player) {
      clearInterval(vimeoReady);
      loadVideos();
    }
  }, 50);

  function loadVideos() {
    const vimeoDivs = document.querySelectorAll('div[vimeo-data-id]');
    vimeoDivs.forEach((div) => {
      const videoId = div.getAttribute('vimeo-data-id');
      if (videoId) {
        const options = {
          id: videoId,
          background: true,
          loop: true,
          autoplay: true,
          muted: true,
          dnt: true,
        };
        const player = new Vimeo.Player(div, options);
      }
    });
  }
  // ————— Vimeo Videos ————— //

  // ————— Footer Links on Hover ————— //
  // const footerLinks = document.querySelectorAll('.footer_link');

  // footerLinks.forEach((footerLink, i) => {
  //   new SplitText(footerLink.querySelector('div'), { types: 'chars', tagName: 'span' });

  //   $(footerLink).hover(
  //     () => {
  //       gsap.to(footerLink.querySelectorAll('div .char'), {
  //         yPercent: function (a, b, c) {
  //           return -0.4 * a * a;
  //         },
  //         rotateZ: function (a, b, c) {
  //           return -1.9 * a;
  //         },
  //         duration: 0.5,
  //         ease: 'back.out',
  //       });
  //     },
  //     () => {
  //       gsap.to(footerLink.querySelectorAll('div .char'), {
  //         yPercent: 0,
  //         rotateZ: 0,
  //         duration: 0.6,
  //         ease: 'back.out',
  //       });
  //     }
  //   );
  // });
  // ————— Footer Links on Hover ————— //
  function initFooterHover() {
    const footerLinks = document.querySelector('.footer_links');
    if (!footerLinks) return;

    const footerHover = document.querySelector('.footer_hover');
    if (!footerHover) return;

    const hoverableElements = document.querySelectorAll('.footer_link, .social-link');
    if (hoverableElements.length === 0) return;

    gsap.set(footerHover, { opacity: 0 });
    let isVisible = false;

    function applyHoverEffects() {
      hoverableElements.forEach((element) => {
        element.addEventListener('mouseenter', () => {
          const rect = element.getBoundingClientRect();
          const parentRect = element.closest('.footer_links').getBoundingClientRect();
          const isSocialLink = element.classList.contains('social-link');

          gsap.to(footerHover, {
            background: isSocialLink ? 'black' : 'transparent',
            width: rect.width,
            x: rect.left - parentRect.left,
            duration: isVisible ? 0.3 : 0,
            ease: 'power3.out',
          });

          gsap.to(footerHover, {
            opacity: 1,
            duration: 0.2,
            ease: 'power2.out',
          });

          isVisible = true;
        });

        element.addEventListener('mouseleave', () => {
          gsap.to(footerHover, {
            opacity: 0,
            duration: 0.2,
            ease: 'power2.out',
          });
        });

        element.addEventListener('mousedown', () => {
          gsap.to(footerHover, {
            background: 'black',
            duration: 0.2,
            ease: 'power2.out',
          });
        });

        element.addEventListener('mouseup', () => {
          const isSocialLink = element.classList.contains('social-link');

          gsap.to(footerHover, {
            background: isSocialLink ? 'black' : 'transparent',
            duration: 0.2,
            ease: 'power2.out',
          });
        });
      });

      footerLinks.addEventListener('mouseleave', () => {
        isVisible = false;
      });
    }

    function removeHoverEffects() {
      hoverableElements.forEach((element) => {
        element.removeEventListener('mouseenter', null);
        element.removeEventListener('mouseleave', null);
        element.removeEventListener('mousedown', null);
        element.removeEventListener('mouseup', null);
      });
      footerLinks.removeEventListener('mouseleave', null);
    }

    function handleResize() {
      if (window.matchMedia('(min-width: 992px)').matches) {
        removeHoverEffects();
        applyHoverEffects();
      } else {
        removeHoverEffects();
      }
    }

    // Initial application of hover effects
    handleResize();

    // Listen for window resize events
    window.addEventListener('resize', handleResize);
  }

  // Only run initFooterHover if .footer_links exists
  if (document.querySelector('.footer_links')) {
    initFooterHover();
  }

  // ————— Footer Links on Hover ————— //

  // ————— Arrow Up and Down Movement ————— //
  gsap
    .timeline({
      repeat: -1,
      repeatDelay: 0.4,
    })
    .to(
      '.arrow_component',

      {
        yPercent: 25,
        duration: 0.8,
        yoyo: true,
        repeat: 1,
        repeatDelay: 0.05,
        ease: 'power3.inOut',
      }
    );
  // ————— Arrow Up and Down Movement ————— //

  // ————— Text Links on Hover ————— //
  function initTextLinkEffect() {
    // Array of font families to cycle through
    const fontFamilies = ['Fragment Mono', 'Foundry DIT'];

    // Select all elements with the classes .text-link and .fragment-16pt
    const elements = document.querySelectorAll('.text-link .fragment-16pt');
    const duration = 150;

    elements.forEach((element) => {
      // Split the text into characters
      const split = new SplitText(element, { type: 'chars' });
      const chars = split.chars;

      // Function to randomly change font family
      function randomizeFonts() {
        chars.forEach((char) => {
          gsap.to(char, {
            fontFamily: fontFamilies[Math.floor(Math.random() * fontFamilies.length)],
            duration: duration / 100,
          });
        });
      }

      // Variable to store the interval
      let interval;

      // Add event listeners for mouseenter and mouseleave
      element.addEventListener('mouseenter', () => {
        // Start the continuous font change
        interval = setInterval(randomizeFonts, duration);
      });

      element.addEventListener('mouseleave', () => {
        // Clear the interval
        clearInterval(interval);

        // Reset to default font family
        gsap.to(chars, {
          fontFamily: '', // This will reset to the default font family
          duration: (duration / 100) * 2,
        });
      });
    });
  }
  // initTextLinkEffect();

  // gsap.set('.text-link-icon-duplicate', { display: 'none' });

  function setupTextLinkAnimations() {
    document.querySelectorAll('.text-link').forEach((link) => {
      const icon = link.querySelector('.text-link-icon');
      const text = link.querySelector('.fragment-16pt');
      const currentBackground = gsap.getProperty(link, 'backgroundColor');

      function handleMouseEnter() {
        gsap.to(link, {
          backgroundColor: '#01ffa7',
          paddingRight: '0.625rem',
          paddingLeft: '0.5rem',
          duration: 0.25,
          borderRadius: '1rem',
          ease: 'power3.out',
        });
        gsap.to(text, {
          scale: 0.95,
          duration: 0.25,
          transformOrigin: 'center center',
          ease: 'power3.out',
        });
        gsap.to(icon, {
          x: '200%',
          y: '-100%',
          delay: 0.015,
          duration: 0.35,
          ease: 'power2.out',
          onComplete: function () {
            gsap.set(icon, { x: 0, y: 0 });
          },
        });
      }

      function handleMouseLeave() {
        gsap.to(text, { scale: 1, duration: 0.2, ease: 'power3.out' });
        gsap.to(link, {
          backgroundColor: currentBackground,
          paddingRight: '1rem',
          paddingLeft: '0rem',
          borderRadius: '0rem',
          duration: 0.2,
          ease: 'power3.out',
        });
      }

      link.addEventListener('mouseenter', handleMouseEnter);
      link.addEventListener('mouseleave', handleMouseLeave);
    });
  }

  // Call the function to set up the animations
  setupTextLinkAnimations();

  // ————— Text Links on Hover ————— //

  // —————  Hero Marquee ————— //

  const marqueeGroups = {};

  document.querySelectorAll('[marquee=component]').forEach((marqueeEl) => {
    const marquee = marqueeEl;
    const track = marquee.querySelector('[marquee=track]');
    const pauseOnHover = marquee.getAttribute('marquee-pause') === 'true';
    const groupName = marquee.getAttribute('marquee-group');

    // Clone items to create an infinite loop effect
    marquee.querySelectorAll('[marquee=slide]').forEach((item) => {
      track.append(item.cloneNode(true));
    });

    let allItems = marquee.querySelectorAll('[marquee=slide]');
    const proxy = document.createElement('div');

    let direction = 'to-left'; // Initial direction: "to-left" | "to-right"
    let directionVal = direction === 'to-left' ? -1 : 1;
    const gap = parseFloat(getComputedStyle(track).getPropertyValue('grid-row-gap')) || 12; // Gap between items

    if (groupName) {
      if (!marqueeGroups[groupName]) {
        marqueeGroups[groupName] = [];
      }
      marqueeGroups[groupName].push({
        marquee,
        setDirection: (newDirection) => {
          direction = newDirection;
          directionVal = direction === 'to-left' ? -1 : 1;
          animation.kill();
          animation = createAnimation();
          animation.play();
        },
      });
    }

    function updateGroupDirection(newDirection) {
      if (groupName) {
        marqueeGroups[groupName].forEach((item) => {
          if (item.marquee !== marquee) {
            item.setDirection(newDirection);
          }
        });
      }
    }

    let totalX = 0;
    let marqueeH = 0;

    function calculatePositions() {
      totalX = 0;
      marqueeH = 0;

      allItems.forEach((item) => {
        gsap.set(item, { width: 'unset', height: 'unset', position: 'static' });

        const itemW = item.offsetWidth + gap; // Including margin
        const itemH = item.offsetHeight;
        gsap.set(item, { x: totalX, width: item.offsetWidth, height: itemH, position: 'absolute' });
        totalX += itemW;
        if (itemH > marqueeH) marqueeH = itemH;
      });

      gsap.set(marquee, { height: marqueeH, position: 'relative' });
    }

    calculatePositions();

    const marqueeVal = gsap.utils.wrap(0, totalX);
    const marqueeProgress = gsap.utils.wrap(0, 1);

    function createAnimation() {
      const stringX = directionVal === -1 ? `-=${totalX}` : `+=${totalX}`;
      return gsap.to(marquee.querySelectorAll('[marquee=slide]'), {
        repeat: -1,
        duration: 30, // Updated duration from 10 to 40 seconds
        x: stringX,
        ease: 'none',
        paused: true,
        modifiers: {
          x: function (x, target) {
            let currentX = parseFloat(x);
            const itemW = target.offsetWidth + gap;

            if (directionVal === -1) {
              if (currentX <= -itemW) {
                currentX += totalX;
              }
            } else {
              if (currentX >= totalX - itemW) {
                currentX -= totalX;
              }
            }

            return `${currentX}px`;
          },
        },
      });
    }

    let animation = createAnimation();

    function updateProgress() {
      const dragValue = marqueeVal(this.deltaX * directionVal) / totalX;
      const currentProgressAnim = animation.progress();
      const endProgress = marqueeProgress(currentProgressAnim + dragValue);
      animation.progress(endProgress);
    }

    let dragDirection = direction; // Track the drag direction
    let isHovering = false; // Track if the mouse is hovering over the marquee

    Draggable.create(proxy, {
      type: 'x',
      trigger: marquee,
      inertia: true,
      resistance: 0.75,
      edgeResistance: 0.85,
      maxDuration: 1,
      onPress: function () {
        animation.pause(); // Pause the animation when dragging starts
      },
      onDrag: function () {
        updateProgress.call(this);
        const dir = this.getDirection('start');
        dragDirection = dir === 'left' ? 'to-left' : 'to-right';
      },
      onThrowUpdate: updateProgress,
      onRelease: function () {
        if (isHovering) {
          gsap.to(animation, {
            timeScale: 0.25,
            duration: 0.5,
            onComplete: () => animation.play(),
          }); // Resume animation at slower speed
        } else {
          animation.play(); // Resume the animation at normal speed
        }
      },
      onDragEnd: function () {
        // Update direction based on drag direction
        direction = dragDirection;
        directionVal = direction === 'to-left' ? -1 : 1;
        // Smoothly update the animation direction
        animation.kill();
        animation = createAnimation();

        // Update direction for other marquees in the same group
        updateGroupDirection(direction);
        if (isHovering) {
          gsap.to(animation, {
            timeScale: 0.25,
            duration: 0.5,
            onComplete: () => animation.play(),
          }); // Resume animation at slower speed
        } else {
          animation.play(); // Resume the animation at normal speed
        }
      },
    });

    let previousWidth = window.innerWidth;
    let debounceTimer;

    function resize() {
      const currentWidth = window.innerWidth;

      // Check if the width has changed
      if (currentWidth !== previousWidth) {
        // Update the previous width
        previousWidth = currentWidth;

        // Update animation with new totalX
        animation.kill();
        // Recalculate positions
        calculatePositions();
        animation = createAnimation();
        if (isHovering) {
          gsap.to(animation, {
            timeScale: 0.25,
            duration: 0.5,
            onComplete: () => animation.play(),
          }); // Resume animation at slower speed
        } else {
          animation.play(); // Resume the animation at normal speed
        }
      }
    }

    function debounceResize() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(resize, 50); // Adjust the delay (in milliseconds) as needed
    }

    window.addEventListener('resize', debounceResize);

    // Slow down on hover if specified
    if (pauseOnHover) {
      marquee.addEventListener('mouseenter', () => {
        isHovering = true;
        gsap.to(animation, { timeScale: 0.25, duration: 0.5 });
      });
      marquee.addEventListener('mouseleave', () => {
        isHovering = false;
        gsap.to(animation, { timeScale: 1, duration: 0.5 });
      });
    }

    // AUTOPLAY
    animation.play();
  });
  // —————  Hero Marquee ————— //

  function animateProductCards() {
    const cards = gsap.utils.toArray('.products_card-wrap');
    let visibleCards = [];
    let lastShownIndex = -1;

    function isInView(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }

    function getNextValidCard() {
      const hiddenCards = cards.filter((card) => !visibleCards.includes(card));
      const validCards = hiddenCards.filter((card, index) => {
        const cardIndex = cards.indexOf(card);
        const swiperItem = card.closest('.products_swiper-item');
        return Math.abs(cardIndex - lastShownIndex) > 1 && isInView(swiperItem);
      });

      if (validCards.length > 0) {
        const randomCard = validCards[Math.floor(Math.random() * validCards.length)];
        lastShownIndex = cards.indexOf(randomCard);
        return randomCard;
      }
      return null;
    }

    function animateCard() {
      if (visibleCards.length < 2) {
        const cardToAnimate = getNextValidCard();
        if (cardToAnimate) {
          visibleCards.push(cardToAnimate);

          gsap.to(cardToAnimate, {
            opacity: 1,
            scale: 1.05,
            duration: 0.5,
            ease: 'back.out(1.7)',
            onComplete: () => {
              // Schedule fade out
              gsap.delayedCall(Math.random() * 1.5 + 1.5, () => {
                gsap.to(cardToAnimate, {
                  opacity: 0,
                  scale: 1,
                  duration: 0.5,
                  ease: 'back.in(1.7)',
                  onComplete: () => {
                    visibleCards = visibleCards.filter((card) => card !== cardToAnimate);
                  },
                });
              });
            },
          });
        }
      }

      // Schedule next animation
      gsap.delayedCall(Math.random() * 2 + 1, animateCard);
    }

    // Initially hide all cards
    gsap.set(cards, { opacity: 0 });

    // Start the animation
    animateCard();
  }

  // Call the function to start the animation
  animateProductCards();

  document.querySelectorAll('.products_swiper-item').forEach((item) => {
    const buttonWrap = item.querySelector('.products_button-wrap');

    // Set initial state
    gsap.set(buttonWrap, { autoAlpha: 0 });

    // Create the animation in a paused state
    const animation = gsap
      .timeline({ paused: true })
      .fromTo(
        buttonWrap,
        { autoAlpha: 0, duration: 0.2, ease: 'none' },
        { autoAlpha: 1, duration: 0.2, ease: 'none' }
      );

    item.addEventListener('mouseenter', () => {
      animation.play();
    });
    item.addEventListener('mouseleave', () => {
      animation.reverse();
    });
  });

  // Select all elements with the class 'dit-148pt'
  const textElements = document.querySelectorAll('.dit-148pt, .dit-180pt');

  // Function to generate random characters
  const randomChar = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    return chars[Math.floor(Math.random() * chars.length)];
  };

  // Animation settings
  const ANIMATION_DURATION = 0.175; // Modify this to change the duration
  const STAGGER_DELAY = 0.06; // Delay between each character animation

  // const ANIMATION_DURATION = 0.2; // Modify this to change the duration
  // const STAGGER_DELAY = 0.025; // Delay between each character animation

  // Loop through each '.dit-148pt' element
  textElements.forEach((textElement) => {
    // Split the text into characters using SplitText
    const splitText = new SplitText(textElement, { types: ['lines', 'words', 'chars'] });

    // Add CSS to prevent words from breaking
    splitText.words.forEach((word) => {
      word.style.display = 'inline-block';
      word.style.whiteSpace = 'nowrap';
    });

    // Ensure lines stay together
    splitText.lines.forEach((line) => {
      line.style.display = 'block';
    });

    // Create a timeline for the animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: textElement,
        start: 'center bottom', // Adjust this value to change when the animation starts
        markers: false,
      },
    });

    // Set initial state: all characters with low opacity
    gsap.set(splitText.chars, { opacity: 0.1 });

    // Animate each character
    splitText.chars.forEach((char, index) => {
      tl.to(
        char,
        {
          duration: ANIMATION_DURATION,
          opacity: 1,
          scrambleText: {
            text: char.innerText,
            chars: randomChar,
            revealDelay: 0.05,
            speed: 0.5,
          },
          ease: 'linear',
        },
        index * STAGGER_DELAY
      ); // Stagger the animations
    });
  });

  // ————— Sticky Navigation Desktop ————— //

  function setupStickyNavAnimation() {
    let lastScrollTop = 0;
    let isAtBottom = false;
    const nav = document.querySelector('.nav_menu');
    const scrollThreshold = 50;
    let accumulatedScrollDown = 0;
    let scrollTriggerInstance;

    // Set initial state
    gsap.set(nav, { yPercent: 0, opacity: 1 });

    // Create the animation timeline
    const tl = gsap.timeline({ paused: true });
    tl.to(nav, { yPercent: 25, opacity: 0, duration: 0.2, ease: 'power1.inOut' });

    function createScrollTrigger() {
      // Kill existing ScrollTrigger if it exists
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
      }

      // Create new ScrollTrigger
      scrollTriggerInstance = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const st = self.scroll();
          const maxScroll = self.end - self.start - self.scroll();

          // Check if at the bottom of the page
          if (maxScroll <= 1) {
            isAtBottom = true;
            tl.reverse();
          } else {
            isAtBottom = false;
          }

          // Calculate scroll difference
          const scrollDiff = st - lastScrollTop;

          if (scrollDiff > 0 && !isAtBottom) {
            // Scrolling down
            accumulatedScrollDown += scrollDiff;
            if (accumulatedScrollDown > scrollThreshold) {
              tl.play();
              accumulatedScrollDown = 0; // Reset accumulated scroll
            }
          } else if (scrollDiff < 0 || isAtBottom) {
            // Scrolling up or at the bottom
            accumulatedScrollDown = 0; // Reset accumulated scroll
            tl.reverse();
          }

          lastScrollTop = st;
        },
      });
    }

    // Initial creation of ScrollTrigger
    createScrollTrigger();

    // Recreate ScrollTrigger on window resize
    window.addEventListener('resize', createScrollTrigger);

    // Return a cleanup function
    return () => {
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
      }
      window.removeEventListener('resize', createScrollTrigger);
    };
  }

  // Use GSAP matchMedia for responsive behavior
  const mm = gsap.matchMedia();

  mm.add('(min-width: 768px)', () => {
    // This code will run when the viewport is 768px or wider
    const cleanup = setupStickyNavAnimation();

    return () => {
      // This optional return function will run when the viewport becomes narrower than 768px
      cleanup();
    };
  });

  // ————— Sticky Navigation Desktop ————— //

  // ————— Sticky Navigation Desktop ————— //

  // Wrap the entire code in a matchMedia context
  gsap.matchMedia().add('(max-width: 767px)', () => {
    const navMenu = document.querySelector('.nav_menu');
    const navMenuBurger = document.querySelector('.nav_menu-burger');
    const navMenuLink = document.querySelector('.nav_menu > a');

    gsap.set(navMenu, { display: 'none', pointerEvents: 'none' });

    const openMenu = () => {
      gsap
        .timeline({
          onStart: () => {
            gsap.set(navMenu, { pointerEvents: 'auto' });
          },
        })
        .to(
          navMenuBurger,
          {
            yPercent: 100,
            opacity: 0,
            duration: 0.4,
            ease: 'power3.out',
          },
          '<'
        )
        .fromTo(
          navMenu,
          { display: 'none' },
          {
            display: 'flex',
            opacity: 1,
            duration: 0,
          },
          '<'
        )
        .fromTo(
          navMenu,
          { scale: 0 },
          {
            transformOrigin: 'bottom right',
            scale: 1,
            ease: 'power3.inOut',
            duration: 0.75,
          },
          '<'
        )
        .fromTo(
          '.nav_menu > *',
          { opacity: 0 },
          {
            opacity: 1,
            delay: 0.4,
          },
          '<'
        )
        .fromTo(
          '.nav_menu .nav_menu-link > div',
          {
            yPercent: 50,
            opacity: 0,
          },
          {
            yPercent: 0,
            opacity: 1,
            ease: 'power3.out',
            duration: 0.4,
          },
          '<'
        );
    };

    const closeMenu = () => {
      gsap
        .timeline({
          paused: false,
          onStart: () => {
            gsap.set(navMenu, { pointerEvents: 'none' });
          },
          onComplete: () => {
            gsap.set(navMenu, { display: 'none' });
          },
        })
        .to(
          '.nav_menu > *',
          {
            opacity: 0,
            duration: 0.7,
          },
          '<'
        )
        .to(
          navMenu,
          {
            transformOrigin: 'bottom right',
            scale: 0,
            opacity: 0,
            ease: 'power3.inOut',
            duration: 0.5,
          },
          '<'
        )
        .to(
          '.nav_menu .nav_menu-link > div',
          {
            yPercent: 50,
            opacity: 0,
            delay: 0.1,
            ease: 'power3.out',
            duration: 0.4,
          },
          '<'
        )
        .fromTo(
          navMenuBurger,
          {
            yPercent: 100,
            opacity: 0,
          },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.4,
            ease: 'power3.out',
          },
          '<+0.4'
        );
    };

    navMenuBurger.addEventListener('click', openMenu);
    navMenuLink.addEventListener('click', closeMenu);

    // Return an object with a cleanup method
    return {
      // This cleanup method will be called when the media query no longer matches
      cleanup() {
        navMenuBurger.removeEventListener('click', openMenu);
        navMenuLink.removeEventListener('click', closeMenu);
        // Reset any styles or states as needed
        gsap.set(navMenu, { clearProps: 'all' });
        gsap.set(navMenuBurger, { clearProps: 'all' });
      },
    };
  });

  // ————— Sticky Navigation Desktop ————— //

  /// -- footer logo hover in --- ///

  document.querySelectorAll('.footer_logo').forEach((logo) => {
    const gifElement = logo.querySelector('.footer_gif');

    logo.addEventListener('mouseenter', () => {
      gsap.to(gifElement, {
        scale: 1.1,
        duration: 0.3,
        ease: 'power3.out',
      });
    });
    logo.addEventListener('mouseleave', () => {
      gsap.to(gifElement, {
        scale: 1,
        duration: 0.3,
        ease: 'power3.out',
      });
    });
  });

  /// -- footer logo hover in --- ///

  /// -- button animation --- ///

  // Select all elements with the class 'button'
  const buttons = document.querySelectorAll('.button');

  buttons.forEach((button) => {
    const isHuge = button.classList.contains('is-huge') || button.classList.contains('is-graphic'),
      letterSpacing =
        gsap.getProperty(button, 'letterSpacing') / gsap.getProperty(button, 'font-size'),
      buttonText = button.querySelector('.button-text');

    const createAnimation = (enter) => {
      const duration = enter ? 0.2 : 0.16;
      const scale = enter ? (isHuge ? 1.05 : 1) : 1;
      const textScale = enter ? (isHuge ? 1.05 : 1.075) : 1;

      return gsap
        .timeline({
          defaults: { ease: 'power3.out', overwrite: true, duration: duration },
        })
        .to(button, {
          letterSpacing: `${letterSpacing / (enter ? 1.25 : 1)}em`,
          scale,
          delay: enter ? 0 : 0.075,
        })
        .to(
          buttonText,
          {
            scale: textScale,
            delay: enter && isHuge ? 0.025 : 0,
          },
          '<'
        );
    };

    button.addEventListener('mouseenter', () => createAnimation(true));
    button.addEventListener('mouseleave', () => createAnimation(false));
  });

  /// -- button animation --- ///

  function setupPinning(selector, options = {}) {
    const section = document.querySelector(selector);
    let st;

    function createScrollTrigger() {
      if (st) st.kill();

      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      st = ScrollTrigger.create({
        trigger: selector,
        pin: true,
        pinSpacing: false,
        start:
          options.start ||
          (() => {
            if (sectionHeight < viewportHeight) {
              return 'top top';
            } else {
              return `bottom bottom`;
            }
          }),
        end: options.end || 'bottom top',
        markers: false,
        anticipatePin: 1,
        ...options,
      });
    }

    createScrollTrigger();

    window.addEventListener('resize', () => {
      requestAnimationFrame(createScrollTrigger);
    });
  }

  // Setup for the top section (as we did before)
  // setupPinning('[gsap-pin-section=bottom]');

  // gsap.set('[gsap-pin-section=center]', { position: 'fixed' });
  // Setup for the third section
  // ScrollTrigger.create({
  //   trigger: '[gsap-pin-section=center]',
  //   pin: true,
  //   // pinType: 'fixed',
  //   pinSpacing: false,
  //   start: 'top bottom', // This will be ignored initially due to pinType: 'fixed'
  //   end: 'bottom bottom',
  //   markers: true,
  // });
});
