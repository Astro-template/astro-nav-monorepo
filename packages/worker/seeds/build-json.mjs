/**
 * 把 seed SQL 转成前端可直接用的 config.json 数据集。
 *
 * 用途：不部署 worker 的纯静态玩法（website 读 static/config.json）。
 * 做法：在内存 sqlite 里跑 migrations + 一个 seed，再按 worker publish
 * 和 website sync-config 相同的映射导出 —— 保证两条路径产出结构一致。
 *
 *   node seeds/build-json.mjs aff
 *   node seeds/build-json.mjs eooce
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(here, '..');

const DATASETS = {
  aff: { sql: 'aff-nav.sql', title: 'Affiliate导航', description: '专业的Affiliate营销导航网站' },
  eooce: { sql: 'eooce-nav.sql', title: '老王导航', description: '实用工具与资源导航' },
};

const MIGRATIONS = ['0001_init.sql', '0002_v2_schema.sql', '0004_site_settings.sql'];

const name = process.argv[2];
const dataset = DATASETS[name];
if (!dataset) {
  console.error(`用法: node seeds/build-json.mjs <${Object.keys(DATASETS).join('|')}>`);
  process.exit(1);
}

const db = new DatabaseSync(':memory:');
for (const file of MIGRATIONS) {
  db.exec(readFileSync(join(workerRoot, 'migrations', file), 'utf-8'));
}
db.exec(readFileSync(join(here, dataset.sql), 'utf-8'));

const parseJson = (raw, fallback) => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const mapSite = (s) => {
  const advantages = parseJson(s.advantages, []);
  const details = parseJson(s.details, null);
  return {
    title: s.title,
    description: s.description,
    url: s.url || '#',
    ...(s.logo ? { logo: s.logo } : {}),
    ...(advantages.length ? { advantages } : {}),
    ...(details && Object.keys(details).length ? { details } : {}),
  };
};

const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
const sites = db
  .prepare("SELECT * FROM sites WHERE status = 'approved' ORDER BY sort_order ASC, created_at DESC")
  .all();

const topLevel = categories.filter((c) => !c.parent_id);
const children = categories.filter((c) => c.parent_id);
const sitesOf = (categoryId) => sites.filter((s) => s.category_id === categoryId).map(mapSite);

const menuItems = topLevel.map((cat) => {
  const base = `#${cat.name}`;
  const subs = children.filter((c) => c.parent_id === cat.id);
  if (subs.length > 0) {
    return {
      name: cat.name,
      href: base,
      icon: cat.icon,
      type: 'tabs',
      submenu: subs.map((sub) => ({
        name: sub.name,
        href: `${base}-${sub.name}`,
        icon: sub.icon,
        sites: sitesOf(sub.id),
      })),
    };
  }
  return { name: cat.name, href: base, icon: cat.icon, type: 'single', sites: sitesOf(cat.id) };
});

const config = {
  site: {
    title: dataset.title,
    description: dataset.description,
    logo: { text: dataset.title, href: '/' },
  },
  categoryMap: Object.fromEntries(menuItems.map((m) => [m.name, m.name])),
  menuItems,
};

const out = join(here, `${name}-nav.json`);
writeFileSync(out, `${JSON.stringify(config, null, 2)}\n`, 'utf-8');
console.log(`✅ ${out}`);
console.log(`   分类 ${menuItems.length} 个（含子分类 ${children.length}），网站 ${sites.length} 个`);
