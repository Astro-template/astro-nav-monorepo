/**
 * Constants — 消除魔法字符串。
 */

export const KV_KEY = {
  NAV_SITES: "nav:sites.json",
  NAV_CATEGORIES: "nav:categories.json",
} as const;

export const KV_PREFIX = {
  RATE_LIMIT: "rl:",
  SESSION: "session:",
} as const;

export const TTL = {
  RATE_LIMIT: 3600, // 1 hour
  SESSION: 86400 * 7, // 7 days
} as const;

export const LIMITS = {
  SUBMISSIONS_PER_HOUR: 5,
  MAX_LIST_LIMIT: 100,
  DEFAULT_LIST_LIMIT: 50,
  MAX_TITLE_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 200,
} as const;

export const SITE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

// site_settings 表的 key 与 SiteSettings 字段的映射
export const SETTINGS_KEY = {
  title: "site_title",
  description: "site_description",
  logoText: "logo_text",
} as const;

export const DEFAULT_SETTINGS = {
  title: "导航站",
  description: "一个简洁的导航站",
  logoText: "导航站",
} as const;
