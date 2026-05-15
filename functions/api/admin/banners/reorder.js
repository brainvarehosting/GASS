import { json, bad, serverError, readJson } from '../../../_lib/http.js';

// POST /api/admin/banners/reorder
// Body: { order: [id1, id2, id3, ...] }
export const onRequestPost = async ({ request, env }) => {
  try {
    const body = await readJson(request);
    if (!Array.isArray(body.order)) return bad('order: number[] required');

    const stmts = body.order.map((id, idx) =>
      env.DB.prepare("UPDATE hero_banners SET sort_order = ?, updated_at = datetime('now') WHERE id = ?")
        .bind((idx + 1) * 10, id)
    );
    if (stmts.length) await env.DB.batch(stmts);
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};
