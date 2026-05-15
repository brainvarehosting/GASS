import { json, notFound, serverError } from '../../_lib/http.js';

// GET /api/forms/:slug — public form config (active only)
export const onRequestGet = async ({ params, env }) => {
  try {
    const form = await env.DB
      .prepare('SELECT id, slug, name, description, success_message, redirect_url, button_text FROM forms WHERE slug = ? AND is_active = 1')
      .bind(params.slug)
      .first();
    if (!form) return notFound();
    const { results: fields } = await env.DB
      .prepare(`SELECT label, name, type, placeholder, options_json, is_required, help_text, default_value
                  FROM form_fields WHERE form_id = ? ORDER BY sort_order ASC, id ASC`)
      .bind(form.id)
      .all();
    const parsedFields = (fields || []).map((f) => ({
      ...f,
      options: f.options_json ? safeJson(f.options_json) : null,
      options_json: undefined,
    }));
    return json(
      { ok: true, form, fields: parsedFields },
      { headers: { 'cache-control': 'public, max-age=60, s-maxage=60' } }
    );
  } catch (e) {
    return serverError(e);
  }
};

function safeJson(s) { try { return JSON.parse(s); } catch { return null; } }
