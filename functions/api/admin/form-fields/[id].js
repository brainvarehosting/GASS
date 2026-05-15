import { json, bad, notFound, serverError, readJson } from '../../../_lib/http.js';
import { normalizeField } from '../../../_lib/forms.js';

export const onRequestPut = async ({ params, request, env }) => {
  try {
    const body = await readJson(request);
    const { ok, errors, data } = normalizeField(body, { partial: true });
    if (!ok) return bad(errors.join('; '));
    const fields = Object.keys(data);
    if (!fields.length) return bad('No fields supplied');

    const set = fields.map((f) => `${f} = ?`).join(', ');
    const binds = [...fields.map((f) => data[f]), params.id];
    const r = await env.DB.prepare(`UPDATE form_fields SET ${set} WHERE id = ?`).bind(...binds).run();
    if (!r.meta?.changes) return notFound();
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestDelete = async ({ params, env }) => {
  try {
    const r = await env.DB.prepare('DELETE FROM form_fields WHERE id = ?').bind(params.id).run();
    if (!r.meta?.changes) return notFound();
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};
