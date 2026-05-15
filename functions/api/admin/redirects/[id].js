import { json, bad, notFound, serverError, readJson } from '../../../_lib/http.js';

export const onRequestPut = async ({ params, request, env }) => {
  try {
    const body = await readJson(request);
    const data = {};
    if ('source_path' in body) {
      const s = String(body.source_path).trim();
      if (!s.startsWith('/')) return bad('source_path must start with /');
      data.source_path = s;
    }
    if ('target_url' in body) {
      const t = String(body.target_url).trim();
      if (!t) return bad('target_url required');
      data.target_url = t;
    }
    if ('status_code' in body) {
      const c = parseInt(body.status_code, 10);
      if (![301, 302, 307, 308].includes(c)) return bad('invalid status_code');
      data.status_code = c;
    }
    if ('is_active' in body) data.is_active = body.is_active ? 1 : 0;

    const fields = Object.keys(data);
    if (!fields.length) return bad('No fields supplied');
    const set = [...fields.map((f) => `${f} = ?`), `updated_at = datetime('now')`].join(', ');
    const binds = [...fields.map((f) => data[f]), params.id];
    const r = await env.DB.prepare(`UPDATE redirects SET ${set} WHERE id = ?`).bind(...binds).run();
    if (!r.meta?.changes) return notFound();
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestDelete = async ({ params, env }) => {
  try {
    const r = await env.DB.prepare('DELETE FROM redirects WHERE id = ?').bind(params.id).run();
    if (!r.meta?.changes) return notFound();
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};
