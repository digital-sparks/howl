// bin/live-reload.js
new EventSource(`${'http://localhost:3000'}/esbuild`).addEventListener('change', () =>
  location.reload()
);

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
});
