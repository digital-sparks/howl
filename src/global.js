// bin/live-reload.js
new EventSource(`${'http://localhost:3000'}/esbuild`).addEventListener('change', () =>
  location.reload()
);

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
});
