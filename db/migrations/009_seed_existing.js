// View-only seed: makes the existing homepage banners and the existing
// contact + mentoring forms VISIBLE in the admin panel so they can be
// inspected (and edited going forward, once the static HTML pages are
// rewired to consume these — that is a separate, opt-in step).
//
// Generates db/migrations/009_seed_existing.sql alongside this file.
// Apply with:
//   node db/migrations/009_seed_existing.js
//   npx wrangler d1 execute gasf-cms --remote --file=db/migrations/009_seed_existing.sql

const fs = require('fs');
const path = require('path');

const banners = [
  {
    sort_order: 10,
    eyebrow: 'Consulting • Mentoring • Empowerment',
    heading: 'Empowering',
    heading_accent: 'Business Growth & Sustainability',
    description: 'We partner with boards, entrepreneurs and academic institutions to deliver visible, measurable outcomes through focused involvement and innovative strategy.',
    btn1_text: 'Explore Services', btn1_link: '/services.html',
    btn2_text: 'Get in Touch',     btn2_link: '/reach-us.html',
    bg_type: 'image_overlay',
    bg_image_url: '/assets/gallery-corporate-1.jpg',
    overlay_opacity: 0.55,
    text_align: 'left',
    text_color: '#ffffff',
    is_active: 0,  // VIEW-ONLY: seeded inactive so live homepage stays unchanged
  },
  {
    sort_order: 20,
    eyebrow: 'Corporate Strategy • Leadership',
    heading: 'Innovative',
    heading_accent: 'Strategy for Modern Enterprise',
    description: 'Transforming complex challenges into sustainable growth opportunities through our decades of industry experience and academic research.',
    btn1_text: 'CXO Conclave', btn1_link: '/cxo-conclave.html',
    btn2_text: 'Mentoring',    btn2_link: '/mentoring-form.html',
    bg_type: 'image_overlay',
    bg_image_url: '/assets/hero-innovation.png',
    overlay_opacity: 0.55,
    text_align: 'left',
    text_color: '#ffffff',
    is_active: 0,  // VIEW-ONLY: seeded inactive so live homepage stays unchanged
  },
  {
    sort_order: 30,
    eyebrow: 'Success Factors • Mentoring',
    heading: 'Cultivating',
    heading_accent: 'Professional Excellence',
    description: "Empowering individuals and institutions with the right Success Factors to thrive in today's competitive global landscape.",
    btn1_text: 'About Our Team',    btn1_link: '/profile.html',
    btn2_text: 'Connect With Us',   btn2_link: '/mentoring-form.html',
    bg_type: 'image_overlay',
    bg_image_url: '/assets/gallery-skyscrapers.avif',
    overlay_opacity: 0.55,
    text_align: 'left',
    text_color: '#ffffff',
    is_active: 0,  // VIEW-ONLY: seeded inactive so live homepage stays unchanged
  },
];

