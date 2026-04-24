/**
 * content-loader.js
 * Fetches live content from /api/content and applies it to
 * any element with a [data-content="key"] attribute.
 * Falls back gracefully if server is offline (static mode).
 */
(function () {
  const API = '/api/content';

  function apply(map) {
    document.querySelectorAll('[data-content]').forEach(el => {
      const key = el.getAttribute('data-content');
      if (map[key] !== undefined && map[key] !== '') {
        el.textContent = map[key];
      }
    });
  }

  // Fetch and apply immediately
  fetch(API)
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(apply)
    .catch(() => {}); // silent fallback — static content stays
})();
