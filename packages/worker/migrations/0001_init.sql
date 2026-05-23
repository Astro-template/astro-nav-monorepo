-- astro-nav D1 schema

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  category_id TEXT NOT NULL,
  tags TEXT DEFAULT '[]',

  -- submitter info
  submitter_name TEXT DEFAULT '',
  submitter_email TEXT DEFAULT '',
  submitter_reason TEXT DEFAULT '',

  -- review
  status TEXT DEFAULT 'pending',
  reviewer_note TEXT DEFAULT '',
  reviewed_at TEXT,

  -- metadata
  sort_order INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_sites_category ON sites(category_id);
CREATE INDEX IF NOT EXISTS idx_sites_featured ON sites(featured);
