(() => {
  window.Webflow || (window.Webflow = []);
  window.Webflow.push(() => {
    console.log('hello');
    let t = setInterval(function () {
      window.Vimeo && window.Vimeo.Player && (clearInterval(t), i());
    }, 50);
    function i() {
      document.querySelectorAll('div[vimeo-data-id]').forEach((o) => {
        let e = o.getAttribute('vimeo-data-id');
        if (e) {
          let n = { id: e, background: !0, loop: !0, autoplay: !0, muted: !0, dnt: !0 },
            l = new Vimeo.Player(o, n);
        }
      });
    }
  });
})();
