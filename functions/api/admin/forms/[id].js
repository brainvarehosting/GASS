import { json, bad, notFound, serverError, readJson } from '../../../_lib/http.js';
import { normalizeForm } from '../../../_lib/forms.js';

// GET /api/admin/forms/:id — form + ordered fields
export const onRequestGet = async ({ params, env }) => {
  try {
    const form = await env.DB.prepare('SELECT * FROM forms WHERE id = ?').bind(params.id).first();
    if (!form) return notFound();
    const { results: fields } = await env.DB
      .prepare('SELECT * FROM form_fields WHERE form_id = ? ORDER BY sort_order ASC, id ASC')
      .bind(params.id)
      .all();
    return json({ ok: true, item: form, fields: fields || [] });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestPut = async ({ params, request, env }) => {
  try {
    const body = await readJson(request);
    const { ok, errors, data } = normalizeForm(body, { partial: true });
    if (!ok) return bad(errors.join('; '));
    const fields = Object.keys(data);
    if (!fields.length) return bad('No fields supplied');

    if ('slug' in data) {
      const dup = await env.DB.prepare('SELECT id FROM forms WHERE slug = ? AND id != ?').bind(data.slug, params.id).first();
      if (dup) return bad('A form with that slug already exists');
    }

    const set = [...fields.map((f) => `${f} = ?`), `updated_at = datetime('now')`].join(', ');
    const binds = [...fields.map((f) => data[f]), params.id];
    const r = await env.DB.prepare(`UPDATE forms SET ${set} WHERE id = ?`).bind(...binds).run();
    if (!r.meta?.changes) return notFound();
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestDelete = async ({ params, env }) => {
  try {
    const r = await env.DB.prepare('DELETE FROM forms WHERE id = ?').bind(params.id).run();
    if (!r.meta?.changes) return notFound();
    // ON DELETE CASCADE on form_fields/form_submissions cleans the rest
    await env.DB.prepare('DELETE FROM form_fields WHERE form_id = ?').bind(params.id).run().catch(() => {});
    await env.DB.prepare('DELETE FROM form_submissions WHERE form_id = ?').bind(params.id).run().catch(() => {});
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};
