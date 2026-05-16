import { json, bad, notFound, serverError, readJson, getClientMeta, rateLimit } from '../../../_lib/http.js';
import { notifyEmail } from '../../../_lib/notify.js';

// POST /api/forms/:slug/submit
export const onRequestPost = async ({ params, request, env, waitUntil }) => {
  try {
    const meta = getClientMeta(request);
    if (!rateLimit(`form:${params.slug}:${meta.ip}`, { max: 8, windowMs: 60_000 })) {
      return bad('Too many submissions, please wait a moment.', 429);
    }

    const form = await env.DB.prepare('SELECT id, slug, is_active FROM forms WHERE slug = ?').bind(params.slug).first();
    if (!form || !form.is_active) return notFound();

    const { results: fields } = await env.DB
      .prepare('SELECT label, name, type, is_required FROM form_fields WHERE form_id = ?')
      .bind(form.id).all();

    const body = await readJson(request);
    const data = (body && typeof body === 'object') ? body : {};

    const errors = [];
    const cleaned = {};
    for (const f of fields || []) {
      let v = data[f.name];
      if (v === undefined || v === null) v = '';
      if (typeof v !== 'string') v = Array.isArray(v) ? v.join(', ') : String(v);
      v = v.trim();
      if (f.is_required && !v) errors.push(`${f.label} is required`);
      if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errors.push(`${f.label} must be a valid email`);
      if (v.length > 5000) errors.push(`${f.label} too long`);
      cleaned[f.name] = v;
    }
    if (errors.length) return bad(errors.join('; '));

    // Denormalize the most useful fields for the list view.
    const lower = (k) => Object.keys(cleaned).find((x) => x.toLowerCase() === k);
    const name  = cleaned[lower('name') || 'name'] || cleaned.full_name || '';
    const email = cleaned[lower('email') || 'email'] || '';
    const phone = cleaned[lower('phone') || 'phone'] || cleaned.mobile || '';

    const result = await env.DB
      .prepare(`INSERT INTO form_submissions
                  (form_id, form_slug, data_json, name, email, phone, source_page, ip_address, user_agent)
                VALUES (?,?,?,?,?,?,?,?,?)`)
      .bind(form.id, form.slug, JSON.stringify(cleaned), name, email, phone, meta.referer, meta.ip, meta.ua)
      .run();

    await notifyEmail(env, {
      subject: `[GASF] New ${form.slug} submission — ${name || '(no name)'}`,
      fields: cleaned,
    });

    return json({ ok: true, id: result.meta?.last_row_id });
  } catch (e) {
    return serverError(e);
  }
};
