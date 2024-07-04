import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

window.Webflow ||= [];
window.Webflow.push(() => {
  console.log('hello');

  // ————— Vimeo Videos ————— //
  const vimeoReady = setInterval(function () {
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

  // —————  Hero Marquee ————— //

  document.querySelectorAll('[marquee=component]').forEach((marqueeEl) => {
    const marquee = marqueeEl;
    const track = marquee.querySelector('[marquee=track]');

    // Clone items to create an infinite loop effect
    marquee.querySelectorAll('[marquee=slide]').forEach((item) => {
      track.append(item.cloneNode(true));
    });

    let allItems = marquee.querySelectorAll('[marquee=slide]');
    const proxy = document.createElement('div');

    let direction = 'to-left'; // Initial direction: "to-left" | "to-right"
    let directionVal = direction === 'to-left' ? -1 : 1;
    const gap = gsap.getProperty(track, 'grid-row-gap');
    console.log(gap);
    //12; // Gap between items

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
        duration: 40, // Updated duration from 10 to 40 seconds
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
        animation.play(); // Resume the animation when dragging ends
      },
      onDragEnd: function () {
        // Update direction based on drag direction
        direction = dragDirection;
        directionVal = direction === 'to-left' ? -1 : 1;
        // Smoothly update the animation direction
        animation.kill();
        animation = createAnimation();
        animation.play();
      },
    });

    function resize() {
      // Update animation with new totalX
      animation.kill();
      // Recalculate positions
      calculatePositions();
      animation = createAnimation();
      animation.play();
    }

    window.addEventListener('resize', resize);

    // AUTOPLAY
    animation.play();
  });
  // —————  Hero Marquee ————— //
});
