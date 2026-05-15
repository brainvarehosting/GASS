-- GASF CMS — D1 schema (Cloudflare-only, single admin)
-- Apply with:
--   npx wrangler d1 execute gasf-cms --remote --file=db/schema.sql

CREATE TABLE IF NOT EXISTS registrations (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  reg_type        TEXT,
  programme       TEXT,
  title           TEXT,
  first_name      TEXT,
  middle_name     TEXT,
  last_name       TEXT,
  dob             TEXT,
  designation     TEXT,
  company         TEXT,
  industry        TEXT,
  specialization  TEXT,
  addr_office     TEXT,
  pin_office      TEXT,
  addr_residence  TEXT,
  pin_residence   TEXT,
  tel             TEXT,
  mobile          TEXT,
  email_office    TEXT,
  email_permanent TEXT,
  iod_member      TEXT,
  amount          TEXT,
  date            TEXT,
  source_page     TEXT,
  ip_address      TEXT,
  user_agent      TEXT,
  status          TEXT NOT NULL DEFAULT 'new'
);
CREATE INDEX IF NOT EXISTS idx_reg_created ON registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reg_status  ON registrations(status);

CREATE TABLE IF NOT EXISTS contacts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  name        TEXT,
  phone       TEXT,
  email       TEXT,
  message     TEXT,
  source_page TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  status      TEXT NOT NULL DEFAULT 'new'
);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_status  ON contacts(status);

CREATE TABLE IF NOT EXISTS enquiries (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  name         TEXT,
  organisation TEXT,
  email        TEXT,
  phone        TEXT,
  service      TEXT,
  message      TEXT,
  source_page  TEXT,
  ip_address   TEXT,
  user_agent   TEXT,
  status       TEXT NOT NULL DEFAULT 'new'
);
CREATE INDEX IF NOT EXISTS idx_enq_created ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enq_status  ON enquiries(status);

CREATE TABLE IF NOT EXISTS content (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT,
  page  TEXT,
  type  TEXT NOT NULL DEFAULT 'text',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_content_page ON content(page);

CREATE TABLE IF NOT EXISTS activity_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  action     TEXT NOT NULL,
  entity     TEXT,
  entity_id  TEXT,
  meta       TEXT
);
CREATE INDEX IF NOT EXISTS idx_log_created ON activity_log(created_at DESC);

