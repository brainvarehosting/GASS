// Public blog renderer.
// On blog.html: hydrates #blogList with paginated cards from /api/blogs
// On blog-post.html: reads ?slug=… and renders the article.

(function () {
  'use strict';

  const CATEGORIES = ['Business Growth','Mentoring','Leadership','Startup','Risk & Compliance','ESG','Corporate Training','Academic Empowerment'];

  function escape(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso.replace(' ', 'T') + (iso.includes('Z') ? '' : 'Z'));
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // ---------- Listing page ----------
  async function initList() {
    const listEl = document.getElementById('blogList');
    const pagerEl = document.getElementById('blogPager');
    const catEl = document.getElementById('bCat');
    const qEl = document.getElementById('bQ');
    const filterBtn = document.getElementById('bFilter');
    if (!listEl) return;

    // Populate categories
    if (catEl) {
      CATEGORIES.forEach((c) => {
        const o = document.createElement('option');
        o.value = c; o.textContent = c;
        catEl.appendChild(o);
      });
      // Honour ?category= and ?q= in URL
      const params = new URLSearchParams(location.search);
      if (params.get('category')) catEl.value = params.get('category');
      if (qEl && params.get('q')) qEl.value = params.get('q');
    }

    let offset = 0;
    const limit = 12;

    async function load() {
      listEl.innerHTML = '<div class="blog-empty">Loading…</div>';
      pagerEl.innerHTML = '';
      const params = new URLSearchParams();
      const cat = catEl?.value;
      const q = qEl?.value;
      if (cat) params.set('category', cat);
      if (q)   params.set('q', q);
      params.set('limit', limit);
      params.set('offset', offset);
      try {
        const res = await fetch('/api/blogs?' + params.toString(), { credentials: 'omit' });
        if (!res.ok) throw new Error('Failed to load posts');
        const body = await res.json();
        renderList(body);
      } catch (e) {
        listEl.innerHTML = `<div class="blog-empty">${escape(e.message)}</div>`;
      }
    }

    function renderList(body) {
      if (!body.items?.length) {
        listEl.innerHTML = '<div class="blog-empty">No posts published yet. Check back soon.</div>';
        return;
      }
      listEl.innerHTML = body.items.map((p) => `
        <div class="blog-card">
          <a href="blog-post.html?slug=${encodeURIComponent(p.slug)}">
            <div class="blog-card__cover" style="${p.cover_image_url ? `background-image:url('${escape(p.cover_image_url)}');` : 'background:linear-gradient(135deg,#0b1f2a,#0a7575);'}"></div>
            <div class="blog-card__body">
              ${p.category ? `<div class="blog-card__cat">${escape(p.category)}</div>` : ''}
              <h3 class="blog-card__title">${escape(p.title)}</h3>
              ${p.excerpt ? `<p class="blog-card__excerpt">${escape(p.excerpt)}</p>` : ''}
              <div class="blog-card__meta">
                ${p.author ? escape(p.author) + ' · ' : ''}${formatDate(p.published_at)}
              </div>
            </div>
          </a>
        </div>`).join('');

      const start = body.offset + 1;
      const end = Math.min(body.offset + body.items.length, body.total);
      pagerEl.innerHTML = `
        <button id="bgPrev" ${body.offset === 0 ? 'disabled' : ''}>← Prev</button>
        <span style="align-self:center; color:#64748b; font-size:.85rem;">${start}–${end} of ${body.total}</span>
        <button id="bgNext" ${end >= body.total ? 'disabled' : ''}>Next →</button>`;
      document.getElementById('bgPrev')?.addEventListener('click', () => { offset = Math.max(0, offset - limit); load(); window.scrollTo(0, 0); });
      document.getElementById('bgNext')?.addEventListener('click', () => { offset += limit; load(); window.scrollTo(0, 0); });
    }

    filterBtn?.addEventListener('click', () => { offset = 0; load(); });
    qEl?.addEventListener('keydown', (e) => { if (e.key === 'Enter') filterBtn.click(); });
    catEl?.addEventListener('change', () => { offset = 0; load(); });
    load();
  }

  // ---------- Single post page ----------
  async function initPost() {
    const articleEl = document.getElementById('postArticle');
    if (!articleEl) return;
    const slug = new URLSearchParams(location.search).get('slug');
    if (!slug) {
      articleEl.innerHTML = '<div class="post-error">No post specified. <a href="blog.html">Browse insights →</a></div>';
      return;
    }
    try {
      const res = await fetch('/api/blogs/' + encodeURIComponent(slug), { credentials: 'omit' });
      if (res.status === 404) {
        articleEl.innerHTML = '<div class="post-error">Post not found or unpublished. <a href="blog.html">Browse insights →</a></div>';
        return;
      }
      if (!res.ok) throw new Error('Failed to load');
      const body = await res.json();
      const p = body.item;

      // Update meta tags
      const title = p.meta_title || (p.title + ' | GreenApple Success Factors');
      document.title = title;
      const md = document.getElementById('metaDescription'); if (md) md.setAttribute('content', p.meta_description || p.excerpt || '');
      const ogt = document.getElementById('ogTitle'); if (ogt) ogt.setAttribute('content', title);
      const ogd = document.getElementById('ogDescription'); if (ogd) ogd.setAttribute('content', p.meta_description || p.excerpt || '');
      const ogi = document.getElementById('ogImage'); if (ogi) ogi.setAttribute('content', p.og_image_url || p.cover_image_url || '');

      const tagsHtml = (p.tags || []).map((t) => `<a class="post-tag" href="blog.html?q=${encodeURIComponent(t)}">${escape(t)}</a>`).join('');
      articleEl.innerHTML = `
        ${p.category ? `<span class="post-eyebrow">${escape(p.category)}</span>` : ''}
        <h1 class="post-title">${escape(p.title)}</h1>
        <div class="post-meta">${p.author ? escape(p.author) + ' · ' : ''}${formatDate(p.published_at)}</div>
        ${p.cover_image_url ? `<img src="${escape(p.cover_image_url)}" alt="${escape(p.title)}" class="post-cover"/>` : ''}
        <div class="post-content">${p.content_html || ''}</div>
        ${tagsHtml ? `<div class="post-tags">${tagsHtml}</div>` : ''}`;
    } catch (e) {
      articleEl.innerHTML = `<div class="post-error">${escape(e.message)}</div>`;
    }
  }

  function start() {
    initList();
    initPost();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
