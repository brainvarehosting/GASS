// Email notification helper — fire-and-forget POST to Web3Forms.
// Web3Forms is free (no signup, just verify the destination email),
// works over HTTPS so it runs from Pages Functions, and the destination
// inbox is baked into the access key. Generate a key at
//   https://web3forms.com/  →  enter gvagasf@gmail.com
// then set WEB3FORMS_KEY in Pages env vars (Production).
//
// Use ctx.waitUntil(notifyEmail(...)) so the user-facing response isn't
// blocked while the email send completes.

export async function notifyEmail(env, { subject, fields }) {
  const key = env.WEB3FORMS_KEY;
  if (!key) return; // silently skip when not configured

  const lines = Object.entries(fields)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}: ${v}`)
    .join('\n');

  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        access_key: key,
        subject,
        from_name: 'GASF Website',
        message: lines,
        ...fields,
      }),
    });
  } catch (e) {
    console.error('notifyEmail failed:', e?.message || e);
  }
}
