import { ok, bad, serverError, readJson, getClientMeta, rateLimit } from '../_lib/http.js';
import { notifyEmail } from '../_lib/notify.js';

export const onRequestPost = async ({ request, env, waitUntil }) => {
  try {
    const meta = getClientMeta(request);
    if (!rateLimit(`reg:${meta.ip}`, { max: 8, windowMs: 60_000 })) {
      return bad('Too many submissions, please wait a moment.', 429);
    }
    const body = await readJson(request);

    const data = {
      reg_type:        body.reg_type        || '',
      programme:       body.programme       || '',
      title:           body.title           || '',
      first_name:      body.first_name      || '',
      middle_name:     body.middle_name     || '',
      last_name:       body.last_name       || '',
      dob:             body.dob             || '',
      designation:     body.designation     || '',
      company:         body.company         || '',
      industry:        body.industry        || '',
      specialization:  body.specialization  || '',
      addr_office:     body.addr_office     || '',
      pin_office:      body.pin_office      || '',
      addr_residence:  body.addr_residence  || '',
      pin_residence:   body.pin_residence   || '',
      tel:             body.tel             || '',
      mobile:          body.mobile          || '',
      email_office:    body.email_office    || '',
      email_permanent: body.email_permanent || '',
      iod_member:      body.iod_member      || 'no',
      amount:          body.amount          || '',
      date:            body.date            || '',
      source_page:     meta.referer,
      ip_address:      meta.ip,
      user_agent:      meta.ua,
    };

    const cols = Object.keys(data);
    const placeholders = cols.map(() => '?').join(',');
    const values = cols.map((c) => data[c]);

    const result = await env.DB
      .prepare(`INSERT INTO registrations (${cols.join(',')}) VALUES (${placeholders})`)
      .bind(...values)
      .run();

    await notifyEmail(env, {
      subject: `[GASF] New Registration — ${[data.first_name, data.last_name].filter(Boolean).join(' ') || '(no name)'}`,
      fields: data,
    });

    return ok({ ok: true, id: result.meta?.last_row_id });
  } catch (e) {
    return serverError(e);
  }
};
