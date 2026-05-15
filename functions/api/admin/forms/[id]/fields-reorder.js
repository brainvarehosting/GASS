import { json, bad, serverError, readJson } from '../../../../_lib/http.js';

// POST /api/admin/forms/:id/fields-reorder
// Body: { order: [fieldId1, fieldId2, ...] }
export const onRequestPost = async ({ params, request, env }) => {
  try {
    const body = await readJson(request);
    if (!Array.isArray(body.order)) return bad('order: number[] required');

    const stmts = body.order.map((id, idx) =>
      env.DB.prepare('UPDATE form_fields SET sort_order = ? WHERE id = ? AND form_id = ?')
        .bind((idx + 1) * 10, id, params.id)
    );
    if (stmts.length) await env.DB.batch(stmts);
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};
