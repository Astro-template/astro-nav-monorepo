-- astro-nav D1 schema v2
-- Supports hierarchical categories (parent/child for tabs) and rich site data

DROP TABLE IF EXISTS sites;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '',
  description TEXT DEFAULT '',
  type TEXT DEFAULT 'single',       -- 'single' (flat list) | 'tabs' (has sub-categories)
  parent_id TEXT DEFAULT NULL,      -- NULL = top-level, non-NULL = child of a tabs category
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE sites (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  category_id TEXT NOT NULL,        -- points to leaf category (top-level single OR child of tabs)
  tags TEXT DEFAULT '[]',           -- JSON array of strings
  advantages TEXT DEFAULT '[]',     -- JSON array of strings (e.g. ["跳转速度快","价格便宜"])
  details TEXT DEFAULT '{}',        -- JSON object {intro, pricing, pros[], cons[], tips[]}

  -- submitter info
  submitter_name TEXT DEFAULT '',
  submitter_email TEXT DEFAULT '',
  submitter_reason TEXT DEFAULT '',

  -- review
  status TEXT DEFAULT 'pending',    -- pending | approved | rejected
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

CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_sites_category ON sites(category_id);
CREATE INDEX idx_sites_featured ON sites(featured);
CREATE INDEX idx_categories_parent ON categories(parent_id);
