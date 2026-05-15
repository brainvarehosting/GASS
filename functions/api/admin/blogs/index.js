import { json, bad, serverError, readJson } from '../../../_lib/http.js';
import { normalizeBlog } from '../../../_lib/blogs.js';

// GET /api/admin/blogs?status=&category=&q=&limit=&offset=
export const onRequestGet = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || '';
    const category = url.searchParams.get('category') || '';
    const search = (url.searchParams.get('q') || '').trim().toLowerCase();
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);

    const where = []; const binds = [];
    if (status)   { where.push('status = ?');   binds.push(status); }
    if (category) { where.push('category = ?'); binds.push(category); }
    if (search) {
      where.push('(LOWER(title) LIKE ? OR LOWER(COALESCE(excerpt,\'\')) LIKE ? OR LOWER(slug) LIKE ?)');
      const t = `%${search}%`;
      binds.push(t, t, t);
    }
    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const total = (await env.DB.prepare(`SELECT COUNT(*) AS c FROM blogs ${w}`).bind(...binds).first())?.c || 0;
    const { results } = await env.DB
      .prepare(`SELECT id, slug, title, excerpt, cover_image_url, category, author, status,
                       published_at, created_at, updated_at, tags_json
                  FROM blogs ${w}
                 ORDER BY COALESCE(published_at, updated_at) DESC, id DESC
                 LIMIT ? OFFSET ?`)
      .bind(...binds, limit, offset)
      .all();

    return json({ ok: true, total, items: results || [], limit, offset });
  } catch (e) {
    return serverError(e);
  }
};

// POST /api/admin/blogs — create (status defaults to draft)
export const onRequestPost = async ({ request, env }) => {
  try {
    const body = await readJson(request);
    const { ok, errors, data } = normalizeBlog(body);
    if (!ok) return bad(errors.join('; '));

    const dup = await env.DB.prepare('SELECT id FROM blogs WHERE slug = ?').bind(data.slug).first();
    if (dup) return bad('A blog with that slug already exists');

    if (!('status' in data)) data.status = 'draft';
    if (data.status === 'published' && !data.published_at) data.published_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const cols = Object.keys(data);
    const result = await env.DB
      .prepare(`INSERT INTO blogs (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
      .bind(...cols.map((c) => data[c]))
      .run();
    return json({ ok: true, id: result.meta?.last_row_id });
  } catch (e) {
    return serverError(e);
  }
};
