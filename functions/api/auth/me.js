import { json } from '../../_lib/http.js';
import { requireSession } from '../../_lib/auth.js';

export const onRequestGet = async ({ request, env }) => {
  const session = await requireSession(env, request);
  if (!session) return json({ ok: false, authenticated: false }, { status: 401 });
  return json({ ok: true, authenticated: true, user: session });
};
