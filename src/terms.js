import gsap from 'gsap';

window.Webflow ||= [];
window.Webflow.push(() => {
  // ————— TOC ————— //
  gsap.to('.toc_sticky', {
    xPercent: -100,
    x: '1.25rem',
    duration: 0,
    delay: 0.5,
    ease: 'power1.out',
  });
  // ————— TOC ————— //
});