const forms = [
  {
    slug: 'contact',
    name: 'Contact Us (mirror of /reach-us.html)',
    description: 'Mirror of the form on the live /reach-us.html page. Editing here does NOT yet change the live form — the static HTML page would need to be rewired to use this form definition.',
    success_message: "Thanks — we'll get back to you shortly.",
    button_text: 'Send Message',
    fields: [
      { label: 'Your full name',     name: 'name',    type: 'text',     required: 1, placeholder: 'Your full name' },
      { label: 'Phone number',       name: 'phone',   type: 'phone',    required: 0, placeholder: 'Your phone number' },
      { label: 'Email address',      name: 'email',   type: 'email',    required: 1, placeholder: 'Your email address' },
      { label: 'Message',            name: 'message', type: 'textarea', required: 1, placeholder: 'Your message…' },
    ],
  },
  {
    slug: 'mentoring',
    name: 'Mentoring Enquiry (mirror of /mentoring-form.html)',
    description: 'Mirror of the form on /mentoring-form.html. Edit here for reference; live form is still the static HTML version.',
    success_message: 'Thanks — we will reach out shortly.',
    button_text: 'Submit Enquiry',
    fields: [
      { label: 'First name',     name: 'first_name',   type: 'text',     required: 1, placeholder: 'First name' },
      { label: 'Last name',      name: 'last_name',    type: 'text',     required: 1, placeholder: 'Last name' },
      { label: 'Email address',  name: 'email',        type: 'email',    required: 1, placeholder: 'you@mail.com' },
      { label: 'Mobile number',  name: 'mobile',       type: 'phone',    required: 1, placeholder: 'Phone number' },
      { label: 'Designation',    name: 'designation',  type: 'text',     required: 0, placeholder: 'Designation' },
      { label: 'Organisation',   name: 'organisation', type: 'text',     required: 0, placeholder: 'Organisation' },
      { label: 'Organisation type', name: 'org_type',  type: 'select',   required: 1, options: ['MSME', 'Startup', 'Others'] },
      { label: 'Message',        name: 'message',      type: 'textarea', required: 1, placeholder: 'Your message' },
    ],
  },
  {
    slug: 'cxo-registration',
    name: 'CXO Conclave Registration (mirror of /cxo-registration.html)',
    description: 'Mirror of the CXO registration form. View-only reference — live form is the static HTML page with reactive amount calculation.',
    success_message: 'Thanks — your CXO Conclave registration has been received.',
    button_text: 'Submit Registration',
    fields: [
      { label: 'Registration type',     name: 'reg_type',     type: 'radio',    required: 1, options: ['Individual', 'Business'] },
      { label: 'Nomination Type & Package', name: 'programme', type: 'select', required: 1, options: ['Individual Nomination - ₹68,000', 'Corporate (3 Participants) - ₹1,95,000', 'Corporate (5 Participants) - ₹3,10,000', 'Corporate (10 Participants) - ₹5,80,000'] },
      { label: 'Title',                 name: 'title',        type: 'select',   required: 0, options: ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.'] },
      { label: 'First name',            name: 'first_name',   type: 'text',     required: 1 },
      { label: 'Middle name',           name: 'middle_name',  type: 'text',     required: 0 },
      { label: 'Last name',             name: 'last_name',    type: 'text',     required: 1 },
      { label: 'Date of birth',         name: 'dob',          type: 'date',     required: 0 },
      { label: 'Designation',           name: 'designation',  type: 'text',     required: 1 },
      { label: 'Company',               name: 'company',      type: 'text',     required: 1 },
      { label: 'Industry',              name: 'industry',     type: 'text',     required: 0 },
      { label: 'Specialization',        name: 'specialization', type: 'text',   required: 0 },
      { label: 'Office address',        name: 'addr_office',  type: 'textarea', required: 0 },
      { label: 'Office PIN',            name: 'pin_office',   type: 'text',     required: 0 },
      { label: 'Residence address',     name: 'addr_residence', type: 'textarea', required: 0 },
      { label: 'Residence PIN',         name: 'pin_residence', type: 'text',    required: 0 },
      { label: 'Telephone',             name: 'tel',          type: 'phone',    required: 0 },
      { label: 'Mobile',                name: 'mobile',       type: 'phone',    required: 1 },
      { label: 'Office email',          name: 'email_office', type: 'email',    required: 1 },
      { label: 'Personal email',        name: 'email_permanent', type: 'email', required: 0 },
      { label: 'IOD member?',           name: 'iod_member',   type: 'radio',    required: 0, options: ['Yes', 'No'] },
      { label: 'Amount payable (excl. GST)', name: 'amount',  type: 'text',     required: 0, placeholder: 'Auto-filled from package selection' },
      { label: 'Date',                  name: 'date',         type: 'date',     required: 0 },
    ],
  },
];

function sqlEsc(s) { return String(s ?? '').replace(/'/g, "''"); }

const lines = [
  '-- Migration 009: VIEW-ONLY seed of existing homepage banners + 3 existing forms',
  '-- Auto-generated by db/migrations/009_seed_existing.js',
  '-- Live frontend is NOT modified by this seed.',
  '',
  '-- Banners (3 homepage hero slides)',
  '-- Wipe existing seed copies so re-running stays idempotent for the seeded sort_order range',
  "DELETE FROM hero_banners WHERE eyebrow IN ('Consulting • Mentoring • Empowerment','Corporate Strategy • Leadership','Success Factors • Mentoring');",
  '',
];

for (const b of banners) {
  const cols = Object.keys(b);
  const vals = cols.map((k) => {
    const v = b[k];
    return typeof v === 'number' ? v : `'${sqlEsc(v)}'`;
  });
  lines.push(`INSERT INTO hero_banners (${cols.join(',')}) VALUES (${vals.join(',')});`);
}

lines.push('', '-- Forms (mirrors of existing static-HTML forms)');

for (const f of forms) {
  lines.push(
    `INSERT INTO forms (slug, name, description, success_message, button_text, is_active) VALUES`,
    `  ('${sqlEsc(f.slug)}', '${sqlEsc(f.name)}', '${sqlEsc(f.description)}', '${sqlEsc(f.success_message)}', '${sqlEsc(f.button_text)}', 0)`,
    `  ON CONFLICT(slug) DO UPDATE SET`,
    `    name=excluded.name, description=excluded.description, success_message=excluded.success_message,`,
    `    button_text=excluded.button_text, updated_at=datetime('now');`,
    '',
    `-- Reset fields for ${f.slug}`,
    `DELETE FROM form_fields WHERE form_id = (SELECT id FROM forms WHERE slug = '${sqlEsc(f.slug)}');`,
  );
  f.fields.forEach((field, idx) => {
    const optsJson = field.options ? `'${sqlEsc(JSON.stringify(field.options))}'` : 'NULL';
    lines.push(
      `INSERT INTO form_fields (form_id, label, name, type, placeholder, options_json, is_required, sort_order) VALUES`,
      `  ((SELECT id FROM forms WHERE slug = '${sqlEsc(f.slug)}'),`,
      `   '${sqlEsc(field.label)}', '${sqlEsc(field.name)}', '${sqlEsc(field.type)}',`,
      `   '${sqlEsc(field.placeholder || '')}', ${optsJson}, ${field.required ? 1 : 0}, ${(idx + 1) * 10});`,
    );
  });
  lines.push('');
}

const outPath = path.join(__dirname, '009_seed_existing.sql');
fs.writeFileSync(outPath, lines.join('\n'));
console.log(`Wrote ${outPath} (${lines.length} lines)`);
