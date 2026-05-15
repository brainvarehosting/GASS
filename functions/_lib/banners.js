// Shared validation + normalization for hero banner records.

export const BG_TYPES = new Set(['image', 'gradient', 'image_overlay', 'solid', 'video']);
export const TEXT_ALIGNS = new Set(['left', 'center', 'right']);

export const BANNER_FIELDS = [
  'eyebrow', 'heading', 'heading_accent', 'description',
  'btn1_text', 'btn1_link', 'btn2_text', 'btn2_link',
  'bg_type', 'bg_image_url', 'bg_image_mobile_url', 'bg_video_url',
  'bg_color', 'bg_gradient_from', 'bg_gradient_to', 'overlay_opacity',
  'text_align', 'text_color', 'is_active', 'sort_order',
];

export function normalizeBanner(input, { partial = false } = {}) {
  const out = {};
  const errors = [];

  for (const f of BANNER_FIELDS) {
    if (input[f] === undefined) continue;
    out[f] = input[f];
  }

  if (!partial) {
    if (!out.heading || typeof out.heading !== 'string' || !out.heading.trim()) {
      errors.push('heading is required');
    }
  }
  if ('bg_type' in out && !BG_TYPES.has(out.bg_type)) {
    errors.push(`bg_type must be one of ${[...BG_TYPES].join(', ')}`);
  }
  if ('text_align' in out && !TEXT_ALIGNS.has(out.text_align)) {
    errors.push('text_align must be left, center or right');
  }
  if ('overlay_opacity' in out) {
    const v = Number(out.overlay_opacity);
    if (!Number.isFinite(v) || v < 0 || v > 1) errors.push('overlay_opacity must be 0..1');
    else out.overlay_opacity = v;
  }
  if ('is_active' in out) out.is_active = out.is_active ? 1 : 0;
  if ('sort_order' in out) out.sort_order = parseInt(out.sort_order, 10) || 0;

  return { ok: errors.length === 0, errors, data: out };
}
