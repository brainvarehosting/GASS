-- Migration 007: page builder (CMS pages)
-- Sections are stored as a JSON array in cms_pages.sections_json (lean
-- schema, easier admin UX). Public pages are served at /p/:slug via
-- the /functions/p/[slug].js handler.

CREATE TABLE IF NOT EXISTS cms_pages (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  description   TEXT,
  sections_json TEXT NOT NULL DEFAULT '[]',
  status        TEXT NOT NULL DEFAULT 'draft',     -- draft | published | archived
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug   ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON cms_pages(status);
