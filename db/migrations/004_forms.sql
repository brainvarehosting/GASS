-- Migration 004: form builder
-- Apply via D1 console or:
--   npx wrangler d1 execute gasf-cms --remote --file=db/migrations/004_forms.sql

CREATE TABLE IF NOT EXISTS forms (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  slug               TEXT NOT NULL UNIQUE,
  name               TEXT NOT NULL,
  description        TEXT,
  success_message    TEXT NOT NULL DEFAULT 'Thanks — we will be in touch shortly.',
  redirect_url       TEXT,
  notification_email TEXT,
  button_text        TEXT NOT NULL DEFAULT 'Submit',
  is_active          INTEGER NOT NULL DEFAULT 1,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_forms_slug   ON forms(slug);
CREATE INDEX IF NOT EXISTS idx_forms_active ON forms(is_active);

CREATE TABLE IF NOT EXISTS form_fields (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  form_id      INTEGER NOT NULL,
  label        TEXT NOT NULL,
  name         TEXT NOT NULL,           -- field key (snake_case)
  type         TEXT NOT NULL,           -- text|email|phone|textarea|select|checkbox|radio|consent|hidden
  placeholder  TEXT,
  options_json TEXT,                    -- JSON array for select/radio/checkbox
  is_required  INTEGER NOT NULL DEFAULT 0,
  help_text    TEXT,
  default_value TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_form_fields_form ON form_fields(form_id, sort_order);

CREATE TABLE IF NOT EXISTS form_submissions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  form_id     INTEGER NOT NULL,
  form_slug   TEXT NOT NULL,
  data_json   TEXT NOT NULL,
  name        TEXT,                     -- denormalized for list view
  email       TEXT,
  phone       TEXT,
  source_page TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  status      TEXT NOT NULL DEFAULT 'new',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_fs_form    ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_fs_created ON form_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fs_status  ON form_submissions(status);
