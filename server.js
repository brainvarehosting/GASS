'use strict';
require('dotenv').config();

const express  = require('express');
const path     = require('path');
const cors     = require('cors');
const Database = require('better-sqlite3');
const nodemailer = require('nodemailer');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Database setup ───────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'submissions.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at  DATETIME DEFAULT (datetime('now','localtime')),
    reg_type    TEXT,
    programme   TEXT,
    title       TEXT,
    first_name  TEXT,
    middle_name TEXT,
    last_name   TEXT,
    dob         TEXT,
    designation TEXT,
    company     TEXT,
    industry    TEXT,
    specialization TEXT,
    addr_office TEXT,
    pin_office  TEXT,
    addr_residence TEXT,
    pin_residence  TEXT,
    tel         TEXT,
    mobile      TEXT,
    email_office TEXT,
    email_permanent TEXT,
    iod_member  TEXT,
    amount      TEXT,
    date        TEXT,
    status      TEXT DEFAULT 'new'
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT (datetime('now','localtime')),
    name       TEXT,
    phone      TEXT,
    email      TEXT,
    message    TEXT,
    status     TEXT DEFAULT 'new'
  );

  CREATE TABLE IF NOT EXISTS enquiries (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at   DATETIME DEFAULT (datetime('now','localtime')),
    name         TEXT,
    organisation TEXT,
    email        TEXT,
    phone        TEXT,
    service      TEXT,
    message      TEXT,
    status       TEXT DEFAULT 'new'
  );

  CREATE TABLE IF NOT EXISTS content (
    key       TEXT PRIMARY KEY,
    value     TEXT NOT NULL,
    label     TEXT,
    page      TEXT,
    type      TEXT DEFAULT 'text'
  );
