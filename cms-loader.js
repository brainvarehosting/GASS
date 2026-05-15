// CMS content loader for static HTML pages.
// Add to any page: <script src="/cms-loader.js" defer></script>
// Then mark editable elements:
//   <h1 data-cms-key="home.hero1.h1">Default text</h1>
//   <p  data-cms-key="home.hero1.p"  data-cms-format="textarea">…</p>
//
// data-cms-format="textarea" preserves line breaks (converts \n → <br>).
// For attributes: data-cms-key="..." data-cms-attr="href" sets the attribute.
//
// Renders default text immediately (no flash), then swaps when content arrives.

(function () {
  'use strict';
  if (window.__CMS_LOADED__) return;
  window.__CMS_LOADED__ = true;

  // 60-second sessionStorage cache so navigating between pages is instant.
  const CACHE_KEY = '__cms_v1';
  const TTL = 60 * 1000;

  function readCache() {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { at, content } = JSON.parse(raw);
      if (Date.now() - at > TTL) return null;
      return content;
    } catch { return null; }
  }
  function writeCache(content) {
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), content })); } catch {}
  }

  function applyContent(content) {
    if (!content) return;
    document.querySelectorAll('[data-cms-key]').forEach((el) => {
      const key = el.getAttribute('data-cms-key');
      if (!(key in content)) return;
      const attr = el.getAttribute('data-cms-attr');
      const value = content[key];
      if (attr) {
        el.setAttribute(attr, value);
      } else {
        const fmt = el.getAttribute('data-cms-format');
        if (fmt === 'textarea') {
          el.innerHTML = String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        } else {
          el.textContent = value;
        }
      }
    });
  }

  function start() {
    const cached = readCache();
    if (cached) applyContent(cached);

    fetch('/api/content', { credentials: 'omit' })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!body || !body.content) return;
        writeCache(body.content);
        applyContent(body.content);
      })
      .catch(() => {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
