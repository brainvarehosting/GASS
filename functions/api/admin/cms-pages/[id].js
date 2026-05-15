import { json, bad, notFound, serverError, readJson } from '../../../_lib/http.js';
import { normalizeSections } from '../../../_lib/sections.js';

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,118}[a-z0-9])?$/;

export const onRequestGet = async ({ params, env }) => {
  try {
    const row = await env.DB.prepare('SELECT * FROM cms_pages WHERE id = ?').bind(params.id).first();
    if (!row) return notFound();
    let sections = [];
    try { sections = JSON.parse(row.sections_json || '[]'); } catch {}
    return json({ ok: true, item: { ...row, sections, sections_json: undefined } });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestPut = async ({ params, request, env }) => {
  try {
    const body = await readJson(request);
    const data = {};
    if ('slug' in body) {
      if (!SLUG_RE.test(body.slug)) return bad('slug invalid');
      const dup = await env.DB.prepare('SELECT id FROM cms_pages WHERE slug = ? AND id != ?').bind(body.slug, params.id).first();
      if (dup) return bad('Slug already in use');
      data.slug = body.slug;
    }
    if ('title' in body) data.title = body.title;
    if ('description' in body) data.description = body.description;
    if ('status' in body && ['draft','published','archived'].includes(body.status)) data.status = body.status;
    if ('sections' in body) data.sections_json = JSON.stringify(normalizeSections(body.sections));

    const fields = Object.keys(data);
    if (!fields.length) return bad('No fields supplied');
    const set = [...fields.map((f) => `${f} = ?`), `updated_at = datetime('now')`].join(', ');
    const binds = [...fields.map((f) => data[f]), params.id];
    const r = await env.DB.prepare(`UPDATE cms_pages SET ${set} WHERE id = ?`).bind(...binds).run();
    if (!r.meta?.changes) return notFound();
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};

export const onRequestDelete = async ({ params, env }) => {
  try {
    const r = await env.DB.prepare('DELETE FROM cms_pages WHERE id = ?').bind(params.id).run();
    if (!r.meta?.changes) return notFound();
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
};
