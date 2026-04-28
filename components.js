// ── Form endpoint config ───────────────────────────────────────────────────────
// On localhost:4000 → use local Express API (stores to SQLite)
// On Cloudflare Pages → use Web3Forms (free, sends email to brainvarehosting@gmail.com)
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const W3F_KEY  = 'c4b02d7a-520a-4322-b106-25b1925817c8';

async function postForm(endpoint, data) {
  if (IS_LOCAL) {
    // Local dev — hit the Express API
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Server error');
    return res.json();
  } else {
    // Production (Cloudflare Pages) — use Web3Forms
    const formType = endpoint.replace('/api/', '');
    const payload  = {
      access_key:   W3F_KEY,
      subject:      `[GASF] New ${formType.charAt(0).toUpperCase() + formType.slice(1)} Submission`,
      from_name:    'GreenApple Success Factors Website',
      ...data,
    };
    const res = await fetch('https://api.web3forms.com/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Web3Forms error');
    return json;
  }
}

// ── Consulting FAB ─────────────────────────────────────────────────────────────
function buildConsultingModal() {
  document.body.insertAdjacentHTML('beforeend', `
    <a href="registration.html" class="consult-fab" aria-label="Connect for Consulting">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>Connect for Consulting</span>
    </a>
  `);
}

// ── Header ─────────────────────────────────────────────────────────────────────
function buildHeader() {
  const current = location.pathname.split('/').pop() || 'index.html';
  const links = [
    { href: 'index.html', label: 'Home' },
    { href: 'services.html', label: 'Services' },
    { href: 'profile.html', label: 'Profile' },
    { href: 'training-programs.html', label: 'Upcoming Event' },
    { href: 'gallery.html', label: 'Gallery' },
    { href: 'reach-us.html', label: 'Reach Us', cta: true },
  ];
  const navHTML = links.map(l =>
    `<a href="${l.href}" class="${l.cta?'btn-nav-cta':''}${current===l.href||(current===''&&l.href==='index.html')?' active':''}">${l.label}</a>`
  ).join('');
  document.getElementById('header-mount').innerHTML = `
    <div class="top-bar">
      <a href="mailto:mail@gasuccessfactors.com">&#9993; mail@gasuccessfactors.com</a>
      <a href="tel:+918330833330">&#128222; +91 8330 833330</a>
    </div>
    <header class="site-header" id="siteHeader">
      <div class="header-inner">
        <a href="index.html" class="logo">
          <img src="assets/logo.png" alt="GreenApple Success Factors" class="logo-img"/>
        </a>
        <nav class="nav-links" id="navLinks">${navHTML}</nav>
        <button class="hamburger" id="hamburgerBtn" aria-label="Open menu"><span></span><span></span><span></span></button>
      </div>
    </header>
    <div class="mobile-nav-overlay" id="mobileOverlay"></div>
    <nav class="mobile-nav" id="mobileNav">${navHTML}</nav>`;
  const btn = document.getElementById('hamburgerBtn');
  const mn = document.getElementById('mobileNav');
  const ov = document.getElementById('mobileOverlay');
  const close = () => { btn.classList.remove('open'); mn.classList.remove('open'); ov.classList.remove('show'); };
  btn.addEventListener('click', () => { const o=mn.classList.toggle('open'); btn.classList.toggle('open',o); ov.classList.toggle('show',o); });
  ov.addEventListener('click', close);
  mn.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  window.addEventListener('scroll', () => document.getElementById('siteHeader')?.classList.toggle('scrolled', window.scrollY > 40));
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function buildFooter() {
  const m = document.getElementById('footer-mount');
  if (!m) return;
  m.innerHTML = `
    <footer class="site-footer">
      <div class="footer-grid">
        <div>
          <a href="index.html" class="logo" style="margin-bottom:1rem;">
            <img src="assets/logo.png" alt="GreenApple Success Factors" class="logo-img logo-img--footer"/>
          </a>
          <p style="color:var(--teal-300);font-weight:600;font-size:.9rem;margin-bottom:.6rem;">Clarity. Intelligence. Growth.</p>
          <p>Enabling sustainable business growth and long-term value creation through strategic insight, decision intelligence, and empowered leadership.</p>
          <div class="social-links" style="margin-top:1rem;">
            <a href="mailto:mail@gasuccessfactors.com" aria-label="Email">&#9993;</a>
            <a href="tel:+918330833330" aria-label="Call">&#128222;</a>
          </div>
        </div>
        <div>
          <h4>Our Services</h4>
          <nav class="footer-links">
            <a href="business-consulting.html">Business Consulting</a>
            <a href="startup-mentoring.html">Startup Mentoring</a>
            <a href="academic-empowerment.html">Academic Empowerment</a>
            <a href="training-programs.html">Training Programs</a>
            <a href="risk-compliance-funding.html">Risk &amp; Funding</a>
            <a href="branding-transformation.html">Branding &amp; Transformation</a>
          </nav>
        </div>
        <div>
          <h4>Quick Links</h4>
          <nav class="footer-links">
            <a href="index.html">Home</a>
            <a href="profile.html">Profile</a>
            <a href="services.html">Our Services</a>
            <a href="gallery.html">Gallery</a>
            <a href="reach-us.html">Reach Us</a>
            <a href="registration.html">Register</a>
            <a href="brochure.pdf" target="_blank" rel="noopener" style="color:var(--teal-300);font-weight:700;">&#8659; Download Brochure</a>
          </nav>
        </div>
      </div>
      <div class="footer-bottom">&copy; 2025 GreenApple Success Factors Pvt Ltd. All rights reserved. | Clarity. Intelligence. Growth.</div>
    </footer>`;
}

// ── Register CTA ───────────────────────────────────────────────────────────────
function buildRegisterCTA() {
  const m = document.getElementById('register-cta-mount');
  if (!m) return;
  m.innerHTML = `
    <section style="background:linear-gradient(135deg,var(--navy-900),var(--teal-900));padding:clamp(3rem,6vw,5rem) 1.5rem;text-align:center;">
      <h2 style="color:#fff;margin-bottom:.8rem;">Ready to Begin Your Growth Journey?</h2>
      <p style="color:rgba(255,255,255,.82);max-width:620px;margin:0 auto 2rem;font-size:.98rem;line-height:1.8;">Enabling leadership to think beyond the obvious, act with clarity, and create lasting impact.</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        <a href="registration.html" class="btn-primary">Connect for Consulting</a>
        <a href="registration.html" class="btn-outline">Register for a Programme</a>
      </div>
    </section>`;
}

// ── Scroll reveal ──────────────────────────────────────────────────────────────
function initScrollReveal() {
  const io = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);} }), { threshold: 0.08 });
  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
}

