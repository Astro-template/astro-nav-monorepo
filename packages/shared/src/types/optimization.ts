// 性能优化相关的类型定义
// Re-export types from lazyLoading to avoid duplication
export type {
  OptimizedMenuItem,
  OptimizedSubMenuItem,
  CategoryData,
  LoadingState,
  PerformanceMetrics
} from './lazyLoading.js';

import type { Site } from './config.js';

export interface OptimizationOptions {
  enabled: boolean;
  previewCount: number; // 预览网站数量 (默认3)
  chunkSizeLimit: number; // 单个分类文件大小限制(KB) (默认100)
  enablePreload: boolean; // 是否启用预加载 (默认true)
}

export interface PreviewSite {
  title: string;
  description: string;
  url?: string;
  logo?: string;
}

export interface OptimizedBaseConfig {
  site: {
    title: string;
    description: string;
    logo: {
      text: string;
      href: string;
    };
  };
  menuItems: import('./lazyLoading.js').OptimizedMenuItem[];
  optimization: {
    enabled: true;
    totalCategories: number;
    totalSites: number;
    previewCount: number;
    fileSizeKB: number;
    compressionRatio: number;
  };
}

export interface RelatedSite {
  title: string;
  description: string;
  url?: string;
}

export interface CategoryFile {
  filename: string; // "0.json", "1.json", etc.
  content: import('./lazyLoading.js').CategoryData;
  sizeKB: number;
}

export interface OptimizedConfigResult {
  baseConfig: OptimizedBaseConfig;
  categoryFiles: CategoryFile[];
  optimization: {
    enabled: true;
    originalSizeKB: number;
    optimizedSizeKB: number;
    compressionRatio: number;
    totalCategories: number;
    totalSites: number;
    previewCount?: number;
    chunkSizeLimit?: number;
    enablePreload?: boolean;
  };
}

export interface TraditionalConfigResult {
  config: any; // 传统的完整配置
  optimization: {
    enabled: false;
  };
}

export type ConfigResult = OptimizedConfigResult | TraditionalConfigResult;

// API 请求/响应类型
export interface GenerateConfigRequest {
  menuFile: File;
  siteFile: File;
  siteInfo: {
    title: string;
    description: string;
    logoText: string;
  };
  optimization: OptimizationOptions;
}

export interface GenerateConfigResponse {
  success: boolean;
  data?: {
    downloadUrl: string;
    fileType: "json" | "zip";
    filename: string;
    optimization: {
      enabled: boolean;
      originalSizeKB?: number;
      optimizedSizeKB?: number;
      compressionRatio?: number;
      totalCategories?: number;
      totalSites?: number;
    };
  };
  error?: string;
}

// 验证规则
export interface ValidationRules {
  maxCategorySize: number; // KB
  maxSiteCount: number; // 每个分类最大网站数
  maxPreviewCount: number; // 最大预览网站数
  requiredFields: string[]; // 网站必填字段
}

export const DEFAULT_VALIDATION_RULES: ValidationRules = {
  maxCategorySize: 100,
  maxSiteCount: 50,
  maxPreviewCount: 5,
  requiredFields: ["title", "description"],
};

export const DEFAULT_OPTIMIZATION_OPTIONS: OptimizationOptions = {
  enabled: true,
  previewCount: 3,
  chunkSizeLimit: 100,
  enablePreload: true,
};

// 缓存相关类型
export interface CacheStatus {
  totalCategories: number;
  cachedCategories: number;
  cacheHitRate: number;
  totalSizeKB: number;
}

// Web性能监控类型（与lazyLoading中的PerformanceMetrics不同）
export interface WebPerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  categoryLoadTime: Record<number, number>;
  cacheHitRate: number;
}

export interface OptimizationStats {
  enabled: boolean;
  configSizeReduction: number;
  loadTimeImprovement: number;
  memoryUsageReduction: number;
  userExperienceScore: number;
}
