import Swiper from 'swiper';
import { Keyboard, Mousewheel, Autoplay } from 'swiper/modules';
import gsap from 'gsap';
//import { ScrollTrigger } from 'gsap/ScrollTrigger';

window.Webflow ||= [];
window.Webflow.push(() => {
  console.log('hello');

  // ————— Hero Animation ————— //
  const duration = 1.25;
  const delay = 0.5;
  const onceEvery = 3;

  // Rotations

  gsap.to('.home-hero_logo', {
    rotationY: -360,
    duration: duration,
    repeat: -1,
    delay: delay,
    repeatDelay: delay,
    ease: 'none',
  });

  const largeDelay = delay * (onceEvery + 1) + duration * onceEvery;

  gsap.to('.home-hero_tags-item, .home-hero_heading-span', {
    rotationY: -360,
    duration: duration,
    repeat: -1,
    delay: largeDelay,
    repeatDelay: largeDelay,
    ease: 'none',
  });

  // Hide/Show

  const logoItems = $('.home-hero_logo');
  const bgItems = $('.home-hero_span-item');
  const tagItems = $('.home-hero_tags-item');
  const totalItems = logoItems.length;

  logoItems.hide().first().show();
  bgItems.hide().first().show();
  tagItems.hide().first().show();

  const showDelay = delay * (onceEvery + 1) + duration * (onceEvery + 0.25);

  let heroShowHideTl = gsap.timeline({ repeat: -1, repeatDelay: 0.75 * duration });

  logoItems.each(function (index) {
    heroShowHideTl.to(logoItems, {
      duration: 0,
      autoAlpha: 1,
      delay: index === 0 ? showDelay : showDelay + duration * 0.75,
      onComplete: function () {
        logoItems.eq(index).hide();
        logoItems.eq((index + 1) % totalItems).show();
        bgItems.eq(index).hide();
        bgItems.eq((index + 1) % totalItems).show();
        tagItems.eq(index).hide();
        tagItems.eq((index + 1) % totalItems).show();
      },
    });
  });

  heroShowHideTl.play();
  // ————— Hero Animation ————— //

  // ————— Hero Notifications ————— //
  const notifications = $('.home-hero_notification');
  const notificationHeight = notifications.outerHeight(true);

  const firstNotification = $('.home-hero_notification').first();
  const clonedNotification = firstNotification.clone();
  $('.home-hero_notifications-wrap').append(clonedNotification);

  let heroNotificationsTl = gsap.timeline({ repeat: -1 });

  notifications.each(function (index) {
    heroNotificationsTl.to(
      $('.home-hero_notification'),
      {
        y: `-=${notificationHeight}px`,
        duration: 0.5,
        ease: 'power1.inOut',
        delay: index === 0 ? 2.5 : 3,
      },
      index * 3
    );
  });

  heroNotificationsTl.to(notifications, { y: 0, duration: 0 });
  // ————— Hero Notifications ————— //

  // ————— Updates - New on Howl Swiper ————— //
  updatesCarousel = new Swiper(`.new_swiper-wrapper`, {
    modules: [Keyboard, Mousewheel],
    wrapperClass: 'new_swiper-list',
    slideClass: 'new_swiper-item',
    direction: 'horizontal',
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
      beforeInit: function () {
        $(this.wrapperEl).css('grid-column-gap', 'unset');
      },
    },
  });
  // ————— Updates - New on Howl Swiper ————— //

  // ————— Creator Spotlight Swiper ————— //
  spotlightCarousel = new Swiper(`.spotlight_swiper-wrapper`, {
    modules: [Keyboard, Mousewheel],
    wrapperClass: 'spotlight_swiper-list',
    slideClass: 'spotlight_swiper-item',
    direction: 'horizontal',
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
      beforeInit: function () {
        $(this.wrapperEl).css('grid-column-gap', 'unset');
      },
    },
  });
  // ————— Creator Spotlight Swiper ————— //

  // ————— Creators Wanted Text ————— //
  const marquee = $('.creators_bg-text-marquee');

  gsap.to(marquee, {
    y: `-100%`,
    duration: 20, // Adjust the duration as needed
    ease: 'linear',
    repeat: -1,
    onRepeat: function () {
      gsap.set(marquee, { y: 0 }); // Reset to the starting position
    },
  });
  // ————— Creators Wanted Text ————— //
});
