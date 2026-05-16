// Email notification helper.
//
// Uses Resend (https://resend.com) — free 100 emails/day, designed for
// serverless platforms (Web3Forms blocks Cloudflare Worker IPs with
// HTTP 403 Cloudflare error 1106).
//
// One-time setup:
//   1. Sign up at https://resend.com (free, just email + password)
//   2. API Keys → Create → copy the `re_...` key
//   3. Cloudflare Pages → Settings → Variables and Secrets → Production:
//        RESEND_API_KEY  = re_xxxxxxxxxxxx              (Secret)
//        NOTIFY_EMAIL    = gvagasf@gmail.com            (plain text)
//   4. Optional: NOTIFY_FROM = "GASF <noreply@yourdomain.com>"
//      Default sender is "GASF <onboarding@resend.dev>" which works
//      out-of-the-box for any destination — you only need to set
//      NOTIFY_FROM after verifying a domain in Resend.
//
// Fallback: if WEB3FORMS_KEY is set INSTEAD of RESEND_API_KEY, we will
// still try Web3Forms (works for direct browser submission, but is
// blocked from Cloudflare Functions — kept only for browser fallback).

// Internal/technical fields we never want to surface in the email body.
const HIDDEN_FIELDS = new Set(['ip_address', 'user_agent', 'source_page']);

export async function notifyEmail(env, { subject, fields }) {
  const to = env.NOTIFY_EMAIL || 'gvagasf@gmail.com';
  const from = env.NOTIFY_FROM || 'GASF Website <onboarding@resend.dev>';

  const visibleFields = Object.fromEntries(
    Object.entries(fields).filter(([k, v]) => !HIDDEN_FIELDS.has(k) && v !== null && v !== undefined && v !== '')
  );

  const lines = Object.entries(visibleFields)
    .map(([k, v]) => `${k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}: ${v}`)
    .join('\n');

  // Use visibleFields (IP/UA/source_page stripped) for email body.
  // Keep raw fields available for reply_to lookup only.
  if (env.RESEND_API_KEY) {
    return sendViaResend(env.RESEND_API_KEY, { to, from, subject, lines, fields: visibleFields, raw: fields });
  }
  if (env.WEB3FORMS_KEY) {
    return sendViaWeb3Forms(env.WEB3FORMS_KEY, { subject, lines, fields: visibleFields, raw: fields });
  }
  console.warn('notifyEmail: no email provider configured (set RESEND_API_KEY)');
}

async function sendViaResend(apiKey, { to, from, subject, lines, fields, raw }) {
  const html = `
    <h2 style="font-family:sans-serif;color:#0b1f2a;margin:0 0 12px;">${escapeHtml(subject)}</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;width:100%;max-width:680px;">
      ${Object.entries(fields)
        .map(([k, v]) => `<tr><td style="padding:8px 14px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;text-transform:capitalize;width:200px;vertical-align:top;">${escapeHtml(k.replace(/_/g, ' '))}</td><td style="padding:8px 14px;border:1px solid #e5e7eb;vertical-align:top;">${escapeHtml(String(v))}</td></tr>`)
        .join('')}
    </table>
    <p style="font-family:sans-serif;font-size:12px;color:#94a3b8;margin-top:18px;">Submitted via gasuccessfactors.com — view in admin: https://gasf-website.pages.dev/admin/</p>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        text: lines,
        html,
        reply_to: (raw || fields).email || (raw || fields).email_office || (raw || fields).email_permanent || undefined,
      }),
    });
    const body = await res.text();
    if (!res.ok) {
      console.error('Resend rejected:', res.status, body.slice(0, 400));
    } else {
      console.log('Resend ok:', res.status);
    }
  } catch (e) {
    console.error('Resend threw:', e?.message || e);
  }
}

async function sendViaWeb3Forms(key, { subject, lines, fields, raw }) {
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        access_key: key, subject, from_name: 'GASF Website',
        email: (raw || fields).email || (raw || fields).email_office || (raw || fields).email_permanent || 'noreply@gasuccessfactors.com',
        message: lines || subject, ...fields,
      }),
    });
    const body = await res.text();
    if (!res.ok || !body.includes('"success":true')) {
      console.error('Web3Forms rejected (datacenter IPs are blocked — switch to RESEND_API_KEY):', res.status, body.slice(0, 200));
    }
  } catch (e) {
    console.error('Web3Forms threw:', e?.message || e);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
