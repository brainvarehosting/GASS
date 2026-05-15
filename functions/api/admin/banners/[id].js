import { json, bad, notFound, serverError, readJson } from '../../../_lib/http.js';
import { normalizeBanner } from '../../../_lib/banners.js';

export const onRequestGet = async ({ params, env }) => {
  try {
    const row = await env.DB.prepare('SELECT * FROM hero_banners WHERE id = ?').bind(params.id).first();
    if (!row) return notFound();
    return json({ ok: true, item: row });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestPut = async ({ params, request, env }) => {
  try {
    const body = await readJson(request);
    const { ok, errors, data } = normalizeBanner(body, { partial: true });
    if (!ok) return bad(errors.join('; '));
    const fields = Object.keys(data);
    if (!fields.length) return bad('No fields supplied');

    const set = [...fields.map((f) => `${f} = ?`), `updated_at = datetime('now')`].join(', ');
    const binds = [...fields.map((f) => data[f]), params.id];
    const r = await env.DB.prepare(`UPDATE hero_banners SET ${set} WHERE id = ?`).bind(...binds).run();
    if (!r.meta?.changes) return notFound();
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestDelete = async ({ params, env }) => {
  try {
    const r = await env.DB.prepare('DELETE FROM hero_banners WHERE id = ?').bind(params.id).run();
    if (!r.meta?.changes) return notFound();
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};
