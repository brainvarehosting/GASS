// Section schema for the page builder.
// Each section: { type: string, data: object }.
// Validation is deliberately permissive — admin is single-user.

export const SECTION_TYPES = new Set([
  'hero', 'rich_text', 'image_text', 'stats', 'cta', 'faq', 'service_grid', 'custom_html',
]);

export function normalizeSections(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((s) => s && typeof s === 'object' && SECTION_TYPES.has(s.type))
    .map((s) => ({ type: s.type, data: (s.data && typeof s.data === 'object') ? s.data : {} }));
}

export function sanitizeHtmlBlock(html) {
  if (!html || typeof html !== 'string') return '';
  let s = html;
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  s = s.replace(/<iframe\b[^>]*src=["']?(?!https?:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com|player\.vimeo\.com|w\.soundcloud\.com))[^>]*>[\s\S]*?<\/iframe\s*>/gi, '');
  s = s.replace(/\s(on\w+)=("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  s = s.replace(/\s(href|src)=(["'])\s*javascript:[^"']*\2/gi, ' $1="#"');
  return s;
}
