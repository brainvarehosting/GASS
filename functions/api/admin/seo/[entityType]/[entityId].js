import { json, bad, serverError, readJson } from '../../../../_lib/http.js';

const FIELDS = ['meta_title', 'meta_description', 'focus_keyword', 'canonical_url',
  'og_title', 'og_description', 'og_image_url', 'twitter_image_url',
  'index_status', 'schema_type'];

export const onRequestGet = async ({ params, env }) => {
  try {
    const row = await env.DB
      .prepare('SELECT * FROM seo_meta WHERE entity_type = ? AND entity_id = ?')
      .bind(params.entityType, params.entityId)
      .first();
    return json({ ok: true, item: row || null });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestPut = async ({ params, request, env }) => {
  try {
    const body = await readJson(request);
    const data = {};
    for (const f of FIELDS) if (body[f] !== undefined) data[f] = body[f];
    if (data.index_status && !['index', 'noindex'].includes(data.index_status)) {
      return bad('index_status must be "index" or "noindex"');
    }

    const existing = await env.DB
      .prepare('SELECT id FROM seo_meta WHERE entity_type = ? AND entity_id = ?')
      .bind(params.entityType, params.entityId)
      .first();

    if (existing) {
      const set = [...Object.keys(data).map((f) => `${f} = ?`), `updated_at = datetime('now')`].join(', ');
      const binds = [...Object.keys(data).map((f) => data[f]), existing.id];
      await env.DB.prepare(`UPDATE seo_meta SET ${set} WHERE id = ?`).bind(...binds).run();
    } else {
      const cols = ['entity_type', 'entity_id', ...Object.keys(data)];
      const vals = [params.entityType, params.entityId, ...Object.keys(data).map((f) => data[f])];
      await env.DB
        .prepare(`INSERT INTO seo_meta (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
        .bind(...vals)
        .run();
    }
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};
