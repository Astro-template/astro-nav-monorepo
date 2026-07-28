import type { SiteConfig, Category } from '@astro-nav/shared';
import { convertMenuItemToCategory, getSiteInfo, getMenuItems, getAllSites, searchSites } from '@astro-nav/shared';
import configData from '../../static/config.json';

// 唯一数据源：static/config.json（由 scripts/sync-config.ts 在 dev/build 前从 worker 生成）
const config = configData as SiteConfig;

export function getConfig(): SiteConfig {
  return config;
}

export async function getNavData(): Promise<Category[]> {
  return config.menuItems.map(convertMenuItemToCategory);
}

export { getSiteInfo, getMenuItems, getAllSites, searchSites };
