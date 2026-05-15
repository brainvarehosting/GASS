// Shared validation for form builder.

export const FIELD_TYPES = new Set([
  'text', 'email', 'phone', 'textarea', 'select', 'radio', 'checkbox', 'consent', 'hidden', 'date',
]);

export const FORM_FIELDS = ['slug', 'name', 'description', 'success_message', 'redirect_url', 'notification_email', 'button_text', 'is_active'];
export const FIELD_FIELDS = ['label', 'name', 'type', 'placeholder', 'options_json', 'is_required', 'help_text', 'default_value', 'sort_order'];

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const FIELD_NAME_RE = /^[a-z][a-z0-9_]{0,40}$/;

export function normalizeForm(input, { partial = false } = {}) {
  const out = {};
  const errors = [];
  for (const f of FORM_FIELDS) if (input[f] !== undefined) out[f] = input[f];

  if (!partial) {
    if (!out.slug || !SLUG_RE.test(out.slug)) errors.push('slug must be lowercase letters/numbers/dashes (1–64 chars)');
    if (!out.name || !out.name.trim()) errors.push('name required');
  } else if ('slug' in out && !SLUG_RE.test(out.slug)) {
    errors.push('slug must be lowercase letters/numbers/dashes');
  }
  if ('is_active' in out) out.is_active = out.is_active ? 1 : 0;

  return { ok: !errors.length, errors, data: out };
}

export function normalizeField(input, { partial = false } = {}) {
  const out = {};
  const errors = [];
  for (const f of FIELD_FIELDS) if (input[f] !== undefined) out[f] = input[f];

  if (!partial) {
    if (!out.label || !out.label.trim()) errors.push('label required');
    if (!out.name || !FIELD_NAME_RE.test(out.name)) errors.push('name must be snake_case (1–41 chars, start with letter)');
    if (!out.type || !FIELD_TYPES.has(out.type)) errors.push(`type must be one of ${[...FIELD_TYPES].join(', ')}`);
  }
  if ('type' in out && !FIELD_TYPES.has(out.type)) errors.push('invalid type');
  if ('options_json' in out && out.options_json) {
    try {
      const arr = typeof out.options_json === 'string' ? JSON.parse(out.options_json) : out.options_json;
      if (!Array.isArray(arr)) throw 0;
      out.options_json = JSON.stringify(arr);
    } catch { errors.push('options_json must be a JSON array of strings'); }
  }
  if ('is_required' in out) out.is_required = out.is_required ? 1 : 0;
  if ('sort_order' in out) out.sort_order = parseInt(out.sort_order, 10) || 0;

  return { ok: !errors.length, errors, data: out };
}
