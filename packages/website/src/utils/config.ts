import type { SiteConfig } from '@astro-nav/shared';
import configData from '../../static/config.json';

// 获取完整配置
export function getConfig(): SiteConfig {
  return configData as SiteConfig;
}

// 导出其他辅助函数
export { 
  getSiteInfo, 
  getMenuItems, 
  getMenuItemByName,
  getAllSites,
  getSiteByUrl,
  searchSites,
  getCategoryMap,
  getCategoryName,
  getStats
} from '@astro-nav/shared';
