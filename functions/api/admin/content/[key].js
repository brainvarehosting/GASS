import { json, bad, notFound, serverError, readJson } from '../../../_lib/http.js';

export const onRequestPut = async ({ params, request, env }) => {
  try {
    const { key } = params;
    const body = await readJson(request);
    if (typeof body.value !== 'string') return bad('value (string) required');

    const result = await env.DB
      .prepare("UPDATE content SET value = ?, updated_at = datetime('now') WHERE key = ?")
      .bind(body.value, key)
      .run();

    if (!result.meta?.changes) return notFound();

    await env.DB
      .prepare('INSERT INTO activity_log (action, entity, entity_id) VALUES (?,?,?)')
      .bind('content_update', 'content', key)
      .run()
      .catch(() => {});

    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};
