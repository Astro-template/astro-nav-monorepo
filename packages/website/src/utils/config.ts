import type { SiteConfig, Category } from '@astro-nav/shared';
import { convertMenuItemToCategory, getSiteInfo, getMenuItems, getAllSites, searchSites } from '@astro-nav/shared';
import configData from '../../static/config.json';

const API_BASE = import.meta.env.PUBLIC_API_URL || '';

interface NavSite {
  title: string;
  url: string;
  description: string;
  advantages?: string[];
  details?: { intro?: string; pricing?: string; pros?: string[]; cons?: string[]; tips?: string[] };
}

interface NavSubCategory {
  name: string;
  icon: string;
  sites: NavSite[];
}

interface NavCategory {
  name: string;
  icon: string;
  sites: NavSite[];
  subCategories?: NavSubCategory[];
}

interface NavData {
  categories: NavCategory[];
  totalSites: number;
}

export async function getNavData(): Promise<Category[]> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/nav`);
      if (res.ok) {
        const data = await res.json() as NavData;
        return data.categories.map((cat) => {
          if (cat.subCategories && cat.subCategories.length > 0) {
            return {
              name: cat.name,
              icon: cat.icon,
              subCategories: cat.subCategories.map((sub) => ({
                name: sub.name,
                items: sub.sites.map((s) => ({ title: s.title, url: s.url, description: s.description })),
              })),
            };
          }
          return {
            name: cat.name,
            icon: cat.icon,
            items: cat.sites.map((s) => ({ title: s.title, url: s.url, description: s.description })),
          };
        });
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
