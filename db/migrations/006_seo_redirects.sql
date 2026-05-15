-- Migration 006: SEO + redirects + site settings

-- Per-entity SEO meta (any entity_type/entity_id pairing)
CREATE TABLE IF NOT EXISTS seo_meta (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type      TEXT NOT NULL,           -- e.g. 'page', 'blog', 'service', 'cms_page'
  entity_id        TEXT NOT NULL,
  meta_title       TEXT,
  meta_description TEXT,
  focus_keyword    TEXT,
  canonical_url    TEXT,
  og_title         TEXT,
  og_description   TEXT,
  og_image_url     TEXT,
  twitter_image_url TEXT,
  index_status     TEXT NOT NULL DEFAULT 'index',  -- index | noindex
  schema_type      TEXT,
  updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(entity_type, entity_id)
);

-- URL redirects (Cloudflare-Pages-side, applied by middleware)
CREATE TABLE IF NOT EXISTS redirects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  source_path TEXT NOT NULL UNIQUE,    -- e.g. /old-page.html
  target_url  TEXT NOT NULL,           -- absolute or relative
  status_code INTEGER NOT NULL DEFAULT 301,
  is_active   INTEGER NOT NULL DEFAULT 1,
  hits        INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_redirects_active ON redirects(is_active);

-- Site-wide settings (key/value)
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('site.name', 'GreenApple Success Factors'),
  ('site.tagline', 'Clarity. Intelligence. Growth.'),
  ('site.default_meta_description', 'Strategic consulting, mentoring, and capability-building for businesses, startups and institutions.'),
  ('site.default_og_image_url', ''),
  ('site.favicon_url', ''),
  ('site.canonical_base', 'https://gasf-website.pages.dev'),
  ('seo.google_analytics_id', ''),
  ('seo.google_tag_manager_id', ''),
  ('seo.meta_pixel_id', ''),
  ('seo.search_console_verification', '');
