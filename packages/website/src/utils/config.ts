import type { SiteConfig, Category } from '@astro-nav/shared';
import { convertMenuItemToCategory, getSiteInfo, getMenuItems, getAllSites, searchSites } from '@astro-nav/shared';
import configData from '../../static/config.json';

const API_BASE = import.meta.env.PUBLIC_API_URL || '';

/**
 * Fetch navigation data at build time.
 * Tries Worker API first, falls back to static config.json.
 */
export async function getNavData(): Promise<Category[]> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/nav`);
      if (res.ok) {
        const data = await res.json() as {
          categories: { name: string; slug: string; icon: string; sites: { title: string; url: string; description: string }[] }[];
        };
        return data.categories.map((cat) => ({
          name: cat.name,
          icon: cat.icon,
          items: cat.sites.map((s) => ({ title: s.title, url: s.url, description: s.description })),
        }));
      }
    } catch { /* fallback */ }
  }

  const config = configData as SiteConfig;
  return config.menuItems.map(convertMenuItemToCategory);
}

export function getConfig(): SiteConfig {
  return configData as SiteConfig;
}

export { getSiteInfo, getMenuItems, getAllSites, searchSites };
