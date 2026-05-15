-- Migration 002: media library
-- Apply via D1 console or:
--   npx wrangler d1 execute gasf-cms --remote --file=db/migrations/002_media.sql

CREATE TABLE IF NOT EXISTS media_files (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  filename      TEXT NOT NULL,
  original_name TEXT,
  mime_type     TEXT,
  size          INTEGER,
  r2_key        TEXT NOT NULL UNIQUE,
  public_url    TEXT,
  alt_text      TEXT,
  caption       TEXT,
  category      TEXT NOT NULL DEFAULT 'general',
  width         INTEGER,
  height        INTEGER,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_media_created  ON media_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_category ON media_files(category);
