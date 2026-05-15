import { json, serverError } from '../../../_lib/http.js';

export const onRequestGet = async ({ env }) => {
  try {
    const { results } = await env.DB
      .prepare('SELECT key, value, label, page, type, updated_at FROM content ORDER BY page, key')
      .all();
    return json({ ok: true, items: results || [] });
  } catch (e) {
    return serverError(e);
  }
};
