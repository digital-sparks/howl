"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/statsig.js
  !function() {
    let t = "STATSIG_LOCAL_STORAGE_STABLE_ID";
    function e() {
      if (crypto && crypto.randomUUID) return crypto.randomUUID();
      let t2 = () => Math.floor(65536 * Math.random()).toString(16).padStart(4, "0");
      return `${t2()}${t2()}-${t2()}-4${t2().substring(1)}-${t2()}-${t2()}${t2()}${t2()}`;
    }
    let i = null, n = localStorage.getItem(t) || null;
    if (document.cookie.match(/statsiguuid=([\w-]+);?/) && ([, i] = document.cookie.match(/statsiguuid=([\w-]+);?/)), i && n && i === n) ;
    else if (i && n && i !== n) localStorage.setItem(t, i);
    else if (i && !n) localStorage.setItem(t, i);
    else {
      let o = e();
      localStorage.setItem(t, o), function t2(i2) {
        let n2 = /* @__PURE__ */ new Date();
        n2.setMonth(n2.getMonth() + 12);
        let o2 = window.location.host.split(".");
        o2.length > 2 && o2.shift();
        let s = `.${o2.join(".")}`;
        document.cookie = `statsiguuid=${i2 || e()};Expires=${n2};Domain=${s};Path=/;Secure`;
      }(o);
    }
  }();
})();
//# sourceMappingURL=statsig.js.map
