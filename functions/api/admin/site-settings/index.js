import { json, bad, serverError, readJson } from '../../../_lib/http.js';

export const onRequestGet = async ({ env }) => {
  try {
    const { results } = await env.DB.prepare('SELECT key, value, updated_at FROM site_settings ORDER BY key').all();
    return json({ ok: true, items: results || [] });
  } catch (e) {
    return serverError(e);
  }
};

// PUT body: { settings: { key1: value1, key2: value2 } }
export const onRequestPut = async ({ request, env }) => {
  try {
    const body = await readJson(request);
    const settings = body?.settings;
    if (!settings || typeof settings !== 'object') return bad('settings: object required');

    const stmts = Object.entries(settings).map(([k, v]) =>
      env.DB
        .prepare(`INSERT INTO site_settings (key, value) VALUES (?, ?)
                  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`)
        .bind(String(k), String(v ?? ''))
    );
    if (stmts.length) await env.DB.batch(stmts);
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};
