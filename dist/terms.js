(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/terms.js
  window.Webflow ||= [];
  window.Webflow.push(() => {
  });
})();
//# sourceMappingURL=terms.js.map
