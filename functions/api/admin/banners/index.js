import { json, bad, serverError, readJson } from '../../../_lib/http.js';
import { normalizeBanner } from '../../../_lib/banners.js';

// GET /api/admin/banners — list everything (active + inactive)
export const onRequestGet = async ({ env }) => {
  try {
    const { results } = await env.DB
      .prepare('SELECT * FROM hero_banners ORDER BY sort_order ASC, id ASC')
      .all();
    return json({ ok: true, items: results || [] });
  } catch (e) {
    return serverError(e);
  }
};

// POST /api/admin/banners — create
export const onRequestPost = async ({ request, env }) => {
  try {
    const body = await readJson(request);
    const { ok, errors, data } = normalizeBanner(body);
    if (!ok) return bad(errors.join('; '));

    if (!('sort_order' in data)) {
      const max = await env.DB.prepare('SELECT COALESCE(MAX(sort_order),0) AS m FROM hero_banners').first();
      data.sort_order = (max?.m || 0) + 10;
    }

    const cols = Object.keys(data);
    const result = await env.DB
      .prepare(`INSERT INTO hero_banners (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
      .bind(...cols.map((c) => data[c]))
      .run();
    return json({ ok: true, id: result.meta?.last_row_id });
  } catch (e) {
    return serverError(e);
  }
};
