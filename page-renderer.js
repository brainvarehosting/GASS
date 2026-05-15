// Renders CMS pages built with the Page Builder.
// Reads ?slug=… from URL, fetches /api/cms-pages/:slug, and renders sections.

(function () {
  'use strict';
  const root = document.getElementById('cmsRoot');
  if (!root) return;

  const slug = new URLSearchParams(location.search).get('slug');
  if (!slug) {
    root.innerHTML = '<div style="text-align:center;padding:5rem 2rem;color:#64748b;">No page specified. <a href="/" style="color:#0a7575;">Home →</a></div>';
    return;
  }

  function escape(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

  // --- Section renderers ---
  const RENDER = {
    hero(d) {
      const overlay = d.overlay_opacity ?? 0.55;
      const bg = d.bg_image_url
        ? `linear-gradient(rgba(0,0,0,${overlay}),rgba(0,0,0,${overlay})), url('${escape(d.bg_image_url)}') center/cover`
        : 'linear-gradient(135deg,#0b1f2a,#0a7575)';
      const align = d.text_align || 'left';
      const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
      const color = d.text_color || '#fff';
      return `
        <section style="background:${bg};color:${color};padding:clamp(4rem,8vw,7rem) 1.5rem;min-height:60vh;display:flex;align-items:center;text-align:${align};">
          <div style="max-width:1100px;margin:0 auto;width:100%;">
            ${d.eyebrow ? `<div style="font-size:.8rem;letter-spacing:.18em;text-transform:uppercase;font-weight:700;opacity:.85;margin-bottom:.6rem;">${escape(d.eyebrow)}</div>` : ''}
            ${d.heading ? `<h1 style="font-size:clamp(2rem,5vw,3.4rem);font-weight:800;line-height:1.15;margin:0 0 .75rem;">${escape(d.heading)}${d.heading_accent ? ` <span style="color:#fbbf24;">${escape(d.heading_accent)}</span>` : ''}</h1>` : ''}
            ${d.description ? `<p style="font-size:1.05rem;line-height:1.7;max-width:680px;margin:${align==='center'?'0 auto':'0'} 0 1.5rem;opacity:.9;">${escape(d.description)}</p>` : ''}
            ${(d.btn1_text || d.btn2_text) ? `<div style="display:flex;gap:.7rem;justify-content:${justify};flex-wrap:wrap;">
              ${d.btn1_text ? `<a href="${escape(d.btn1_link||'#')}" class="btn-primary">${escape(d.btn1_text)}</a>` : ''}
              ${d.btn2_text ? `<a href="${escape(d.btn2_link||'#')}" class="btn-outline" style="border-color:rgba(255,255,255,.6);color:#fff;">${escape(d.btn2_text)}</a>` : ''}
            </div>` : ''}
          </div>
        </section>`;
    },

    rich_text(d) {
      return `<section class="section"><div class="container" style="max-width:760px;font-size:1.02rem;line-height:1.75;color:var(--gray-700);">${d.html || ''}</div></section>`;
    },

    image_text(d) {
      const side = d.side === 'right' ? 'row-reverse' : 'row';
      return `
        <section class="section">
          <div class="container">
            <div style="display:flex;flex-direction:${side};gap:2.5rem;align-items:center;flex-wrap:wrap;">
              <div style="flex:1;min-width:280px;">
                ${d.image_url ? `<img src="${escape(d.image_url)}" style="width:100%;border-radius:14px;display:block;"/>` : '<div style="aspect-ratio:4/3;background:#f1f5f9;border-radius:14px;"></div>'}
              </div>
              <div style="flex:1;min-width:280px;">
                ${d.heading ? `<h2 style="color:var(--navy-800);margin:0 0 1rem;font-size:1.8rem;font-weight:700;">${escape(d.heading)}</h2>` : ''}
                <div style="color:var(--gray-600);line-height:1.75;font-size:.95rem;">${d.body_html || ''}</div>
                ${d.btn_text ? `<a href="${escape(d.btn_link||'#')}" class="btn-primary" style="margin-top:1rem;display:inline-block;">${escape(d.btn_text)}</a>` : ''}
              </div>
            </div>
          </div>
        </section>`;
    },

    stats(d) {
      const items = (d.items || []).map((it) => `
        <div style="text-align:center;flex:1;min-width:150px;">
          <div style="font-size:2.4rem;font-weight:800;color:#fbbf24;line-height:1;">${escape(it.value)}</div>
          <div style="font-size:.85rem;color:rgba(255,255,255,.85);margin-top:.4rem;text-transform:uppercase;letter-spacing:.1em;">${escape(it.label)}</div>
        </div>`).join('');
      return `<section style="background:linear-gradient(135deg,#0b1f2a,#0a7575);padding:3rem 1.5rem;color:#fff;"><div style="max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;gap:2rem;justify-content:space-around;">${items}</div></section>`;
    },

    cta(d) {
      return `
        <section style="background:${escape(d.bg_color||'#0a7575')};padding:clamp(2.5rem,5vw,4rem) 1.5rem;color:#fff;text-align:center;">
          <div style="max-width:760px;margin:0 auto;">
            ${d.heading ? `<h2 style="font-size:clamp(1.5rem,3.5vw,2.2rem);margin:0 0 .6rem;font-weight:700;">${escape(d.heading)}</h2>` : ''}
            ${d.subtext ? `<p style="opacity:.9;margin:0 0 1.5rem;font-size:1rem;line-height:1.6;">${escape(d.subtext)}</p>` : ''}
            ${d.btn_text ? `<a href="${escape(d.btn_link||'#')}" style="display:inline-block;background:#fbbf24;color:#0b1f2a;padding:.85rem 1.8rem;border-radius:999px;text-decoration:none;font-weight:700;">${escape(d.btn_text)}</a>` : ''}
          </div>
        </section>`;
    },

    faq(d) {
      const items = (d.items || []).map((it) => `
        <details style="border:1px solid #e5e7eb;border-radius:10px;padding:1rem 1.25rem;background:#fff;margin-bottom:.6rem;">
          <summary style="font-weight:600;color:#0b1f2a;cursor:pointer;font-size:.95rem;">${escape(it.q)}</summary>
          <div style="margin-top:.6rem;color:#475569;line-height:1.6;font-size:.92rem;">${escape(it.a)}</div>
        </details>`).join('');
      return `<section class="section"><div class="container" style="max-width:780px;">${items}</div></section>`;
    },

    service_grid(d) {
      const items = (d.items || []).map((it) => `
        <a href="${escape(it.link||'#')}" style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:1.5rem;text-decoration:none;color:inherit;transition:transform .15s,box-shadow .15s;display:block;text-align:center;" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 12px 30px -10px rgba(11,31,42,.18)';" onmouseout="this.style.transform='';this.style.boxShadow='';">
          <div style="font-size:2rem;margin-bottom:.6rem;">${escape(it.icon||'•')}</div>
          <h4 style="font-size:.98rem;color:#0b1f2a;margin:0;font-weight:600;">${escape(it.title)}</h4>
        </a>`).join('');
      return `<section class="section"><div class="container"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;">${items}</div></div></section>`;
    },

    custom_html(d) {
      return `<section>${d.html || ''}</section>`;
    },
  };

  fetch('/api/cms-pages/' + encodeURIComponent(slug), { credentials: 'omit' })
    .then((r) => {
      if (r.status === 404) throw new Error('Page not found or unpublished');
      if (!r.ok) throw new Error('Failed to load');
      return r.json();
    })
    .then((body) => {
      const p = body.item;
      // Update title + meta
      document.title = p.title + ' | GreenApple Success Factors';
      const md = document.getElementById('metaDescription'); if (md) md.setAttribute('content', p.description || '');
      const ogt = document.getElementById('ogTitle'); if (ogt) ogt.setAttribute('content', p.title);
      const ogd = document.getElementById('ogDescription'); if (ogd) ogd.setAttribute('content', p.description || '');

      const html = (p.sections || [])
        .map((s) => RENDER[s.type] ? RENDER[s.type](s.data || {}) : '')
        .join('');
      root.innerHTML = html || '<div style="text-align:center;padding:5rem 2rem;color:#64748b;">This page has no sections yet.</div>';
    })
    .catch((e) => {
      root.innerHTML = `<div style="text-align:center;padding:5rem 2rem;color:#64748b;">${escape(e.message)} <a href="/" style="color:#0a7575;">Home →</a></div>`;
    });
})();
