import { json, bad, serverError } from '../../../_lib/http.js';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif',
  'application/pdf',
  'video/mp4', 'video/webm',
]);
const VALID_CATEGORIES = new Set([
  'general', 'banners', 'services', 'team', 'book', 'brochures', 'blogs', 'testimonials', 'events',
]);

const slugify = (s) =>
  String(s || 'file')
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'file';

const extFromMime = (m) => ({
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
}[m] || 'bin');

// GET /api/admin/media — list with filters
export const onRequestGet = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || '';
    const search = (url.searchParams.get('q') || '').trim().toLowerCase();
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '60', 10), 200);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);

    const where = [];
    const binds = [];
    if (category) { where.push('category = ?'); binds.push(category); }
    if (search) {
      where.push('(LOWER(filename) LIKE ? OR LOWER(COALESCE(alt_text,\'\')) LIKE ? OR LOWER(COALESCE(caption,\'\')) LIKE ?)');
      const t = `%${search}%`;
      binds.push(t, t, t);
    }
    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = (await env.DB.prepare(`SELECT COUNT(*) AS c FROM media_files ${w}`).bind(...binds).first())?.c || 0;
    const { results } = await env.DB
      .prepare(`SELECT * FROM media_files ${w} ORDER BY id DESC LIMIT ? OFFSET ?`)
      .bind(...binds, limit, offset)
      .all();

    return json({ ok: true, total, items: results || [], limit, offset });
  } catch (e) {
    return serverError(e);
  }
};

// POST /api/admin/media — multipart upload
// Form fields:
//   file       (required, the binary)
//   category   (optional, defaults to 'general')
//   alt_text   (optional)
//   caption    (optional)
export const onRequestPost = async ({ request, env }) => {
  try {
    if (!env.MEDIA) return bad('R2 bucket not bound. Add an R2 binding named MEDIA in Pages settings.', 500);

    const ct = request.headers.get('content-type') || '';
    if (!ct.startsWith('multipart/form-data')) return bad('multipart/form-data required');

    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') return bad('file required');
    if (file.size > MAX_BYTES) return bad(`File too large (max ${MAX_BYTES / 1024 / 1024} MB)`, 413);
    if (!ALLOWED.has(file.type)) return bad(`Unsupported file type: ${file.type}`);

    const category = String(form.get('category') || 'general');
    if (!VALID_CATEGORIES.has(category)) return bad(`Invalid category: ${category}`);
    const alt_text = String(form.get('alt_text') || '');
    const caption = String(form.get('caption') || '');

    const stamp = new Date().toISOString().slice(0, 10);
    const rand = crypto.randomUUID().slice(0, 8);
    const baseName = slugify((file.name || '').replace(/\.[^.]+$/, ''));
    const ext = extFromMime(file.type);
    const r2Key = `${category}/${stamp}/${rand}-${baseName}.${ext}`;

    await env.MEDIA.put(r2Key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    const publicUrl = env.R2_PUBLIC_BASE
      ? `${env.R2_PUBLIC_BASE.replace(/\/$/, '')}/${r2Key}`
      : `/api/media/${r2Key}`; // fallback: serve through Functions

    const result = await env.DB
      .prepare(
        `INSERT INTO media_files (filename, original_name, mime_type, size, r2_key, public_url, alt_text, caption, category)
         VALUES (?,?,?,?,?,?,?,?,?)`
      )
      .bind(
        `${baseName}.${ext}`,
        file.name || `${baseName}.${ext}`,
        file.type,
        file.size,
        r2Key,
        publicUrl,
        alt_text,
        caption,
        category
      )
      .run();

    return json({
      ok: true,
      id: result.meta?.last_row_id,
      r2_key: r2Key,
      public_url: publicUrl,
      mime_type: file.type,
      size: file.size,
    });
  } catch (e) {
    return serverError(e);
  }
};
