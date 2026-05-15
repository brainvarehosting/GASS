import { json, serverError } from '../../../../_lib/http.js';

// GET /api/admin/forms/:id/submissions
export const onRequestGet = async ({ params, request, env }) => {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || '';
    const search = (url.searchParams.get('q') || '').trim().toLowerCase();
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);

    const where = ['form_id = ?'];
    const binds = [params.id];
    if (status) { where.push('status = ?'); binds.push(status); }
    if (search) {
      where.push('(LOWER(COALESCE(name,\'\')) LIKE ? OR LOWER(COALESCE(email,\'\')) LIKE ? OR LOWER(COALESCE(phone,\'\')) LIKE ? OR LOWER(data_json) LIKE ?)');
      const t = `%${search}%`;
      binds.push(t, t, t, t);
    }
    const w = `WHERE ${where.join(' AND ')}`;

    const total = (await env.DB.prepare(`SELECT COUNT(*) AS c FROM form_submissions ${w}`).bind(...binds).first())?.c || 0;
    const { results } = await env.DB
      .prepare(`SELECT id, created_at, name, email, phone, source_page, status, data_json
                  FROM form_submissions ${w}
                 ORDER BY id DESC LIMIT ? OFFSET ?`)
      .bind(...binds, limit, offset)
      .all();
    return json({ ok: true, total, items: results || [], limit, offset });
  } catch (e) {
    return serverError(e);
  }
};
