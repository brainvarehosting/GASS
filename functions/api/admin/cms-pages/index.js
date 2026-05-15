import { json, bad, serverError, readJson } from '../../../_lib/http.js';
import { normalizeSections } from '../../../_lib/sections.js';

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,118}[a-z0-9])?$/;

export const onRequestGet = async ({ env }) => {
  try {
    const { results } = await env.DB
      .prepare('SELECT id, slug, title, description, status, updated_at FROM cms_pages ORDER BY id DESC')
      .all();
    return json({ ok: true, items: results || [] });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestPost = async ({ request, env }) => {
  try {
    const body = await readJson(request);
    const slug = String(body.slug || '').trim();
    const title = String(body.title || '').trim();
    if (!SLUG_RE.test(slug)) return bad('slug must be lowercase letters/numbers/dashes');
    if (!title) return bad('title required');

    const dup = await env.DB.prepare('SELECT id FROM cms_pages WHERE slug = ?').bind(slug).first();
    if (dup) return bad('A page with that slug already exists');

    const sections = JSON.stringify(normalizeSections(body.sections));
    const description = String(body.description || '');
    const status = ['draft','published','archived'].includes(body.status) ? body.status : 'draft';

    const r = await env.DB
      .prepare('INSERT INTO cms_pages (slug, title, description, sections_json, status) VALUES (?,?,?,?,?)')
      .bind(slug, title, description, sections, status)
      .run();
    return json({ ok: true, id: r.meta?.last_row_id });
  } catch (e) {
    return serverError(e);
  }
};
