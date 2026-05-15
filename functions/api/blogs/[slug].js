import { json, notFound, serverError } from '../../_lib/http.js';

// GET /api/blogs/:slug — published only
export const onRequestGet = async ({ params, env }) => {
  try {
    const row = await env.DB
      .prepare(`SELECT id, slug, title, excerpt, content_html, cover_image_url,
                       category, author, tags_json, meta_title, meta_description,
                       og_image_url, published_at
                  FROM blogs
                 WHERE slug = ? AND status = 'published'`)
      .bind(params.slug)
      .first();
    if (!row) return notFound();

    return json(
      {
        ok: true,
        item: {
          ...row,
          tags: row.tags_json ? safeJson(row.tags_json) : [],
          tags_json: undefined,
        },
      },
      { headers: { 'cache-control': 'public, max-age=120, s-maxage=120' } }
    );
  } catch (e) {
    return serverError(e);
  }
};

function safeJson(s) { try { return JSON.parse(s); } catch { return []; } }
