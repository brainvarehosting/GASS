import { unauthorized } from '../../_lib/http.js';
import { requireSession } from '../../_lib/auth.js';

// Gate every /api/admin/** route with a valid session cookie.
export const onRequest = async ({ request, env, next, data }) => {
  const session = await requireSession(env, request);
  if (!session) return unauthorized();
  data.session = session;
  return next();
};
