import { bad, serverError } from '../../../_lib/http.js';

const VALID = new Set(['registrations', 'contacts', 'enquiries']);

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) lines.push(headers.map((h) => escape(r[h])).join(','));
  return lines.join('\n');
}

export const onRequestGet = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const table = url.searchParams.get('table');
    if (!table || !VALID.has(table)) return bad('table query param required (registrations|contacts|enquiries)');

    const { results } = await env.DB.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all();
    const csv = toCsv(results || []);
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${table}-${stamp}.csv"`,
        'cache-control': 'no-store',
      },
    });
  } catch (e) {
    return serverError(e);
  }
};
