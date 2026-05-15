import { json, bad, serverError, readJson } from '../../../_lib/http.js';

export const onRequestGet = async ({ env }) => {
  try {
    const { results } = await env.DB
      .prepare('SELECT * FROM redirects ORDER BY id DESC')
      .all();
    return json({ ok: true, items: results || [] });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestPost = async ({ request, env }) => {
  try {
    const body = await readJson(request);
    const source = String(body.source_path || '').trim();
    const target = String(body.target_url || '').trim();
    const status = parseInt(body.status_code || 301, 10);
    const active = body.is_active === false || body.is_active === 0 ? 0 : 1;

    if (!source || !source.startsWith('/')) return bad('source_path must start with /');
    if (!target) return bad('target_url required');
    if (![301, 302, 307, 308].includes(status)) return bad('status_code must be 301, 302, 307 or 308');

    const dup = await env.DB.prepare('SELECT id FROM redirects WHERE source_path = ?').bind(source).first();
    if (dup) return bad('A redirect for that source_path already exists');

    const r = await env.DB
      .prepare('INSERT INTO redirects (source_path, target_url, status_code, is_active) VALUES (?,?,?,?)')
      .bind(source, target, status, active)
      .run();
    return json({ ok: true, id: r.meta?.last_row_id });
  } catch (e) {
    return serverError(e);
  }
};
