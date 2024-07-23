import gsap from 'gsap';
//import { ScrollTrigger } from 'gsap/ScrollTrigger';

window.Webflow ||= [];
window.Webflow.push(() => {
  // ————— TOC ————— //
  gsap.to('.toc_sticky', {
    xPercent: -100,
    x: '1.25rem',
    duration: 0, // Because there is already a css transition that has a duration
    delay: 0.5,
    ease: 'power1.out',
  });
  // ————— TOC ————— //
});
