import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TARGET_DIR = join(__dirname, '../static');
const CONFIG_PATH = join(TARGET_DIR, 'config.json');
const API_BASE = process.env.PUBLIC_API_URL || '';

// ---- worker /api/nav 的数据结构 ----
interface NavSite {
  title: string;
  url: string;
  description: string;
  logo?: string;
  tags?: string[];
  featured?: boolean;
  advantages?: string[];
  details?: Record<string, unknown>;
}
interface NavSubCategory { name: string; icon: string; sites: NavSite[]; }
interface NavCategory { name: string; slug?: string; icon: string; sites: NavSite[]; subCategories?: NavSubCategory[]; }
interface NavSiteSettings { title: string; description: string; logoText: string; }
interface NavData { site?: NavSiteSettings; categories: NavCategory[]; totalSites: number; }

// ---- config.json 结构（前端唯一数据源）----
interface ConfigSite {
  title: string; description: string; url: string;
  logo?: string; advantages?: string[]; details?: Record<string, unknown>;
}
interface ConfigSubMenu { name: string; href: string; icon: string; sites: ConfigSite[]; }
interface ConfigMenuItem {
  name: string; href: string; icon: string;
  type: 'single' | 'tabs'; sites?: ConfigSite[]; submenu?: ConfigSubMenu[];
}
interface SiteConfig {
  site: { title: string; description: string; logo: { text: string; href: string } };
  categoryMap: Record<string, string>;
  menuItems: ConfigMenuItem[];
}

const PLACEHOLDER = '#';

function mapSite(s: NavSite): ConfigSite {
  return {
    title: s.title,
    description: s.description,
    url: s.url || PLACEHOLDER,
    ...(s.logo ? { logo: s.logo } : {}),
    ...(s.advantages ? { advantages: s.advantages } : {}),
    ...(s.details ? { details: s.details } : {}),
  };
}

function navToMenuItems(data: NavData): ConfigMenuItem[] {
  return data.categories.map((cat): ConfigMenuItem => {
    const base = `#${cat.name}`;
    if (cat.subCategories && cat.subCategories.length > 0) {
      return {
        name: cat.name,
        href: base,
        icon: cat.icon,
        type: 'tabs',
        submenu: cat.subCategories.map((sub): ConfigSubMenu => ({
          name: sub.name,
          href: `${base}-${sub.name}`,
          icon: sub.icon,
          sites: sub.sites.map(mapSite),
        })),
      };
    }
    return {
      name: cat.name,
      href: base,
      icon: cat.icon,
      type: 'single',
      sites: cat.sites.map(mapSite),
    };
  });
}

function buildCategoryMap(menuItems: ConfigMenuItem[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of menuItems) map[item.name] = item.name;
  return map;
}

async function readExistingConfig(): Promise<SiteConfig | null> {
  if (!existsSync(CONFIG_PATH)) return null;
  try {
    return JSON.parse(await readFile(CONFIG_PATH, 'utf-8')) as SiteConfig;
  } catch {
    return null;
  }
}

const DEFAULT_SITE: SiteConfig['site'] = {
  title: '导航站',
  description: '导航站',
  logo: { text: '导航站', href: '/' },
};

async function main(): Promise<void> {
  console.log('═══════════════════════════════════════');
  console.log('  生成 config.json（数据源：worker /api/nav）');
  console.log('═══════════════════════════════════════');

  const existing = await readExistingConfig();

  if (!API_BASE) {
    if (existing) {
      console.log('⚠️  未设置 PUBLIC_API_URL，保留现有 static/config.json 不变。');
      return;
    }
    throw new Error('未设置 PUBLIC_API_URL 且不存在 config.json，无法生成数据。请在 .env 配置 PUBLIC_API_URL。');
  }

  let navData: NavData;
  try {
    const res = await fetch(`${API_BASE}/api/nav`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    navData = await res.json() as NavData;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (existing) {
      console.warn(`⚠️  抓取 worker 失败(${msg})，保留现有 config.json 兜底。`);
      return;
    }
    throw new Error(`抓取 worker 失败(${msg})，且无 config.json 兜底。请确认 ${API_BASE} 可访问。`);
  }

  const menuItems = navToMenuItems(navData);
  // 站点品牌来自 worker 的 site_settings（在后台「站点设置」编辑）；
  // 缺失时沿用现有 config.json，再退到默认值。
  const site: SiteConfig['site'] = navData.site
    ? {
        title: navData.site.title,
        description: navData.site.description,
        logo: { text: navData.site.logoText || navData.site.title, href: '/' },
      }
    : existing?.site ?? DEFAULT_SITE;
  const config: SiteConfig = {
    site,
    categoryMap: buildCategoryMap(menuItems),
    menuItems,
  };

  await mkdir(TARGET_DIR, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');

  const siteCount = navData.totalSites ?? 0;
  console.log(`✅ 已写入 ${CONFIG_PATH}`);
  console.log(`   分类 ${menuItems.length} 个，网站 ${siteCount} 个（数据源 ${API_BASE}）`);
}

if (!process.env.VITEST) {
  main().catch((error) => {
    console.error('❌ 生成 config.json 失败:', error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

export { navToMenuItems, buildCategoryMap, mapSite };

