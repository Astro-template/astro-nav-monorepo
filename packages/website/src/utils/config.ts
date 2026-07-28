import type { SiteConfig, Category } from '@astro-nav/shared';
import { convertMenuItemToCategory, getSiteInfo, getMenuItems, getAllSites, searchSites } from '@astro-nav/shared';
import configData from '../../static/config.json';
import { buildSlugMap, siteKey } from './slug';

// 唯一数据源：static/config.json（由 scripts/sync-config.ts 在 dev/build 前从 worker 生成）
const config = configData as SiteConfig;
const slugMap = buildSlugMap(config);

export function getConfig(): SiteConfig {
  return config;
}

export function getSiteSlug(title: string, url?: string): string {
  return slugMap.get(siteKey(title, url)) ?? '';
}

export async function getNavData(): Promise<Category[]> {
  return config.menuItems.map(convertMenuItemToCategory);
}

export { getSiteInfo, getMenuItems, getAllSites, searchSites };
