import { json } from '../../_lib/http.js';
import { clearSessionCookie } from '../../_lib/auth.js';

export const onRequestPost = async () => {
  return json({ ok: true }, { headers: { 'set-cookie': clearSessionCookie() } });
};
