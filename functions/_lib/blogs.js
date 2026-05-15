// Blog post validation + sanitization.

export const BLOG_FIELDS = [
  'slug', 'title', 'excerpt', 'content_html', 'cover_image_url',
  'category', 'author', 'tags_json', 'meta_title', 'meta_description',
  'og_image_url', 'status', 'published_at',
];

export const BLOG_STATUSES = new Set(['draft', 'published', 'archived']);

export const BLOG_CATEGORIES = [
  'Business Growth', 'Mentoring', 'Leadership', 'Startup',
  'Risk & Compliance', 'ESG', 'Corporate Training', 'Academic Empowerment',
];

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,118}[a-z0-9])?$/;

// Whitelist sanitisation: strip <script>, on* attrs, javascript: URLs.
// Defence in depth — admin is single-user but still cheap to harden.
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';
  let s = html;
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  s = s.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi, '');
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '');
  s = s.replace(/\s(on\w+)=("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  s = s.replace(/\s(href|src)=(["'])\s*javascript:[^"']*\2/gi, ' $1="#"');
  return s;
}

export function normalizeBlog(input, { partial = false } = {}) {
  const out = {};
  const errors = [];
  for (const f of BLOG_FIELDS) if (input[f] !== undefined) out[f] = input[f];

  if (!partial) {
    if (!out.slug || !SLUG_RE.test(out.slug)) errors.push('slug must be lowercase letters/numbers/dashes (1–120 chars)');
    if (!out.title || !out.title.trim()) errors.push('title required');
  } else if ('slug' in out && !SLUG_RE.test(out.slug)) {
    errors.push('slug invalid');
  }
  if ('status' in out && !BLOG_STATUSES.has(out.status)) errors.push('invalid status');
  if ('content_html' in out) out.content_html = sanitizeHtml(out.content_html);
  if ('tags_json' in out && out.tags_json) {
    try {
      const arr = typeof out.tags_json === 'string' ? JSON.parse(out.tags_json) : out.tags_json;
      if (!Array.isArray(arr)) throw 0;
      out.tags_json = JSON.stringify(arr.filter((t) => typeof t === 'string' && t.trim()).slice(0, 30));
    } catch { errors.push('tags_json must be a JSON array of strings'); }
  }
  return { ok: !errors.length, errors, data: out };
}
