import { ok, bad, serverError, readJson, getClientMeta, rateLimit } from '../_lib/http.js';

export const onRequestPost = async ({ request, env }) => {
  try {
    const meta = getClientMeta(request);
    if (!rateLimit(`enq:${meta.ip}`, { max: 10, windowMs: 60_000 })) {
      return bad('Too many submissions, please wait a moment.', 429);
    }
    const body = await readJson(request);

    const data = {
      name:         body.name         || '',
      organisation: body.organisation || '',
      email:        body.email        || '',
      phone:        body.phone        || '',
      service:      body.service      || '',
      message:      body.message      || '',
      source_page:  meta.referer,
      ip_address:   meta.ip,
      user_agent:   meta.ua,
    };

    const cols = Object.keys(data);
    const result = await env.DB
      .prepare(`INSERT INTO enquiries (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`)
      .bind(...cols.map((c) => data[c]))
      .run();

    return ok({ ok: true, id: result.meta?.last_row_id });
  } catch (e) {
    return serverError(e);
  }
};