// ── Carousel ───────────────────────────────────────────────────────────────────
function initCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dots .dot');
  if (!slides.length) return;
  let cur = 0, timer;
  const go = idx => { slides[cur].classList.remove('active'); dots[cur]?.classList.remove('active'); cur=(idx+slides.length)%slides.length; slides[cur].classList.add('active'); dots[cur]?.classList.add('active'); };
  const start = () => { clearInterval(timer); timer = setInterval(()=>go(cur+1), 5500); };
  dots.forEach((d,i) => d.addEventListener('click', ()=>{go(i);start();}));
  start();
}

// ── Payment tabs ───────────────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-'+btn.dataset.tab)?.classList.add('active');
    });
  });
}

// ── Registration form ──────────────────────────────────────────────────────────
const AMOUNTS = {career:'Rs. 5,000',icwim:'Rs. 15,000',institution:'Rs. 10,000',financial:'Rs. 7,500',startup:'Rs. 8,000'};

function initRegistrationForm() {
  const sel = document.getElementById('reg-programme');
  const amt = document.getElementById('reg-amount');
  if (sel && amt) sel.addEventListener('change', () => { amt.value = AMOUNTS[sel.value] || ''; });

  const form = document.getElementById('registrationForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    btn.textContent = 'Submitting...'; btn.disabled = true;

    const getVal = id => document.getElementById(id)?.value || '';
    const getRadio = name => document.querySelector(`input[name="${name}"]:checked`)?.value || '';

    try {
      await postForm('/api/registration', {
        reg_type:       getRadio('reg-type'),
        programme:      getVal('reg-programme'),
        title:          getVal('reg-title'),
        first_name:     getVal('reg-firstname'),
        middle_name:    getVal('reg-middlename'),
        last_name:      getVal('reg-lastname'),
        dob:            getVal('reg-dob'),
        designation:    getVal('reg-designation'),
        company:        getVal('reg-company'),
        industry:       getVal('reg-industry'),
        specialization: getVal('reg-specialization'),
        addr_office:    getVal('reg-addr-office'),
        pin_office:     getVal('reg-pin-office'),
        addr_residence: getVal('reg-addr-residence'),
        pin_residence:  getVal('reg-pin-residence'),
        tel:            getVal('reg-tel'),
        mobile:         getVal('reg-mobile'),
        email_office:   getVal('reg-email-office'),
        email_permanent:getVal('reg-email-permanent'),
        iod_member:     getRadio('iod'),
        amount:         getVal('reg-amount'),
        date:           getVal('reg-date'),
      });
      showFormMsg(form, '✓ Registration submitted successfully! We will contact you shortly.', 'success');
      form.reset();
    } catch {
      showFormMsg(form, '✗ Submission failed. Please email mail@gasuccessfactors.com directly.', 'error');
    } finally {
      btn.textContent = 'SUBMIT FORM'; btn.disabled = false;
    }
  });
}

// ── Contact form ───────────────────────────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.removeAttribute('onsubmit');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit, button[type=submit]');
    btn.textContent = 'Sending...'; btn.disabled = true;
    try {
      await postForm('/api/contact', {
        name:    document.getElementById('contact-name')?.value || '',
        phone:   document.getElementById('contact-phone')?.value || '',
        email:   document.getElementById('contact-email')?.value || '',
        message: document.getElementById('contact-message')?.value || '',
      });
      showFormMsg(form, '✓ Message received! We will get back to you soon.', 'success');
      form.reset();
    } catch {
      showFormMsg(form, '✗ Failed to send. Please email mail@gasuccessfactors.com directly.', 'error');
    } finally {
      btn.textContent = 'SEND'; btn.disabled = false;
    }
  });
}

function showFormMsg(form, text, type) {
  let el = form.querySelector('.form-result-msg');
  if (!el) { el = document.createElement('div'); el.className = 'form-result-msg'; form.prepend(el); }
  el.textContent = text;
  el.style.cssText = `display:block;padding:.8rem 1rem;border-radius:8px;font-size:.9rem;margin-bottom:1rem;font-weight:500;background:${type==='success'?'#d4edda':'#f8d7da'};color:${type==='success'?'#155724':'#721c24'};`;
  setTimeout(() => { el.style.display = 'none'; }, 6000);
}

// ── Init ───────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildHeader();
  buildFooter();
  buildRegisterCTA();
  buildConsultingModal();
  initScrollReveal();
  initCarousel();
  initTabs();
  initRegistrationForm();
  initContactForm();
});