`);

// ─── Seed default content ─────────────────────────────────────────────────────
const seedContent = db.prepare(`INSERT OR IGNORE INTO content (key,value,label,page,type) VALUES (?,?,?,?,?)`);
const defaultContent = [
  // Homepage
  ['home.hero1.badge','Consulting • Mentoring • Empowerment','Slide 1 Badge','Home','text'],
  ['home.hero1.h1','Empowering Business Growth & Sustainability','Slide 1 Heading','Home','text'],
  ['home.hero1.p','We partner with boards, entrepreneurs and academic institutions to deliver visible, measurable outcomes through focused involvement and innovative strategy.','Slide 1 Paragraph','Home','textarea'],
  ['home.hero2.badge','Corporate Strategy • Leadership','Slide 2 Badge','Home','text'],
  ['home.hero2.h1','Innovative Strategy for Modern Enterprise','Slide 2 Heading','Home','text'],
  ['home.hero2.p','Transforming complex challenges into sustainable growth opportunities through our decades of industry experience and academic research.','Slide 2 Paragraph','Home','textarea'],
  ['home.hero3.badge','Success Factors • Mentoring','Slide 3 Badge','Home','text'],
  ['home.hero3.h1','Cultivating Professional Excellence','Slide 3 Heading','Home','text'],
  ['home.hero3.p',"Empowering individuals and institutions with the right Success Factors to thrive in today's competitive global landscape.",'Slide 3 Paragraph','Home','textarea'],
  ['home.about.h2','Enabling Leadership to Think Beyond the Obvious','About Heading','Home','text'],
  ['home.about.p1','At GreenApple Success Factors Pvt Ltd, we believe that true success is not accidental—it is designed through clarity, shaped by insight, and sustained through disciplined execution.','About Paragraph 1','Home','textarea'],
  ['home.about.p2','GreenApple was founded with a clear purpose—to bridge the gap between strategy and execution, vision and result. We partner with boards, entrepreneurs, and institutions to shape future-ready organizations through strategic insight, decision intelligence, and empowered leadership.','About Paragraph 2','Home','textarea'],
  ['home.mission.text','To enable decision-ready intelligence, strategic clarity, and disciplined execution through integrated consulting, mentoring, and capability building.','Mission Text','Home','textarea'],
  ['home.vision.text','To shape future-ready leadership and organizations that define sustainable growth and lasting impact.','Vision Text','Home','textarea'],
  ['home.tagline','Clarity. Intelligence. Growth.','Tagline','Global','text'],
  ['home.approach.p1','At GreenApple Success Factors, we transform meaningful interventions into sustainable growth. Every organization and individual has unique challenges, and we design solutions that are tailored, purposeful, and impact-driven.','Approach Paragraph 1','Home','textarea'],
  ['home.cta.heading','Ready to Begin Your Growth Journey?','CTA Heading','Global','text'],
  ['home.cta.subtext','Enabling leadership to think beyond the obvious, act with clarity, and create lasting impact.','CTA Subtext','Global','textarea'],
  // Contact info (global)
  ['global.phone','+91 8330 833330','Phone Number','Global','text'],
  ['global.email','mail@gasuccessfactors.com','Email Address','Global','text'],
  ['global.address','PB 4273, Panampilly Nagar, Pincode 682036, Kochi, Kerala','Office Address','Global','textarea'],
  // Profile
  ['profile.hero.h1','Our Profile','Profile Hero Heading','Profile','text'],
  ['profile.hero.p','Enabling leadership to think beyond the obvious, act with clarity, and create lasting impact.','Profile Hero Subtext','Profile','text'],
  ['profile.brand.p1','At GreenApple Success Factors Pvt Ltd, we believe that true success is not accidental—it is designed through clarity, shaped by insight, and sustained through disciplined execution. In an increasingly complex and uncertain business environment, organizations and leaders require more than advice; they need a trusted partner who can translate ambition into structured, measurable outcomes.','Brand Story Para 1','Profile','textarea'],
  // Services
  ['services.hero.h1','Our Services','Services Hero Heading','Services','text'],
  ['services.hero.p','Comprehensive solutions designed to create meaningful impact and long-term results.','Services Hero Subtext','Services','text'],
  // Business Consulting
  ['biz.hero.badge','Strategic Growth','Business Consulting Badge','Business Consulting','text'],
  ['biz.hero.h1','Business Consulting & Growth','Business Consulting Heading','Business Consulting','text'],
  ['biz.hero.subtitle','Scaling Businesses with Strategy & Operational Excellence','Business Consulting Subtitle','Business Consulting','text'],
  ['biz.lead','At the core of every successful organization lies a clear strategy supported by flawless execution. We partner with businesses to unlock their full potential by integrating deep strategic insight with operational excellence.','Business Consulting Lead Text','Business Consulting','textarea'],
  ['biz.cta.heading','Ready to build a growth engine?','Business CTA Heading','Business Consulting','text'],
  ['biz.cta.p','Let us build a growth engine for your business—structured, scalable, and future-ready.','Business CTA Text','Business Consulting','textarea'],
  // Startup Mentoring
  ['startup.hero.badge','Entrepreneurial Growth','Startup Badge','Startup Mentoring','text'],
  ['startup.hero.h1','Startup & Entrepreneurial Mentoring','Startup Heading','Startup Mentoring','text'],
  ['startup.hero.subtitle','Guiding Vision. Enabling Execution. Accelerating Growth.','Startup Subtitle','Startup Mentoring','text'],
  ['startup.lead','At GreenApple Success Factors Pvt Ltd, Startup & Entrepreneurial Mentoring is designed to support founders in transforming ideas into sustainable, scalable businesses.','Startup Lead Text','Startup Mentoring','textarea'],
  ['startup.cta.heading','Ready to turn your idea into impact?','Startup CTA Heading','Startup Mentoring','text'],
  // Training
  ['training.hero.h1','Corporate Training & Professional Development','Training Heading','Training','text'],
  ['training.hero.subtitle','Building Capability. Driving Performance. Enabling Leadership.','Training Subtitle','Training','text'],
  ['training.cta.heading','Empower your people to excel.','Training CTA Heading','Training','text'],
  // Risk
  ['risk.hero.h1','Risk, Compliance, ESG & Funding Advisory','Risk Heading','Risk','text'],
  ['risk.hero.subtitle','Ensuring Resilience. Enabling Responsibility. Driving Sustainable Growth.','Risk Subtitle','Risk','text'],
  ['risk.cta.heading','Secure your strategic financial direction.','Risk CTA Heading','Risk','text'],
  // Branding
  ['branding.hero.h1','Branding, Collaborations & Transformation','Branding Heading','Branding','text'],
  ['branding.hero.subtitle','Positioning with Purpose. Partnering for Growth. Transforming for Impact.','Branding Subtitle','Branding','text'],
  ['branding.cta.heading','Transform your brand and reach.','Branding CTA Heading','Branding','text'],
];
defaultContent.forEach(row => seedContent.run(...row));
console.log(`Content items ready: ${db.prepare('SELECT COUNT(*) as c FROM content').get().c}`);

// ─── Prepared statements ───────────────────────────────────────────────────────
const insertReg = db.prepare(`
  INSERT INTO registrations
    (reg_type, programme, title, first_name, middle_name, last_name,
     dob, designation, company, industry, specialization,
     addr_office, pin_office, addr_residence, pin_residence,
     tel, mobile, email_office, email_permanent, iod_member, amount, date)
  VALUES
    (@reg_type, @programme, @title, @first_name, @middle_name, @last_name,
     @dob, @designation, @company, @industry, @specialization,
     @addr_office, @pin_office, @addr_residence, @pin_residence,
     @tel, @mobile, @email_office, @email_permanent, @iod_member, @amount, @date)
