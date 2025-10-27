import type { SiteConfig, MenuItem, Site } from '../types/config.js';

// 获取完整配置
export function getConfig(): SiteConfig {
  // 这个函数需要在使用时从外部传入配置数据
  // 或者从文件系统读取
  throw new Error('getConfig must be implemented in the consuming package');
}

// 获取网站基础信息
export function getSiteInfo(config: SiteConfig) {
  return config.site;
}

// 获取所有菜单项
export function getMenuItems(config: SiteConfig): MenuItem[] {
  return config.menuItems;
}

// 根据类别名称获取菜单项
export function getMenuItemByName(config: SiteConfig, name: string): MenuItem | undefined {
  return config.menuItems.find(item => item.name === name);
}

// 获取所有网站数据（扁平化）
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

// 根据URL查找网站
export function getSiteByUrl(config: SiteConfig, url: string): Site | undefined {
  const allSites = getAllSites(config);
  return allSites.find(site => site.url === url);
}

// 搜索网站
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

// 获取分类映射
export function getCategoryMap(config: SiteConfig) {
  return config.categoryMap;
}

// 根据分类ID获取分类名称
export function getCategoryName(config: SiteConfig, categoryId: string): string {
  const categoryMap = getCategoryMap(config);
  if (!categoryMap) return categoryId;
  
  const entry = Object.entries(categoryMap).find(([_, id]) => id === categoryId);
  return entry ? entry[0] : categoryId;
}

// 获取统计信息
export function getStats(config: SiteConfig) {
  const allSites = getAllSites(config);
  
  return {
    totalCategories: config.menuItems.length,
    totalSites: allSites.length,
    categoriesWithSubmenus: config.menuItems.filter(item => item.submenu).length
  };
}
