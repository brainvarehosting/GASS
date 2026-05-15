// Dynamic homepage hero. Replaces the contents of #heroSlider with banners
// from /api/banners IF any active banners exist. Otherwise leaves the
// existing static slides in place (zero-risk fallback).
//
// Usage in any homepage HTML:
//   <script src="/hero-banners.js" defer></script>
//
// Re-uses the existing CSS classes (.hero-carousel, .carousel-slide,
// .carousel-dots .dot) so the carousel auto-rotation in components.js
// (initCarousel) continues to work after replacement.

(function () {
  'use strict';
  if (window.__HERO_BANNERS_LOADED__) return;
  window.__HERO_BANNERS_LOADED__ = true;

  const SELECTOR = '#heroSlider';

  function escAttr(s) { return String(s ?? '').replace(/"/g, '&quot;'); }
  function escHtml(s) {
    return String(s ?? '').replace(/[&<>]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c]));
  }

  function bgStyle(b) {
    const o = (b.overlay_opacity ?? 0.55);
    if (b.bg_type === 'solid')         return `background:${b.bg_color || '#0b1f2a'};`;
    if (b.bg_type === 'gradient')      return `background:linear-gradient(135deg, ${b.bg_gradient_from || '#0b1f2a'}, ${b.bg_gradient_to || '#0a7575'});`;
    if (b.bg_type === 'image_overlay' && b.bg_image_url)
      return `background:linear-gradient(rgba(0,0,0,${o}),rgba(0,0,0,${o})), url('${b.bg_image_url}') center/cover;`;
    return '';
  }

  function renderSlide(b, isFirst) {
    const align = b.text_align || 'left';
    const color = b.text_color ? `color:${b.text_color};` : '';
    const justify = align === 'center' ? 'justify-content:center;' : align === 'right' ? 'justify-content:flex-end;' : '';

    let bgEl = '';
    if (b.bg_type === 'video' && b.bg_video_url) {
      bgEl = `
        <div class="corp-hero__bg">
          <video src="${escAttr(b.bg_video_url)}" autoplay muted loop playsinline preload="metadata"></video>
        </div>
        <div class="corp-hero__overlay"></div>`;
    } else if (b.bg_type === 'image' && b.bg_image_url) {
      bgEl = `
        <div class="corp-hero__bg"><img src="${escAttr(b.bg_image_url)}" alt="" loading="${isFirst ? 'eager' : 'lazy'}"/></div>
        <div class="corp-hero__overlay"></div>`;
    } else {
      const inline = bgStyle(b);
      bgEl = `<div class="corp-hero__bg" style="${inline}"></div>${b.bg_type === 'image_overlay' ? '<div class="corp-hero__overlay"></div>' : ''}`;
    }

    const buttons = (b.btn1_text || b.btn2_text)
      ? `<div class="corp-hero__actions" style="${justify}">
           ${b.btn1_text ? `<a href="${escAttr(b.btn1_link || '#')}" class="btn-primary">${escHtml(b.btn1_text)}</a>` : ''}
           ${b.btn2_text ? `<a href="${escAttr(b.btn2_link || '#')}" class="btn-outline">${escHtml(b.btn2_text)}</a>` : ''}
         </div>`
      : '';

    return `
      <div class="carousel-slide ${isFirst ? 'active' : ''}">
        ${bgEl}
        <div class="corp-hero__content" style="text-align:${align};${color}">
          <div class="corp-hero__text">
            ${b.eyebrow ? `<span class="corp-hero__badge">${escHtml(b.eyebrow)}</span>` : ''}
            <h1>${escHtml(b.heading)}${b.heading_accent ? ` <span class="text-accent">${escHtml(b.heading_accent)}</span>` : ''}</h1>
            ${b.description ? `<p>${escHtml(b.description)}</p>` : ''}
            ${buttons}
          </div>
        </div>
      </div>`;
  }

  function initCarousel(root) {
    const slides = root.querySelectorAll('.carousel-slide');
    const dots = root.querySelectorAll('.carousel-dots .dot');
    if (slides.length <= 1) return;
    let cur = 0, timer;
    const go = (idx) => {
      slides[cur].classList.remove('active'); dots[cur]?.classList.remove('active');
      cur = (idx + slides.length) % slides.length;
      slides[cur].classList.add('active'); dots[cur]?.classList.add('active');
    };
    const start = () => { clearInterval(timer); timer = setInterval(() => go(cur + 1), 5500); };
    dots.forEach((d, i) => d.addEventListener('click', () => { go(i); start(); }));
    start();
  }

  async function load() {
    const root = document.querySelector(SELECTOR);
    if (!root) return;
    let banners;
    try {
      const res = await fetch('/api/banners', { credentials: 'omit' });
      if (!res.ok) return;
      const body = await res.json();
      banners = body?.items || [];
    } catch { return; }
    if (!banners.length) return; // keep static slides

    const track = root.querySelector('.carousel-track');
    const dotsBox = root.querySelector('.carousel-dots');
    if (!track) return;

    track.innerHTML = banners.map((b, i) => renderSlide(b, i === 0)).join('');
    if (dotsBox) {
      dotsBox.innerHTML = banners.map((_, i) =>
        `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
      ).join('');
    }

    initCarousel(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
