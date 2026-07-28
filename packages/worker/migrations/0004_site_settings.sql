-- astro-nav 站点品牌设置（key-value，可在后台编辑）
-- 幂等：可重复执行，不会覆盖已有值

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 默认品牌值（INSERT OR IGNORE：已存在则不动）
INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('site_title', '导航站'),
  ('site_description', '一个简洁的导航站'),
  ('logo_text', '导航站');