-- Seed default content (matches existing server.js seed)
INSERT OR IGNORE INTO content (key,value,label,page,type) VALUES
('home.hero1.badge','Consulting • Mentoring • Empowerment','Slide 1 Badge','Home','text'),
('home.hero1.h1','Empowering Business Growth & Sustainability','Slide 1 Heading','Home','text'),
('home.hero1.p','We partner with boards, entrepreneurs and academic institutions to deliver visible, measurable outcomes through focused involvement and innovative strategy.','Slide 1 Paragraph','Home','textarea'),
('home.hero2.badge','Corporate Strategy • Leadership','Slide 2 Badge','Home','text'),
('home.hero2.h1','Innovative Strategy for Modern Enterprise','Slide 2 Heading','Home','text'),
('home.hero2.p','Transforming complex challenges into sustainable growth opportunities through our decades of industry experience and academic research.','Slide 2 Paragraph','Home','textarea'),
('home.hero3.badge','Success Factors • Mentoring','Slide 3 Badge','Home','text'),
('home.hero3.h1','Cultivating Professional Excellence','Slide 3 Heading','Home','text'),
('home.hero3.p','Empowering individuals and institutions with the right Success Factors to thrive in today''s competitive global landscape.','Slide 3 Paragraph','Home','textarea'),
('home.about.h2','Enabling Leadership to Think Beyond the Obvious','About Heading','Home','text'),
('home.about.p1','At GreenApple Success Factors Pvt Ltd, we believe that true success is not accidental—it is designed through clarity, shaped by insight, and sustained through disciplined execution.','About Paragraph 1','Home','textarea'),
('home.about.p2','GreenApple was founded with a clear purpose—to bridge the gap between strategy and execution, vision and result. We partner with boards, entrepreneurs, and institutions to shape future-ready organizations through strategic insight, decision intelligence, and empowered leadership.','About Paragraph 2','Home','textarea'),
('home.mission.text','To enable decision-ready intelligence, strategic clarity, and disciplined execution through integrated consulting, mentoring, and capability building.','Mission Text','Home','textarea'),
('home.vision.text','To shape future-ready leadership and organizations that define sustainable growth and lasting impact.','Vision Text','Home','textarea'),
('home.tagline','Clarity. Intelligence. Growth.','Tagline','Global','text'),
('home.approach.p1','At GreenApple Success Factors, we transform meaningful interventions into sustainable growth. Every organization and individual has unique challenges, and we design solutions that are tailored, purposeful, and impact-driven.','Approach Paragraph 1','Home','textarea'),
('home.cta.heading','Ready to Begin Your Growth Journey?','CTA Heading','Global','text'),
('home.cta.subtext','Enabling leadership to think beyond the obvious, act with clarity, and create lasting impact.','CTA Subtext','Global','textarea'),
('global.phone','+91 8330 833330','Phone Number','Global','text'),
('global.email','mail@gasuccessfactors.com','Email Address','Global','text'),
('global.address','PB 4273, Panampilly Nagar, Pincode 682036, Kochi, Kerala','Office Address','Global','textarea'),
('profile.hero.h1','Our Profile','Profile Hero Heading','Profile','text'),
('profile.hero.p','Enabling leadership to think beyond the obvious, act with clarity, and create lasting impact.','Profile Hero Subtext','Profile','text'),
('profile.brand.p1','At GreenApple Success Factors Pvt Ltd, we believe that true success is not accidental—it is designed through clarity, shaped by insight, and sustained through disciplined execution. In an increasingly complex and uncertain business environment, organizations and leaders require more than advice; they need a trusted partner who can translate ambition into structured, measurable outcomes.','Brand Story Para 1','Profile','textarea'),
('services.hero.h1','Our Services','Services Hero Heading','Services','text'),
('services.hero.p','Comprehensive solutions designed to create meaningful impact and long-term results.','Services Hero Subtext','Services','text'),
('biz.hero.badge','Strategic Growth','Business Consulting Badge','Business Consulting','text'),
('biz.hero.h1','Business Consulting & Growth','Business Consulting Heading','Business Consulting','text'),
('biz.hero.subtitle','Scaling Businesses with Strategy & Operational Excellence','Business Consulting Subtitle','Business Consulting','text'),
('biz.lead','At the core of every successful organization lies a clear strategy supported by flawless execution. We partner with businesses to unlock their full potential by integrating deep strategic insight with operational excellence.','Business Consulting Lead Text','Business Consulting','textarea'),
('biz.cta.heading','Ready to build a growth engine?','Business CTA Heading','Business Consulting','text'),
('biz.cta.p','Let us build a growth engine for your business—structured, scalable, and future-ready.','Business CTA Text','Business Consulting','textarea'),
('startup.hero.badge','Entrepreneurial Growth','Startup Badge','Startup Mentoring','text'),
('startup.hero.h1','Startup & Entrepreneurial Mentoring','Startup Heading','Startup Mentoring','text'),
('startup.hero.subtitle','Guiding Vision. Enabling Execution. Accelerating Growth.','Startup Subtitle','Startup Mentoring','text'),
('startup.lead','At GreenApple Success Factors Pvt Ltd, Startup & Entrepreneurial Mentoring is designed to support founders in transforming ideas into sustainable, scalable businesses.','Startup Lead Text','Startup Mentoring','textarea'),
('startup.cta.heading','Ready to turn your idea into impact?','Startup CTA Heading','Startup Mentoring','text'),
('training.hero.h1','Corporate Training & Professional Development','Training Heading','Training','text'),
('training.hero.subtitle','Building Capability. Driving Performance. Enabling Leadership.','Training Subtitle','Training','text'),
('training.cta.heading','Empower your people to excel.','Training CTA Heading','Training','text'),
('risk.hero.h1','Risk, Compliance, ESG & Funding Advisory','Risk Heading','Risk','text'),
('risk.hero.subtitle','Ensuring Resilience. Enabling Responsibility. Driving Sustainable Growth.','Risk Subtitle','Risk','text'),
('risk.cta.heading','Secure your strategic financial direction.','Risk CTA Heading','Risk','text'),
('branding.hero.h1','Branding, Collaborations & Transformation','Branding Heading','Branding','text'),
('branding.hero.subtitle','Positioning with Purpose. Partnering for Growth. Transforming for Impact.','Branding Subtitle','Branding','text'),
('branding.cta.heading','Transform your brand and reach.','Branding CTA Heading','Branding','text');
