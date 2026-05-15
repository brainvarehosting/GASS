import { json, bad, notFound, serverError, readJson } from '../../../../_lib/http.js';
import { normalizeField } from '../../../../_lib/forms.js';

// POST /api/admin/forms/:id/fields — add a field to a form
export const onRequestPost = async ({ params, request, env }) => {
  try {
    const form = await env.DB.prepare('SELECT id FROM forms WHERE id = ?').bind(params.id).first();
    if (!form) return notFound();

    const body = await readJson(request);
    const { ok, errors, data } = normalizeField(body);
    if (!ok) return bad(errors.join('; '));

    if (!('sort_order' in data)) {
      const max = await env.DB.prepare('SELECT COALESCE(MAX(sort_order),0) AS m FROM form_fields WHERE form_id = ?').bind(params.id).first();
      data.sort_order = (max?.m || 0) + 10;
    }
    data.form_id = parseInt(params.id, 10);

    const cols = Object.keys(data);
    const result = await env.DB
      .prepare(`INSERT INTO form_fields (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
      .bind(...cols.map((c) => data[c]))
      .run();
    return json({ ok: true, id: result.meta?.last_row_id });
  } catch (e) {
    return serverError(e);
  }
};
