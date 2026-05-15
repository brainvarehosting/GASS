import { json, serverError } from '../_lib/http.js';

// Public read of site settings — only safe-to-expose keys
const PUBLIC_KEYS = new Set([
  'site.name', 'site.tagline', 'site.default_meta_description', 'site.default_og_image_url',
  'site.favicon_url', 'site.canonical_base',
  'seo.google_analytics_id', 'seo.google_tag_manager_id', 'seo.meta_pixel_id',
]);

export const onRequestGet = async ({ env }) => {
  try {
    const { results } = await env.DB.prepare('SELECT key, value FROM site_settings').all();
    const out = {};
    for (const r of results || []) if (PUBLIC_KEYS.has(r.key)) out[r.key] = r.value;
    return json({ ok: true, settings: out }, { headers: { 'cache-control': 'public, max-age=120, s-maxage=120' } });
  } catch (e) {
    return serverError(e);
  }
};
