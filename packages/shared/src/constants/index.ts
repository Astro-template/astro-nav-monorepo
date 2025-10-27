/**
 * 常量定义
 */

import type { SiteConfig } from '../types/config.js';
import type { OptimizationOptions } from '../types/optimization.js';

/**
 * 默认配置常量
 */
export const DEFAULT_CONFIG: Partial<SiteConfig> = {
  site: {
    title: 'Astro 导航',
    description: '专业的导航网站',
    logo: {
      text: 'Astro Nav',
      href: '/'
    }
  },
  categoryMap: {},
  menuItems: []
};

/**
 * 默认优化选项
 */
export const DEFAULT_OPTIMIZATION: OptimizationOptions = {
  enabled: true,
  previewCount: 3,
  chunkSizeLimit: 100,
  enablePreload: true
};

/**
 * 错误消息常量
 */
export const ERROR_MESSAGES = {
  // 配置相关错误
  CONFIG_LOAD_FAILED: '配置文件加载失败',
  CONFIG_INVALID: '配置文件格式无效',
  CONFIG_MISSING_FIELD: '配置缺少必填字段',
  
  // 验证相关错误
  VALIDATION_FAILED: '数据验证失败',
  INVALID_URL: 'URL格式无效',
  INVALID_MENU_TYPE: '菜单类型必须是 single 或 tabs',
  MISSING_REQUIRED_FIELD: '缺少必填字段',
  
  // 网站相关错误
  SITE_NOT_FOUND: '未找到指定网站',
  SITE_TITLE_REQUIRED: '网站标题不能为空',
  SITE_DESCRIPTION_REQUIRED: '网站描述不能为空',
  
  // 分类相关错误
  CATEGORY_NOT_FOUND: '未找到指定分类',
  CATEGORY_LOAD_FAILED: '分类数据加载失败',
  CATEGORY_EMPTY: '分类不能为空',
  
  // 文件相关错误
  FILE_READ_FAILED: '文件读取失败',
  FILE_WRITE_FAILED: '文件写入失败',
  FILE_TOO_LARGE: '文件大小超过限制',
  FILE_FORMAT_INVALID: '文件格式不支持',
  
  // 网络相关错误
  NETWORK_ERROR: '网络请求失败',
  TIMEOUT_ERROR: '请求超时',
  
  // 通用错误
  UNKNOWN_ERROR: '未知错误',
  OPERATION_FAILED: '操作失败'
} as const;

/**
 * 成功消息常量
 */
export const SUCCESS_MESSAGES = {
  CONFIG_LOADED: '配置加载成功',
  CONFIG_SAVED: '配置保存成功',
  VALIDATION_PASSED: '验证通过',
  OPERATION_SUCCESS: '操作成功'
} as const;

/**
 * 配置文件路径常量
 */
export const CONFIG_PATHS = {
  DEFAULT: '/config.json',
  OPTIMIZED: '/config-optimized.json',
  TRADITIONAL: '/config-traditional.json',
  CATEGORIES_DIR: '/categories'
} as const;

/**
 * 缓存相关常量
 */
export const CACHE_CONFIG = {
  MAX_SIZE_MB: 10,
  EXPIRY_MS: 3600000, // 1小时
  STORAGE_KEY: 'astro-nav-cache',
  VERSION: '1.0.0'
} as const;

/**
 * 性能相关常量
 */
export const PERFORMANCE_CONFIG = {
  LAZY_LOAD_THRESHOLD: 3, // 预览网站数量
  MAX_CATEGORY_SIZE_KB: 100,
  MAX_SITES_PER_CATEGORY: 50,
  PRELOAD_DELAY_MS: 1000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  REQUEST_TIMEOUT_MS: 10000
} as const;

/**
 * 验证规则常量
 */
export const VALIDATION_RULES = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_URL_LENGTH: 2000,
  MIN_TITLE_LENGTH: 1,
  MIN_DESCRIPTION_LENGTH: 1,
  MAX_ADVANTAGES_COUNT: 10,
  MAX_FEATURES_COUNT: 10,
  MAX_RELATED_SITES: 5
} as const;

/**
 * HTTP 状态码
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

/**
 * 文件类型常量
 */
export const FILE_TYPES = {
  JSON: 'application/json',
  CSV: 'text/csv',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ZIP: 'application/zip'
} as const;

/**
 * 正则表达式常量
 */
export const REGEX_PATTERNS = {
  URL: /^https?:\/\/.+/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
} as const;
