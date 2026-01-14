import { DotLottie } from '@dotlottie/dotlottie-js';
import lottie from 'lottie-web';

const LOTTIE_URLS = {
  step1:
    'https://cdn.prod.website-files.com/60e33881a96433966407b814/6967e1aaa20696459e640031_Step%201.lottie',
  step3:
    'https://cdn.prod.website-files.com/60e33881a96433966407b814/6965142abfd7fc30f9716a42_Step-3.json',
  footerMobile:
    'https://cdn.prod.website-files.com/60e33881a96433966407b814/6965142a20216e5f817a2f39_footer-text-mobile.json',
  footerDesktop:
    'https://cdn.prod.website-files.com/60e33881a96433966407b814/696514293eb77f91651366eb_footer-text-desktop.json',
};

// =============================================================================
// MAIN APPLICATION
// =============================================================================
window.Webflow ||= [];
window.Webflow.push(async () => {
  const container = document.querySelector('div');

  try {
    // Load the .lottie file using DotLottie
    const dotlottie = new DotLottie();

    // Fetch and load the .lottie file
    const response = await fetch(LOTTIE_URLS.step1);
    const arrayBuffer = await response.arrayBuffer();

    await dotlottie.fromArrayBuffer(arrayBuffer);

    // Get the first animation from the .lottie file
    const animations = dotlottie.getAnimations();
    if (animations.length > 0) {
      const animationData = JSON.parse(animations[0].data);

      // Create container and play with lottie-web
      const step1Container = document.createElement('div');
      container.appendChild(step1Container);

      lottie.loadAnimation({
        container: step1Container,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        animationData: animationData,
      });
    }
  } catch (error) {
    console.error('Error loading .lottie file:', error);
  }
});
