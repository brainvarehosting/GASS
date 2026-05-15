-- Migration 005: blog / insights
-- Apply via D1 console or:
--   npx wrangler d1 execute gasf-cms --remote --file=db/migrations/005_blogs.sql

CREATE TABLE IF NOT EXISTS blogs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  excerpt         TEXT,
  content_html    TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  category        TEXT,
  author          TEXT,
  tags_json       TEXT,                  -- JSON array of strings
  meta_title      TEXT,
  meta_description TEXT,
  og_image_url    TEXT,
  status          TEXT NOT NULL DEFAULT 'draft',  -- draft | published | archived
  published_at    TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_blogs_slug      ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status    ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category  ON blogs(category);
