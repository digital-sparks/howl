(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/global.js
  window.Webflow ||= [];
  window.Webflow.push(() => {
    console.log("hello");
  });
})();
//# sourceMappingURL=global.js.map
