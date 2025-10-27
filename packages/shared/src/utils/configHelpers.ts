/**
 * 配置辅助工具函数
 */

import type { SiteConfig, MenuItem, Site } from '../types/config.js';

/**
 * 获取所有网站数据（扁平化）
 */
export function getAllSites(config: SiteConfig): Site[] {
  const sites: Site[] = [];
  
  config.menuItems.forEach(item => {
    if (item.sites) {
      sites.push(...item.sites);
    }
    if (item.submenu) {
      item.submenu.forEach(sub => {
        sites.push(...sub.sites);
      });
    }
  });
  
  return sites;
}

/**
 * 根据类别名称获取菜单项
 */
export function getMenuItemByName(config: SiteConfig, name: string): MenuItem | undefined {
  return config.menuItems.find(item => item.name === name);
}

/**
 * 根据URL查找网站
 */
export function getSiteByUrl(config: SiteConfig, url: string): Site | undefined {
  const allSites = getAllSites(config);
  return allSites.find(site => site.url === url);
}

/**
 * 搜索网站
 */
export function searchSites(config: SiteConfig, query: string): Site[] {
  const allSites = getAllSites(config);
  const lowercaseQuery = query.toLowerCase();
  
  return allSites.filter(site => 
    site.title.toLowerCase().includes(lowercaseQuery) ||
    site.description.toLowerCase().includes(lowercaseQuery) ||
    (site.advantages && site.advantages.some(advantage => 
      advantage.toLowerCase().includes(lowercaseQuery)
    ))
  );
}

/**
 * 根据分类ID获取分类名称
 */
export function getCategoryName(config: SiteConfig, categoryId: string): string {
  if (!config.categoryMap) return categoryId;
  
  const entry = Object.entries(config.categoryMap).find(([_, id]) => id === categoryId);
  return entry ? entry[0] : categoryId;
}

/**
 * 获取统计信息
 */
export function getConfigStats(config: SiteConfig) {
  const allSites = getAllSites(config);
  
  return {
    totalCategories: config.menuItems.length,
    totalSites: allSites.length,
    categoriesWithSubmenus: config.menuItems.filter(item => item.submenu).length,
    singleCategories: config.menuItems.filter(item => item.type === 'single').length,
    tabsCategories: config.menuItems.filter(item => item.type === 'tabs').length
  };
}

/**
 * 获取所有分类名称
 */
export function getAllCategoryNames(config: SiteConfig): string[] {
  const names: string[] = [];
  
  config.menuItems.forEach(item => {
    names.push(item.name);
    if (item.submenu) {
      item.submenu.forEach(sub => {
        names.push(sub.name);
      });
    }
  });
  
  return names;
}

/**
 * 检查配置是否为空
 */
export function isConfigEmpty(config: SiteConfig): boolean {
  return !config.menuItems || config.menuItems.length === 0;
}

/**
 * 合并配置
 */
export function mergeConfigs(base: SiteConfig, override: Partial<SiteConfig>): SiteConfig {
  return {
    ...base,
    ...override,
    site: override.site ? { ...base.site, ...override.site } : base.site,
    menuItems: override.menuItems || base.menuItems,
    categoryMap: override.categoryMap ? { ...base.categoryMap, ...override.categoryMap } : base.categoryMap
  };
}
