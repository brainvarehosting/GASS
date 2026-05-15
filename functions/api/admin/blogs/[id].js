import { json, bad, notFound, serverError, readJson } from '../../../_lib/http.js';
import { normalizeBlog } from '../../../_lib/blogs.js';

export const onRequestGet = async ({ params, env }) => {
  try {
    const row = await env.DB.prepare('SELECT * FROM blogs WHERE id = ?').bind(params.id).first();
    if (!row) return notFound();
    return json({ ok: true, item: row });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestPut = async ({ params, request, env }) => {
  try {
    const body = await readJson(request);
    const { ok, errors, data } = normalizeBlog(body, { partial: true });
    if (!ok) return bad(errors.join('; '));
    const fields = Object.keys(data);
    if (!fields.length) return bad('No fields supplied');

    if ('slug' in data) {
      const dup = await env.DB.prepare('SELECT id FROM blogs WHERE slug = ? AND id != ?').bind(data.slug, params.id).first();
      if (dup) return bad('Slug already in use');
    }

    if (data.status === 'published' && !data.published_at) {
      const cur = await env.DB.prepare('SELECT published_at FROM blogs WHERE id = ?').bind(params.id).first();
      if (!cur?.published_at) data.published_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    const set = [...Object.keys(data).map((f) => `${f} = ?`), `updated_at = datetime('now')`].join(', ');
    const binds = [...Object.keys(data).map((f) => data[f]), params.id];
    const r = await env.DB.prepare(`UPDATE blogs SET ${set} WHERE id = ?`).bind(...binds).run();
    if (!r.meta?.changes) return notFound();
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestDelete = async ({ params, env }) => {
  try {
    const r = await env.DB.prepare('DELETE FROM blogs WHERE id = ?').bind(params.id).run();
    if (!r.meta?.changes) return notFound();
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};
