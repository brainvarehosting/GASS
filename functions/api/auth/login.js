import { json, bad, serverError, readJson, getClientMeta, rateLimit } from '../../_lib/http.js';
import {
  signSession,
  setSessionCookie,
  hashPassword,
  verifyPassword,
} from '../../_lib/auth.js';

// Login. Two supported credential modes (env vars set in Pages dashboard):
//   1) ADMIN_PASSWORD_HASH = "<saltB64>.<hashB64>" (preferred, generated via PBKDF2)
//   2) ADMIN_PASSWORD      = "<plain>"             (convenience fallback)
//
// Set SESSION_SECRET to a long random string.

export const onRequestPost = async ({ request, env }) => {
  try {
    const meta = getClientMeta(request);
    if (!rateLimit(`login:${meta.ip}`, { max: 8, windowMs: 5 * 60_000 })) {
      return bad('Too many attempts, try again later.', 429);
    }

    const { password } = await readJson(request);
    if (!password || typeof password !== 'string') return bad('Password required');

    if (!env.SESSION_SECRET) return bad('Server misconfigured: missing SESSION_SECRET', 500);

    let valid = false;
    if (env.ADMIN_PASSWORD_HASH) {
      valid = await verifyPassword(password, env.ADMIN_PASSWORD_HASH);
    } else if (env.ADMIN_PASSWORD) {
      valid = password === env.ADMIN_PASSWORD;
    } else {
      return bad('Server misconfigured: set ADMIN_PASSWORD or ADMIN_PASSWORD_HASH', 500);
    }

    if (!valid) return bad('Invalid password', 401);

    const token = await signSession(env.SESSION_SECRET, { sub: 'admin' });
    return json(
      { ok: true },
      { headers: { 'set-cookie': setSessionCookie(token) } }
    );
  } catch (e) {
    return serverError(e);
  }
};

// Helper endpoint: hash a password (only available when no admin set yet,
// so we don't leak hashing as a service). Disabled by default — uncomment
// the next line if you need to generate ADMIN_PASSWORD_HASH on the fly.
// export const onRequestGet = async ({ request }) => {
//   const url = new URL(request.url);
//   const pw = url.searchParams.get('p');
//   if (!pw) return bad('Missing ?p=');
//   const hash = await hashPassword(pw);
//   return json({ hash });
// };
