import type { SiteConfig } from '@astro-nav/shared';

export function toSlugBase(title: string): string {
  return title.toLowerCase().replace(/[\s/]+/g, '-');
}

/** 站点身份：标题 + URL。列表页拿到的 url 经过 `site.url || '#'` 归一化，这里保持一致。 */
export function siteKey(title: string, url?: string): string {
  return `${title}\u0000${url || '#'}`;
}

/**
 * 为配置里的每个站点分配详情页 slug。
 *
 * 标题会重复（例如 Gmail 同时挂在两个分类下）。直接用标题做 slug 会让多个页面撞到同一路由，
 * Astro 构建时丢弃后出现的那些（"conflicts with higher priority route"）。规则：
 * - 标题和 URL 都相同 → 同一个站点，共用一个 slug，只生成一个详情页；
 * - 标题相同但 URL 不同 → 不同站点，按出现顺序追加 -2、-3。
 *
 * 列表页和详情页都通过 siteKey 查这张表，因此不依赖各自的遍历顺序。
 */
export function buildSlugMap(config: SiteConfig): Map<string, string> {
  const slugs = new Map<string, string>();
  const counts = new Map<string, number>();

  const assign = (title: string, url?: string): void => {
    const key = siteKey(title, url);
    if (slugs.has(key)) return;
    const base = toSlugBase(title);
    const seen = (counts.get(base) ?? 0) + 1;
    counts.set(base, seen);
    slugs.set(key, seen === 1 ? base : `${base}-${seen}`);
  };

  for (const menuItem of config.menuItems) {
    menuItem.sites?.forEach((site) => assign(site.title, site.url));
    menuItem.submenu?.forEach((sub) => sub.sites?.forEach((site) => assign(site.title, site.url)));
  }

  return slugs;
}
