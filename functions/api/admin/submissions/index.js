import { json, bad, serverError } from '../../../_lib/http.js';

const VALID_TABLES = new Set(['registrations', 'contacts', 'enquiries']);

// Per-table column projections for the unified list view.
const SELECTS = {
  registrations: `
    id, created_at, status, 'registrations' AS table_name,
    COALESCE(NULLIF(TRIM(COALESCE(first_name,'')||' '||COALESCE(last_name,'')),''),'(no name)') AS name,
    email_office AS email,
    COALESCE(NULLIF(mobile,''), tel) AS phone,
    company AS organisation,
    programme AS subject
  `,
  contacts: `
    id, created_at, status, 'contacts' AS table_name,
    COALESCE(NULLIF(name,''),'(no name)') AS name,
    email, phone,
    NULL AS organisation,
    SUBSTR(COALESCE(message,''), 1, 80) AS subject
  `,
  enquiries: `
    id, created_at, status, 'enquiries' AS table_name,
    COALESCE(NULLIF(name,''),'(no name)') AS name,
    email, phone,
    organisation,
    service AS subject
  `,
};

const SEARCHABLE = {
  registrations: ['first_name', 'last_name', 'email_office', 'mobile', 'tel', 'company', 'programme'],
  contacts:      ['name', 'email', 'phone', 'message'],
  enquiries:     ['name', 'organisation', 'email', 'phone', 'service', 'message'],
};

export const onRequestGet = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const tableParam = url.searchParams.get('table'); // optional: filter to one table
    const status = url.searchParams.get('status');
    const search = (url.searchParams.get('q') || '').trim();
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);

    const tables = tableParam
      ? (VALID_TABLES.has(tableParam) ? [tableParam] : null)
      : [...VALID_TABLES];
    if (!tables) return bad('Invalid table');

    const queries = [];
    const countQueries = [];

    for (const t of tables) {
      const whereParts = [];
      const binds = [];
      if (status) { whereParts.push('status = ?'); binds.push(status); }
      if (search) {
        const cols = SEARCHABLE[t];
        whereParts.push('(' + cols.map((c) => `LOWER(COALESCE(${c},'')) LIKE ?`).join(' OR ') + ')');
        const term = `%${search.toLowerCase()}%`;
        cols.forEach(() => binds.push(term));
      }
      const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

      queries.push(env.DB.prepare(
        `SELECT ${SELECTS[t]} FROM ${t} ${where} ORDER BY id DESC`
      ).bind(...binds));

      countQueries.push(env.DB.prepare(
        `SELECT COUNT(*) AS c FROM ${t} ${where}`
      ).bind(...binds));
    }

    const [listResults, countResults] = await Promise.all([
      env.DB.batch(queries),
      env.DB.batch(countQueries),
    ]);

    const merged = listResults.flatMap((r) => r.results || []);
    merged.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    const total = countResults.reduce((s, r) => s + (r.results?.[0]?.c || 0), 0);
    const items = merged.slice(offset, offset + limit);

    return json({ ok: true, total, items, limit, offset });
  } catch (e) {
    return serverError(e);
  }
};
