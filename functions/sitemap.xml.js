// GET /sitemap.xml — auto-generated from CMS data + static page list.

const STATIC_PAGES = [
  '/', '/services.html', '/profile.html', '/business-consulting.html',
  '/startup-mentoring.html', '/academic-empowerment.html', '/training-programs.html',
  '/risk-compliance-funding.html', '/branding-transformation.html',
  '/cxo-conclave.html', '/cxo-brochure.html', '/cxo-registration.html',
  '/mentoring-form.html', '/registration.html', '/reach-us.html',
  '/brochure.html', '/gallery.html', '/blog.html',
];

export const onRequestGet = async ({ env, request }) => {
  const url = new URL(request.url);
  const setting = await env.DB.prepare("SELECT value FROM site_settings WHERE key='site.canonical_base'").first().catch(() => null);
  const base = (setting?.value || `${url.protocol}//${url.host}`).replace(/\/$/, '');

  const urls = [];
  for (const p of STATIC_PAGES) {
    urls.push({ loc: base + p, priority: p === '/' ? '1.0' : '0.7' });
  }

  // Add published blogs
  try {
    const { results } = await env.DB
      .prepare("SELECT slug, COALESCE(published_at, updated_at) AS lastmod FROM blogs WHERE status='published'")
      .all();
    for (const b of results || []) {
      urls.push({
        loc: `${base}/blog-post.html?slug=${encodeURIComponent(b.slug)}`,
        lastmod: b.lastmod ? b.lastmod.replace(' ', 'T') + 'Z' : undefined,
        priority: '0.6',
      });
    }
  } catch {}

  // Add CMS pages (Phase 7)
  try {
    const { results } = await env.DB
      .prepare("SELECT slug, updated_at FROM cms_pages WHERE status='published'")
      .all();
    for (const p of results || []) {
      urls.push({
        loc: `${base}/p/${encodeURIComponent(p.slug)}`,
        lastmod: p.updated_at ? p.updated_at.replace(' ', 'T') + 'Z' : undefined,
        priority: '0.6',
      });
    }
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', "'":'&apos;', '"':'&quot;' }[c]));
}
