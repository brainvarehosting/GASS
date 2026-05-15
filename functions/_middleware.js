// Root middleware — runs for any request not matched by a static file.
// We use it to honour CMS-managed redirects and (optionally) to skip work
// on /api and /admin paths.
//
// NOTE: redirects only fire for paths that DON'T exist as static files.
// If you want to redirect away from an existing HTML file, delete that
// file from the repo first.

export const onRequest = async ({ request, env, next }) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Skip API and admin — they have their own routing.
  if (path.startsWith('/api/') || path.startsWith('/admin/') || path === '/admin') {
    return next();
  }

  // Look up redirect (cheap indexed query)
  try {
    const row = await env.DB
      .prepare('SELECT target_url, status_code FROM redirects WHERE source_path = ? AND is_active = 1 LIMIT 1')
      .bind(path)
      .first();
    if (row) {
      // Best-effort hit counter; don't block the redirect on it
      env.DB.prepare('UPDATE redirects SET hits = hits + 1 WHERE source_path = ?').bind(path).run().catch(() => {});
      const target = row.target_url.startsWith('http') ? row.target_url : new URL(row.target_url, url.origin).href;
      return Response.redirect(target, row.status_code || 301);
    }
  } catch {
    // DB unavailable — fall through to static asset handling
  }

  return next();
};
