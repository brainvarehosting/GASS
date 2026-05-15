// Public read-through for R2 objects when no public bucket URL is configured.
// Prefer enabling the bucket's public r2.dev URL or a custom domain and
// setting R2_PUBLIC_BASE — that bypasses Functions and is faster + cheaper.

export const onRequestGet = async ({ params, env, request }) => {
  if (!env.MEDIA) return new Response('R2 not configured', { status: 500 });

  const key = Array.isArray(params.path) ? params.path.join('/') : (params.path || '');
  if (!key) return new Response('Missing key', { status: 400 });

  const obj = await env.MEDIA.get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');

  // Conditional GETs
  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch && ifNoneMatch === obj.httpEtag) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(obj.body, { headers });
};
