-- Migration 003: hero banners (homepage slider)
-- Apply via D1 console or:
--   npx wrangler d1 execute gasf-cms --remote --file=db/migrations/003_banners.sql

CREATE TABLE IF NOT EXISTS hero_banners (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  -- text content
  eyebrow         TEXT,                  -- small badge/label above the heading
  heading         TEXT NOT NULL,         -- main h1 (plain or with {accent}) phrase
  heading_accent  TEXT,                  -- optional accented portion shown after heading
  description     TEXT,                  -- subtext paragraph
  -- buttons
  btn1_text       TEXT,
  btn1_link       TEXT,
  btn2_text       TEXT,
  btn2_link       TEXT,
  -- background
  bg_type         TEXT NOT NULL DEFAULT 'image',  -- image | gradient | image_overlay | solid | video
  bg_image_url    TEXT,
  bg_image_mobile_url TEXT,
  bg_video_url    TEXT,
  bg_color        TEXT,                  -- for solid
  bg_gradient_from TEXT,                 -- for gradient / image_overlay
  bg_gradient_to   TEXT,
  overlay_opacity REAL DEFAULT 0.55,     -- 0..1, used when image_overlay
  -- layout
  text_align      TEXT NOT NULL DEFAULT 'left',  -- left | center | right
  text_color      TEXT,                  -- optional override (hex)
  -- meta
  is_active       INTEGER NOT NULL DEFAULT 1,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_banners_sort   ON hero_banners(sort_order);
CREATE INDEX IF NOT EXISTS idx_banners_active ON hero_banners(is_active);
