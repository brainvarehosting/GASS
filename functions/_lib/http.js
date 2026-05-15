// Shared HTTP helpers for Pages Functions

export const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(init.headers || {}),
    },
  });

export const ok = (body = { ok: true }) => json(body);
export const bad = (msg, status = 400) => json({ ok: false, error: msg }, { status });
export const unauthorized = () => json({ ok: false, error: 'Unauthorized' }, { status: 401 });
export const notFound = () => json({ ok: false, error: 'Not found' }, { status: 404 });
export const serverError = (e) => {
  console.error('500:', e?.stack || e);
  return json({ ok: false, error: 'Server error' }, { status: 500 });
};

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function getClientMeta(request) {
  return {
    ip:
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      '',
    ua: request.headers.get('user-agent') || '',
    referer: request.headers.get('referer') || '',
  };
}

// Tiny in-memory rate limiter per isolate. Best-effort: Pages Functions
// can run on multiple isolates so this is a soft limit, not a guarantee.
// For abuse-grade limiting, gate the form behind Cloudflare Turnstile.
const RL = new Map();
export function rateLimit(key, { max = 20, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const bucket = RL.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  bucket.count += 1;
  RL.set(key, bucket);
  return bucket.count <= max;
}
