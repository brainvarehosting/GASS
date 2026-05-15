import { json, bad, notFound, serverError, readJson } from '../../../../_lib/http.js';

const VALID = new Set(['registrations', 'contacts', 'enquiries']);
const VALID_STATUSES = new Set(['new', 'viewed', 'contacted', 'converted', 'spam', 'archived']);

async function logAction(env, action, table, id, meta) {
  try {
    await env.DB
      .prepare('INSERT INTO activity_log (action, entity, entity_id, meta) VALUES (?,?,?,?)')
      .bind(action, table, String(id), meta ? JSON.stringify(meta) : null)
      .run();
  } catch {}
}

export const onRequestGet = async ({ params, env }) => {
  try {
    const { table, id } = params;
    if (!VALID.has(table)) return bad('Invalid table');
    const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
    if (!row) return notFound();
    return json({ ok: true, item: row });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestPatch = async ({ params, request, env }) => {
  try {
    const { table, id } = params;
    if (!VALID.has(table)) return bad('Invalid table');
    const body = await readJson(request);
    if (!body.status || !VALID_STATUSES.has(body.status)) return bad('Invalid status');

    const result = await env.DB
      .prepare(`UPDATE ${table} SET status = ? WHERE id = ?`)
      .bind(body.status, id)
      .run();

    if (!result.meta?.changes) return notFound();
    await logAction(env, 'status_change', table, id, { status: body.status });
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestDelete = async ({ params, env }) => {
  try {
    const { table, id } = params;
    if (!VALID.has(table)) return bad('Invalid table');
    const result = await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
    if (!result.meta?.changes) return notFound();
    await logAction(env, 'delete', table, id, null);
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};
