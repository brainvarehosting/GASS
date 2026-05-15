import { json, serverError } from '../_lib/http.js';

// GET /api/blogs?category=&q=&limit=&offset= — published only
export const onRequestGet = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || '';
    const search = (url.searchParams.get('q') || '').trim().toLowerCase();
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);

    const where = ['status = ?']; const binds = ['published'];
    if (category) { where.push('category = ?'); binds.push(category); }
    if (search) {
      where.push('(LOWER(title) LIKE ? OR LOWER(COALESCE(excerpt,\'\')) LIKE ?)');
      const t = `%${search}%`;
      binds.push(t, t);
    }
    const w = `WHERE ${where.join(' AND ')}`;

    const total = (await env.DB.prepare(`SELECT COUNT(*) AS c FROM blogs ${w}`).bind(...binds).first())?.c || 0;
    const { results } = await env.DB
      .prepare(`SELECT id, slug, title, excerpt, cover_image_url, category, author, published_at, tags_json
                  FROM blogs ${w}
                 ORDER BY published_at DESC, id DESC
                 LIMIT ? OFFSET ?`)
      .bind(...binds, limit, offset)
      .all();

    const items = (results || []).map((r) => ({
      ...r,
      tags: r.tags_json ? safeJson(r.tags_json) : [],
      tags_json: undefined,
    }));

    return json(
      { ok: true, total, items, limit, offset },
      { headers: { 'cache-control': 'public, max-age=60, s-maxage=60' } }
    );
  } catch (e) {
    return serverError(e);
  }
};

function safeJson(s) { try { return JSON.parse(s); } catch { return []; } }
