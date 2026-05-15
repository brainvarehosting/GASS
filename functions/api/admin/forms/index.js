import { json, bad, serverError, readJson } from '../../../_lib/http.js';
import { normalizeForm } from '../../../_lib/forms.js';

// GET /api/admin/forms — list with field + submission counts
export const onRequestGet = async ({ env }) => {
  try {
    const { results } = await env.DB
      .prepare(`
        SELECT f.*,
               (SELECT COUNT(*) FROM form_fields ff WHERE ff.form_id = f.id) AS field_count,
               (SELECT COUNT(*) FROM form_submissions fs WHERE fs.form_id = f.id) AS submission_count
          FROM forms f
         ORDER BY f.id DESC
      `)
      .all();
    return json({ ok: true, items: results || [] });
  } catch (e) {
    return serverError(e);
  }
};

// POST /api/admin/forms — create
export const onRequestPost = async ({ request, env }) => {
  try {
    const body = await readJson(request);
    const { ok, errors, data } = normalizeForm(body);
    if (!ok) return bad(errors.join('; '));

    const dup = await env.DB.prepare('SELECT id FROM forms WHERE slug = ?').bind(data.slug).first();
    if (dup) return bad('A form with that slug already exists');

    const cols = Object.keys(data);
    const result = await env.DB
      .prepare(`INSERT INTO forms (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
      .bind(...cols.map((c) => data[c]))
      .run();
    return json({ ok: true, id: result.meta?.last_row_id });
  } catch (e) {
    return serverError(e);
  }
};
