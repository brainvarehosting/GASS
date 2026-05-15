import { json, notFound, serverError } from '../../_lib/http.js';

export const onRequestGet = async ({ params, env }) => {
  try {
    const row = await env.DB
      .prepare("SELECT slug, title, description, sections_json, updated_at FROM cms_pages WHERE slug = ? AND status = 'published'")
      .bind(params.slug)
      .first();
    if (!row) return notFound();
    let sections = [];
    try { sections = JSON.parse(row.sections_json || '[]'); } catch {}
    return json(
      { ok: true, item: { slug: row.slug, title: row.title, description: row.description, sections, updated_at: row.updated_at } },
      { headers: { 'cache-control': 'public, max-age=120, s-maxage=120' } }
    );
  } catch (e) {
    return serverError(e);
  }
};
