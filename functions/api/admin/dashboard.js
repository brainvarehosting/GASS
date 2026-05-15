import { json, serverError } from '../../_lib/http.js';

export const onRequestGet = async ({ env }) => {
  try {
    const today = "date(created_at) = date('now')";
    const newRow = "status = 'new'";

    const counts = await env.DB.batch([
      env.DB.prepare(`SELECT COUNT(*) AS c FROM registrations`),
      env.DB.prepare(`SELECT COUNT(*) AS c FROM contacts`),
      env.DB.prepare(`SELECT COUNT(*) AS c FROM enquiries`),
      env.DB.prepare(`SELECT COUNT(*) AS c FROM registrations WHERE ${today}`),
      env.DB.prepare(`SELECT COUNT(*) AS c FROM contacts      WHERE ${today}`),
      env.DB.prepare(`SELECT COUNT(*) AS c FROM enquiries     WHERE ${today}`),
      env.DB.prepare(`SELECT COUNT(*) AS c FROM registrations WHERE ${newRow}`),
      env.DB.prepare(`SELECT COUNT(*) AS c FROM contacts      WHERE ${newRow}`),
      env.DB.prepare(`SELECT COUNT(*) AS c FROM enquiries     WHERE ${newRow}`),
      env.DB.prepare(`SELECT COUNT(*) AS c FROM content`),
    ]);
    const n = (i) => counts[i]?.results?.[0]?.c ?? 0;

    const recent = await env.DB.batch([
      env.DB.prepare(
        `SELECT id, created_at, COALESCE(NULLIF(TRIM(first_name||' '||last_name),''),'(no name)') AS name,
                email_office AS email, mobile AS phone, programme AS subject, status, 'registrations' AS table_name
           FROM registrations ORDER BY id DESC LIMIT 5`
      ),
      env.DB.prepare(
        `SELECT id, created_at, name, email, phone, message AS subject, status, 'contacts' AS table_name
           FROM contacts ORDER BY id DESC LIMIT 5`
      ),
      env.DB.prepare(
        `SELECT id, created_at, name, email, phone, service AS subject, status, 'enquiries' AS table_name
           FROM enquiries ORDER BY id DESC LIMIT 5`
      ),
    ]);

    const recentMerged = [
      ...(recent[0]?.results || []),
      ...(recent[1]?.results || []),
      ...(recent[2]?.results || []),
    ]
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      .slice(0, 8);

    return json({
      ok: true,
      counts: {
        registrations: { total: n(0), today: n(3), new: n(6) },
        contacts:      { total: n(1), today: n(4), new: n(7) },
        enquiries:     { total: n(2), today: n(5), new: n(8) },
        content_items: n(9),
      },
      recent: recentMerged,
    });
  } catch (e) {
    return serverError(e);
  }
};
