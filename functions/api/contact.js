import { ok, bad, serverError, readJson, getClientMeta, rateLimit } from '../_lib/http.js';
import { notifyEmail } from '../_lib/notify.js';

export const onRequestPost = async ({ request, env, waitUntil }) => {
  try {
    const meta = getClientMeta(request);
    if (!rateLimit(`contact:${meta.ip}`, { max: 10, windowMs: 60_000 })) {
      return bad('Too many submissions, please wait a moment.', 429);
    }
    const body = await readJson(request);

    const data = {
      name:        body.name    || '',
      phone:       body.phone   || '',
      email:       body.email   || '',
      message:     body.message || '',
      source_page: meta.referer,
      ip_address:  meta.ip,
      user_agent:  meta.ua,
    };

    const cols = Object.keys(data);
    const result = await env.DB
      .prepare(`INSERT INTO contacts (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`)
      .bind(...cols.map((c) => data[c]))
      .run();

    await notifyEmail(env, {
      subject: `[GASF] New Contact Message — ${data.name || '(no name)'}`,
      fields: data,
    });

    return ok({ ok: true, id: result.meta?.last_row_id });
  } catch (e) {
    return serverError(e);
  }
};
