/**
 * 配置验证工具函数
 */

import type { SiteConfig, Site, MenuItem } from '../types/config.js';

/**
 * 验证配置对象
 */
export function validateConfig(config: unknown): config is SiteConfig {
  if (!config || typeof config !== 'object') {
    throw new Error('配置必须是一个对象');
  }

  const cfg = config as any;

  // 验证 site 字段
  if (!cfg.site || typeof cfg.site !== 'object') {
    throw new Error('配置缺少 site 字段');
  }

  if (!cfg.site.title || typeof cfg.site.title !== 'string') {
    throw new Error('site.title 必须是字符串');
  }

  if (!cfg.site.description || typeof cfg.site.description !== 'string') {
    throw new Error('site.description 必须是字符串');
  }

  // 验证 menuItems 字段
  if (!Array.isArray(cfg.menuItems)) {
    throw new Error('menuItems 必须是数组');
  }

  // 验证每个菜单项
  cfg.menuItems.forEach((item: any, index: number) => {
    validateMenuItem(item, index);
  });

  return true;
}

/**
 * 验证菜单项
 */
export function validateMenuItem(item: unknown, index?: number): item is MenuItem {
  if (!item || typeof item !== 'object') {
    throw new Error(`菜单项 ${index ?? ''} 必须是对象`);
  }

  const menuItem = item as any;
  const prefix = index !== undefined ? `菜单项 ${index}` : '菜单项';

  if (!menuItem.name || typeof menuItem.name !== 'string') {
    throw new Error(`${prefix} 缺少 name 字段`);
  }

  if (!menuItem.href || typeof menuItem.href !== 'string') {
    throw new Error(`${prefix} 缺少 href 字段`);
  }

  if (!menuItem.icon || typeof menuItem.icon !== 'string') {
    throw new Error(`${prefix} 缺少 icon 字段`);
  }

  if (!menuItem.type || !['single', 'tabs'].includes(menuItem.type)) {
    throw new Error(`${prefix} 的 type 必须是 'single' 或 'tabs'`);
  }

  if (menuItem.type === 'single') {
    if (!Array.isArray(menuItem.sites)) {
      throw new Error(`${prefix} (single类型) 必须包含 sites 数组`);
    }
    menuItem.sites.forEach((site: any, siteIndex: number) => {
      validateSite(site, `${prefix}.sites[${siteIndex}]`);
    });
  }

  if (menuItem.type === 'tabs') {
    if (!Array.isArray(menuItem.submenu)) {
      throw new Error(`${prefix} (tabs类型) 必须包含 submenu 数组`);
    }
    menuItem.submenu.forEach((sub: any, subIndex: number) => {
      validateSubMenuItem(sub, `${prefix}.submenu[${subIndex}]`);
    });
  }

  return true;
}

/**
 * 验证子菜单项
 */
export function validateSubMenuItem(item: unknown, prefix: string = '子菜单项'): boolean {
  if (!item || typeof item !== 'object') {
    throw new Error(`${prefix} 必须是对象`);
  }

  const subItem = item as any;

  if (!subItem.name || typeof subItem.name !== 'string') {
    throw new Error(`${prefix} 缺少 name 字段`);
  }

  if (!subItem.href || typeof subItem.href !== 'string') {
    throw new Error(`${prefix} 缺少 href 字段`);
  }

  if (!subItem.icon || typeof subItem.icon !== 'string') {
    throw new Error(`${prefix} 缺少 icon 字段`);
  }

  if (!Array.isArray(subItem.sites)) {
    throw new Error(`${prefix} 必须包含 sites 数组`);
  }

  subItem.sites.forEach((site: any, siteIndex: number) => {
    validateSite(site, `${prefix}.sites[${siteIndex}]`);
  });

  return true;
}

/**
 * 验证网站对象
 */
export function validateSite(site: unknown, prefix: string = '网站'): site is Site {
  if (!site || typeof site !== 'object') {
    throw new Error(`${prefix} 必须是对象`);
  }

  const s = site as any;

  if (!s.title || typeof s.title !== 'string') {
    throw new Error(`${prefix} 缺少 title 字段`);
  }

  if (!s.description || typeof s.description !== 'string') {
    throw new Error(`${prefix} 缺少 description 字段`);
  }

  // 可选字段验证
  if (s.url !== undefined && typeof s.url !== 'string') {
    throw new Error(`${prefix}.url 必须是字符串`);
  }

  if (s.logo !== undefined && typeof s.logo !== 'string') {
    throw new Error(`${prefix}.logo 必须是字符串`);
  }

  if (s.advantages !== undefined && !Array.isArray(s.advantages)) {
    throw new Error(`${prefix}.advantages 必须是数组`);
  }

  if (s.features !== undefined && !Array.isArray(s.features)) {
    throw new Error(`${prefix}.features 必须是数组`);
  }

  return true;
}

/**
 * 验证URL格式
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证网站URL（更宽松，支持相对路径）
 */
export function validateSiteUrl(url: string): boolean {
  if (!url) return false;
  
  // 支持绝对URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return validateUrl(url);
  }
  
  // 支持相对路径
  if (url.startsWith('/') || url.startsWith('#')) {
    return true;
  }
  
  return false;
}