`);

const insertContact = db.prepare(`
  INSERT INTO contacts (name, phone, email, message)
  VALUES (@name, @phone, @email, @message)
`);

const insertEnquiry = db.prepare(`
  INSERT INTO enquiries (name, organisation, email, phone, service, message)
  VALUES (@name, @organisation, @email, @phone, @service, @message)
`);

// ─── Email transporter ────────────────────────────────────────────────────────
let transporter = null;
if (process.env.SMTP_USER && process.env.SMTP_USER !== 'your-gmail@gmail.com') {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendNotification(subject, html) {
  if (!transporter) return; // email not configured — skip silently
  try {
    await transporter.sendMail({
      from: `"GASF Website" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      subject,
      html,
    });
  } catch (e) {
    console.error('Email error:', e.message);
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, assets)
app.use(express.static(__dirname, {
  index: 'index.html',
  dotfiles: 'ignore',
}));

// ─── API: Registration ─────────────────────────────────────────────────────────
app.post('/api/registration', (req, res) => {
  try {
    const data = {
      reg_type:      req.body.reg_type      || '',
      programme:     req.body.programme     || '',
      title:         req.body.title         || '',
      first_name:    req.body.first_name    || '',
      middle_name:   req.body.middle_name   || '',
      last_name:     req.body.last_name     || '',
      dob:           req.body.dob           || '',
      designation:   req.body.designation   || '',
      company:       req.body.company       || '',
      industry:      req.body.industry      || '',
      specialization:req.body.specialization|| '',
      addr_office:   req.body.addr_office   || '',
      pin_office:    req.body.pin_office    || '',
      addr_residence:req.body.addr_residence|| '',
      pin_residence: req.body.pin_residence || '',
      tel:           req.body.tel           || '',
      mobile:        req.body.mobile        || '',
      email_office:  req.body.email_office  || '',
      email_permanent: req.body.email_permanent || '',
      iod_member:    req.body.iod_member    || 'no',
      amount:        req.body.amount        || '',
      date:          req.body.date          || '',
    };

    const result = insertReg.run(data);

    sendNotification(
      `[GASF] New Registration — ${data.first_name} ${data.last_name}`,
      `<h2>New Registration Received</h2>
       <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
         ${Object.entries(data).map(([k,v]) => `
           <tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:600;background:#f5f5f5;text-transform:capitalize;">${k.replace(/_/g,' ')}</td>
               <td style="padding:6px 12px;border:1px solid #ddd;">${v||'—'}</td></tr>
         `).join('')}
       </table>
       <p style="margin-top:16px;color:#666;">View all submissions at <a href="http://localhost:${PORT}/admin">Admin Panel</a></p>`
    );

    res.json({ ok: true, id: result.lastInsertRowid });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ─── API: Contact ──────────────────────────────────────────────────────────────
app.post('/api/contact', (req, res) => {
  try {
    const data = {
      name:    req.body.name    || '',
      phone:   req.body.phone   || '',
      email:   req.body.email   || '',
      message: req.body.message || '',
    };

    const result = insertContact.run(data);

    sendNotification(
      `[GASF] New Contact Message — ${data.name}`,
      `<h2>New Contact Message</h2>
       <p><strong>Name:</strong> ${data.name}</p>
       <p><strong>Phone:</strong> ${data.phone}</p>
       <p><strong>Email:</strong> ${data.email}</p>
       <p><strong>Message:</strong><br>${data.message.replace(/\n/g,'<br>')}</p>`
    );

    res.json({ ok: true, id: result.lastInsertRowid });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ─── API: Consulting Enquiry ───────────────────────────────────────────────────
app.post('/api/enquiry', (req, res) => {
  try {
    const data = {
      name:         req.body.name         || '',
      organisation: req.body.organisation || '',
      email:        req.body.email        || '',
      phone:        req.body.phone        || '',
      service:      req.body.service      || '',
      message:      req.body.message      || '',
    };

    const result = insertEnquiry.run(data);

    sendNotification(
      `[GASF] New Consulting Enquiry — ${data.name}`,
      `<h2>New Consulting Enquiry</h2>
       <p><strong>Name:</strong> ${data.name}</p>
       <p><strong>Organisation:</strong> ${data.organisation}</p>
       <p><strong>Email:</strong> ${data.email}</p>
       <p><strong>Phone:</strong> ${data.phone}</p>
       <p><strong>Service:</strong> ${data.service}</p>
       <p><strong>Message:</strong><br>${data.message.replace(/\n/g,'<br>')}</p>`
    );

    res.json({ ok: true, id: result.lastInsertRowid });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ─── API: Mark status ─────────────────────────────────────────────────────────
app.patch('/api/:table/:id/status', requireAdmin, (req, res) => {
  const table = ['registrations','contacts','enquiries'].includes(req.params.table)
    ? req.params.table : null;
  if (!table) return res.status(400).json({ ok: false });
  db.prepare(`UPDATE ${table} SET status=? WHERE id=?`)
    .run(req.body.status, req.params.id);
  res.json({ ok: true });
});

// ─── Admin auth middleware ─────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const pwd = req.headers['x-admin-password'] || req.query.password;
  if (pwd !== (process.env.ADMIN_PASSWORD || 'gasf2025')) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  next();
}

// ─── API: Delete submission ────────────────────────────────────────────────────
app.delete('/api/:table/:id', requireAdmin, (req, res) => {
  const table = ['registrations','contacts','enquiries'].includes(req.params.table)
    ? req.params.table : null;
  if (!table) return res.status(400).json({ ok: false });
  db.prepare(`DELETE FROM ${table} WHERE id=?`).run(req.params.id);
  res.json({ ok: true });
});

// ─── API: Content CMS (public read) ───────────────────────────────────────────
app.get('/api/content', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM content').all();
  const map = {};
  rows.forEach(r => { map[r.key] = r.value; });
  res.json(map);
});

// ─── API: Content CMS (admin write) ───────────────────────────────────────────
app.put('/api/content/:key', requireAdmin, (req, res) => {
  const { value } = req.body;
  if (value === undefined) return res.status(400).json({ ok: false });
  db.prepare('UPDATE content SET value=? WHERE key=?').run(value, req.params.key);
  res.json({ ok: true });
});

// ─── Admin API: get all submissions + content ──────────────────────────────────
app.get('/api/admin/all', requireAdmin, (req, res) => {
  res.json({
    registrations: db.prepare('SELECT * FROM registrations ORDER BY id DESC').all(),
    contacts:      db.prepare('SELECT * FROM contacts      ORDER BY id DESC').all(),
    enquiries:     db.prepare('SELECT * FROM enquiries     ORDER BY id DESC').all(),
    content:       db.prepare('SELECT * FROM content ORDER BY page,key').all(),
  });
});

// ─── Admin dashboard page ──────────────────────────────────────────────────────
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🍏 GreenApple Success Factors — Server running`);
  console.log(`   Site:  http://localhost:${PORT}`);
  console.log(`   Admin: http://localhost:${PORT}/admin`);
  console.log(`   Pass:  ${process.env.ADMIN_PASSWORD || 'gasf2025'}\n`);
});
