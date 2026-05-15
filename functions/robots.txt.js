// GET /robots.txt — uses the canonical_base from site_settings.

export const onRequestGet = async ({ env, request }) => {
  const url = new URL(request.url);
  const setting = await env.DB.prepare("SELECT value FROM site_settings WHERE key='site.canonical_base'").first().catch(() => null);
  const base = (setting?.value || `${url.protocol}//${url.host}`).replace(/\/$/, '');

  const body = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${base}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
