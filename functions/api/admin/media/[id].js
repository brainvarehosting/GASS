import { json, bad, notFound, serverError, readJson } from '../../../_lib/http.js';

export const onRequestGet = async ({ params, env }) => {
  try {
    const row = await env.DB.prepare('SELECT * FROM media_files WHERE id = ?').bind(params.id).first();
    if (!row) return notFound();
    return json({ ok: true, item: row });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestPut = async ({ params, request, env }) => {
  try {
    const body = await readJson(request);
    const fields = ['alt_text', 'caption', 'category'].filter((k) => k in body);
    if (!fields.length) return bad('No editable fields supplied');

    const set = fields.map((f) => `${f} = ?`).join(', ');
    const binds = fields.map((f) => body[f]);
    binds.push(params.id);

    const r = await env.DB.prepare(`UPDATE media_files SET ${set} WHERE id = ?`).bind(...binds).run();
    if (!r.meta?.changes) return notFound();
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestDelete = async ({ params, env }) => {
  try {
    const row = await env.DB.prepare('SELECT r2_key FROM media_files WHERE id = ?').bind(params.id).first();
    if (!row) return notFound();
    try { await env.MEDIA?.delete(row.r2_key); } catch {}
    await env.DB.prepare('DELETE FROM media_files WHERE id = ?').bind(params.id).run();
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};
