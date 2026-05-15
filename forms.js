// Embeds CMS-managed forms on any static page.
// Usage:
//   <div data-gasf-form="newsletter"></div>
//   <script src="/forms.js" defer></script>
//
// Optional attribute: data-gasf-style="card" (default) or "bare" to skip the
// card wrapper.

(function () {
  'use strict';
  if (window.__GASF_FORMS_LOADED__) return;
  window.__GASF_FORMS_LOADED__ = true;

  const STYLE = `
    .gasf-form{background:#fff;border:1px solid #e5e7eb;border-radius:.85rem;padding:1.5rem;max-width:560px;font-family:inherit;}
    .gasf-form.bare{background:transparent;border:none;padding:0;}
    .gasf-form h3{margin:0 0 .25rem;font-size:1.1rem;color:#0b1f2a;font-weight:700;}
    .gasf-form p.gf-desc{margin:0 0 1rem;font-size:.85rem;color:#64748b;}
    .gasf-form label{display:block;margin-bottom:.85rem;font-size:.85rem;color:#0b1f2a;font-weight:500;}
    .gasf-form .gf-help{display:block;font-size:.75rem;color:#64748b;font-weight:400;margin-top:.2rem;}
    .gasf-form .gf-req{color:#dc2626;}
    .gasf-form input[type=text],.gasf-form input[type=email],.gasf-form input[type=tel],.gasf-form input[type=date],.gasf-form select,.gasf-form textarea{
      width:100%;padding:.55rem .8rem;border:1px solid #d1d5db;border-radius:.5rem;font-size:.9rem;background:#fff;font-family:inherit;color:#0b1f2a;margin-top:.3rem;
    }
    .gasf-form input:focus,.gasf-form select:focus,.gasf-form textarea:focus{outline:none;border-color:#13b8b8;box-shadow:0 0 0 3px rgba(19,184,184,.18)}
    .gasf-form textarea{min-height:90px;resize:vertical;}
    .gasf-form .gf-radio,.gasf-form .gf-check{display:flex;align-items:center;gap:.5rem;font-weight:400;margin:.3rem 0;font-size:.9rem;}
    .gasf-form button.gf-submit{background:#0a7575;color:#fff;border:none;padding:.7rem 1.4rem;border-radius:.6rem;font-size:.9rem;font-weight:600;cursor:pointer;width:100%;margin-top:.5rem;}
    .gasf-form button.gf-submit:disabled{opacity:.6;cursor:wait;}
    .gasf-form button.gf-submit:hover:not(:disabled){background:#075c5c;}
    .gasf-form .gf-msg{margin-top:.85rem;padding:.7rem .9rem;border-radius:.5rem;font-size:.85rem;}
    .gasf-form .gf-msg.ok{background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;}
    .gasf-form .gf-msg.err{background:#fef2f2;color:#991b1b;border:1px solid #fecaca;}
  `;

  function injectStyles() {
    if (document.getElementById('gasf-forms-style')) return;
    const s = document.createElement('style');
    s.id = 'gasf-forms-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function escape(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function renderField(f) {
    const req = f.is_required ? '<span class="gf-req">*</span>' : '';
    const ph = f.placeholder ? ` placeholder="${escape(f.placeholder)}"` : '';
    const def = f.default_value ? ` value="${escape(f.default_value)}"` : '';
    const reqAttr = f.is_required ? ' required' : '';
    const help = f.help_text ? `<span class="gf-help">${escape(f.help_text)}</span>` : '';

    if (f.type === 'hidden') {
      return `<input type="hidden" name="${escape(f.name)}"${def}/>`;
    }
    if (f.type === 'consent') {
      return `<label class="gf-check"><input type="checkbox" name="${escape(f.name)}" value="yes"${reqAttr}/> <span>${escape(f.label)} ${req}</span></label>${help}`;
    }
    if (f.type === 'textarea') {
      return `<label>${escape(f.label)} ${req}${help}<textarea name="${escape(f.name)}"${ph}${reqAttr}>${escape(f.default_value || '')}</textarea></label>`;
    }
    if (f.type === 'select') {
      const opts = (f.options || []).map((o) => `<option value="${escape(o)}">${escape(o)}</option>`).join('');
      return `<label>${escape(f.label)} ${req}${help}<select name="${escape(f.name)}"${reqAttr}><option value="">— select —</option>${opts}</select></label>`;
    }
    if (f.type === 'radio') {
      const opts = (f.options || []).map((o) => `<label class="gf-radio"><input type="radio" name="${escape(f.name)}" value="${escape(o)}"${reqAttr}/> ${escape(o)}</label>`).join('');
      return `<label>${escape(f.label)} ${req}${help}</label>${opts}`;
    }
    if (f.type === 'checkbox') {
      const opts = (f.options || []).map((o) => `<label class="gf-check"><input type="checkbox" name="${escape(f.name)}" value="${escape(o)}"/> ${escape(o)}</label>`).join('');
      return `<label>${escape(f.label)} ${req}${help}</label>${opts}`;
    }
    const inputType = { email: 'email', phone: 'tel', date: 'date' }[f.type] || 'text';
    return `<label>${escape(f.label)} ${req}${help}<input type="${inputType}" name="${escape(f.name)}"${ph}${def}${reqAttr}/></label>`;
  }

  function collect(form) {
    const out = {};
    new FormData(form).forEach((v, k) => {
      if (k in out) out[k] = [].concat(out[k], v);
      else out[k] = v;
    });
    return out;
  }

  async function mount(host) {
    const slug = host.getAttribute('data-gasf-form');
    if (!slug) return;
    const styleAttr = host.getAttribute('data-gasf-style');
    const isBare = styleAttr === 'bare';

    let cfg;
    try {
      const r = await fetch('/api/forms/' + encodeURIComponent(slug), { credentials: 'omit' });
      if (!r.ok) throw new Error(r.status === 404 ? 'Form not found' : 'Failed to load');
      cfg = await r.json();
    } catch (e) {
      host.innerHTML = `<div class="gasf-form err" style="color:#991b1b;">${e.message}</div>`;
      return;
    }
    if (!cfg.ok || !cfg.form) { host.innerHTML = ''; return; }

    const fieldsHtml = cfg.fields.map(renderField).join('');
    host.innerHTML = `
      <form class="gasf-form${isBare ? ' bare' : ''}" novalidate>
        ${cfg.form.name ? `<h3>${escape(cfg.form.name)}</h3>` : ''}
        ${cfg.form.description ? `<p class="gf-desc">${escape(cfg.form.description)}</p>` : ''}
        ${fieldsHtml}
        <button type="submit" class="gf-submit">${escape(cfg.form.button_text || 'Submit')}</button>
        <div class="gf-msg" style="display:none;"></div>
      </form>`;

    const form = host.querySelector('form');
    const msg  = host.querySelector('.gf-msg');
    const btn  = host.querySelector('.gf-submit');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.style.display = 'none';
      btn.disabled = true;
      const orig = btn.textContent;
      btn.textContent = 'Sending…';
      try {
        const res = await fetch('/api/forms/' + encodeURIComponent(slug) + '/submit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(collect(form)),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || res.statusText);
        if (cfg.form.redirect_url) { window.location = cfg.form.redirect_url; return; }
        msg.className = 'gf-msg ok';
        msg.textContent = cfg.form.success_message || 'Thanks — we will be in touch.';
        msg.style.display = 'block';
        form.reset();
      } catch (err) {
        msg.className = 'gf-msg err';
        msg.textContent = err.message;
        msg.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.textContent = orig;
      }
    });
  }

  function start() {
    injectStyles();
    document.querySelectorAll('[data-gasf-form]').forEach(mount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
