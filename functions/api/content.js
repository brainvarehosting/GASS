import { json, serverError } from '../_lib/http.js';

// Public, cacheable read of all content key/value pairs.
export const onRequestGet = async ({ env }) => {
  try {
    const { results } = await env.DB.prepare('SELECT key, value FROM content').all();
    const map = {};
    for (const r of results || []) map[r.key] = r.value;
    return json(
      { ok: true, content: map },
      { headers: { 'cache-control': 'public, max-age=60, s-maxage=60' } }
    );
  } catch (e) {
    return serverError(e);
  }
};
