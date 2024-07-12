import gsap from 'gsap';
//import { ScrollTrigger } from 'gsap/ScrollTrigger';

window.Webflow ||= [];
window.Webflow.push(() => {
  /*
  const firstDropdown = document.querySelector('.legal_dropdown .dropdown_toggle');

  if (!firstDropdown.classList.contains('w--open')) {
    firstDropdown.dispatchEvent(new Event('mousedown'));
    firstDropdown.dispatchEvent(new Event('mouseup'));
    $(firstDropdown).trigger('tap');
  }
  */
  // ————— TOC ————— //
  gsap.to('.toc_sticky', {
    xPercent: -100,
    x: '1.25rem',
    duration: 0, // Because there is already a css transition that has a duration
    delay: 1,
    ease: 'power1.out',
  });
  // ————— TOC ————— //
});
