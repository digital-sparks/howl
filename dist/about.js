(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/about.js
  window.Webflow ||= [];
  window.Webflow.push(() => {
    console.log("hello");
  });
})();
//# sourceMappingURL=about.js.map
