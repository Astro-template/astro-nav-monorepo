import { describe, it, expect } from 'vitest';
import {
  getAllSites,
  getMenuItemByName,
  getSiteByUrl,
  searchSites,
  getCategoryName,
  getConfigStats,
  getAllCategoryNames,
  isConfigEmpty,
  mergeConfigs
} from '../../../src/utils/configHelpers';
import type { SiteConfig } from '../../../src/types/config';

describe('configHelpers', () => {
  // 测试用的配置数据
  const mockConfig: SiteConfig = {
    site: {
      title: '测试网站',
      description: '测试描述',
      logo: {
        text: '测试',
        href: '/'
      }
    },
    categoryMap: {
      '开发工具': 'dev-tools',
      '设计工具': 'design-tools'
    },
    menuItems: [
      {
        name: '开发工具',
        href: '/dev-tools',
        icon: 'icon-dev',
        type: 'single',
        sites: [
          {
            title: 'GitHub',
            description: '代码托管平台',
            url: 'https://github.com',
            advantages: ['开源', '协作']
          },
          {
            title: 'GitLab',
            description: 'DevOps 平台',
            url: 'https://gitlab.com'
          }
        ]
      },
      {
        name: '设计工具',
        href: '/design-tools',
        icon: 'icon-design',
        type: 'tabs',
        submenu: [
          {
            name: 'UI设计',
            href: '/ui-design',
            icon: 'icon-ui',
            sites: [
              {
                title: 'Figma',
                description: '协作设计工具',
                url: 'https://figma.com'
              }
            ]
          },
          {
            name: '图标',
            href: '/icons',
            icon: 'icon-icons',
            sites: [
              {
                title: 'IconFont',
                description: '图标库',
                url: 'https://iconfont.cn'
              }
            ]
          }
        ]
      }
    ]
  };

  describe('getAllSites', () => {
    it('应该获取所有网站（扁平化）', () => {
      const sites = getAllSites(mockConfig);
      expect(sites).toHaveLength(4);
      expect(sites[0].title).toBe('GitHub');
      expect(sites[1].title).toBe('GitLab');
      expect(sites[2].title).toBe('Figma');
      expect(sites[3].title).toBe('IconFont');
    });

    it('应该处理空配置', () => {
      const emptyConfig: SiteConfig = {
        site: { title: '空', description: '空', logo: { text: '空', href: '/' } },
        categoryMap: {},
        menuItems: []
      };
      const sites = getAllSites(emptyConfig);
      expect(sites).toHaveLength(0);
    });

    it('应该处理只有 single 类型的菜单', () => {
      const config: SiteConfig = {
        site: { title: '测试', description: '测试', logo: { text: '测试', href: '/' } },
        categoryMap: {},
        menuItems: [
          {
            name: '分类1',
            href: '/cat1',
            icon: 'icon1',
            type: 'single',
            sites: [
              { title: '网站1', description: '描述1' }
            ]
          }
        ]
      };
      const sites = getAllSites(config);
      expect(sites).toHaveLength(1);
    });
  });

  describe('getMenuItemByName', () => {
    it('应该根据名称找到菜单项', () => {
      const item = getMenuItemByName(mockConfig, '开发工具');
      expect(item).toBeDefined();
      expect(item?.name).toBe('开发工具');
      expect(item?.type).toBe('single');
    });

    it('应该在找不到时返回 undefined', () => {
      const item = getMenuItemByName(mockConfig, '不存在的分类');
      expect(item).toBeUndefined();
    });

    it('应该精确匹配名称', () => {
      const item = getMenuItemByName(mockConfig, '开发工具');
      expect(item).toBeDefined();
      expect(item?.name).toBe('开发工具');
    });
  });

  describe('getSiteByUrl', () => {
    it('应该根据 URL 找到网站', () => {
      const site = getSiteByUrl(mockConfig, 'https://github.com');
      expect(site).toBeDefined();
      expect(site?.title).toBe('GitHub');
    });

    it('应该在找不到时返回 undefined', () => {
      const site = getSiteByUrl(mockConfig, 'https://notfound.com');
      expect(site).toBeUndefined();
    });

    it('应该在子菜单中查找', () => {
      const site = getSiteByUrl(mockConfig, 'https://figma.com');
      expect(site).toBeDefined();
      expect(site?.title).toBe('Figma');
    });
  });

  describe('searchSites', () => {
    it('应该根据标题搜索网站', () => {
      const results = searchSites(mockConfig, 'GitHub');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('GitHub');
    });

    it('应该根据描述搜索网站', () => {
      const results = searchSites(mockConfig, '代码托管');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('GitHub');
    });

    it('应该根据优势搜索网站', () => {
      const results = searchSites(mockConfig, '开源');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('GitHub');
    });

    it('应该不区分大小写', () => {
      const results = searchSites(mockConfig, 'github');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('GitHub');
    });

    it('应该返回多个匹配结果', () => {
      const results = searchSites(mockConfig, '工具');
      expect(results.length).toBeGreaterThan(0);
    });

    it('应该在没有匹配时返回空数组', () => {
      const results = searchSites(mockConfig, '不存在的关键词xyz123');
      expect(results).toHaveLength(0);
    });
  });

  describe('getCategoryName', () => {
    it('应该根据 ID 获取分类名称', () => {
      const name = getCategoryName(mockConfig, 'dev-tools');
      expect(name).toBe('开发工具');
    });

    it('应该在找不到时返回原 ID', () => {
      const name = getCategoryName(mockConfig, 'unknown-id');
      expect(name).toBe('unknown-id');
    });

    it('应该处理没有 categoryMap 的配置', () => {
      const config: SiteConfig = {
        site: { title: '测试', description: '测试', logo: { text: '测试', href: '/' } },
        categoryMap: {},
        menuItems: []
      };
      const name = getCategoryName(config, 'some-id');
      expect(name).toBe('some-id');
    });
  });

  describe('getConfigStats', () => {
    it('应该返回正确的统计信息', () => {
      const stats = getConfigStats(mockConfig);
      expect(stats.totalCategories).toBe(2);
      expect(stats.totalSites).toBe(4);
      expect(stats.categoriesWithSubmenus).toBe(1);
      expect(stats.singleCategories).toBe(1);
      expect(stats.tabsCategories).toBe(1);
    });

    it('应该处理空配置', () => {
      const emptyConfig: SiteConfig = {
        site: { title: '空', description: '空', logo: { text: '空', href: '/' } },
        categoryMap: {},
        menuItems: []
      };
      const stats = getConfigStats(emptyConfig);
      expect(stats.totalCategories).toBe(0);
      expect(stats.totalSites).toBe(0);
      expect(stats.categoriesWithSubmenus).toBe(0);
      expect(stats.singleCategories).toBe(0);
      expect(stats.tabsCategories).toBe(0);
    });
  });

  describe('getAllCategoryNames', () => {
    it('应该获取所有分类名称', () => {
      const names = getAllCategoryNames(mockConfig);
      expect(names).toContain('开发工具');
      expect(names).toContain('设计工具');
      expect(names).toContain('UI设计');
      expect(names).toContain('图标');
      expect(names).toHaveLength(4);
    });

    it('应该处理空配置', () => {
      const emptyConfig: SiteConfig = {
        site: { title: '空', description: '空', logo: { text: '空', href: '/' } },
        categoryMap: {},
        menuItems: []
      };
      const names = getAllCategoryNames(emptyConfig);
      expect(names).toHaveLength(0);
    });

    it('应该包含子菜单的名称', () => {
      const names = getAllCategoryNames(mockConfig);
      expect(names).toContain('UI设计');
      expect(names).toContain('图标');
    });
  });

  describe('isConfigEmpty', () => {
    it('应该识别空配置', () => {
      const emptyConfig: SiteConfig = {
        site: { title: '空', description: '空', logo: { text: '空', href: '/' } },
        categoryMap: {},
        menuItems: []
      };
      expect(isConfigEmpty(emptyConfig)).toBe(true);
    });

    it('应该识别非空配置', () => {
      expect(isConfigEmpty(mockConfig)).toBe(false);
    });

    it('应该处理缺少 menuItems 的配置', () => {
      const config = {
        site: { title: '测试', description: '测试', logo: { text: '测试', href: '/' } },
        categoryMap: {}
      } as SiteConfig;
      expect(isConfigEmpty(config)).toBe(true);
    });
  });

  describe('mergeConfigs', () => {
    it('应该合并配置', () => {
      const base: SiteConfig = {
        site: {
          title: '基础标题',
          description: '基础描述',
          logo: { text: '基础', href: '/' }
        },
        categoryMap: {},
        menuItems: [
          {
            name: '分类1',
            href: '/cat1',
            icon: 'icon1',
            type: 'single',
            sites: []
          }
        ]
      };

      const override: Partial<SiteConfig> = {
        site: {
          title: '新标题',
          description: '基础描述',
          logo: { text: '基础', href: '/' }
        }
      };

      const merged = mergeConfigs(base, override);
      expect(merged.site.title).toBe('新标题');
      expect(merged.site.description).toBe('基础描述');
      expect(merged.menuItems).toHaveLength(1);
    });

    it('应该覆盖 menuItems', () => {
      const base: SiteConfig = {
        site: { title: '标题', description: '描述', logo: { text: '标题', href: '/' } },
        categoryMap: {},
        menuItems: [
          {
            name: '分类1',
            href: '/cat1',
            icon: 'icon1',
            type: 'single',
            sites: []
          }
        ]
      };

      const override: Partial<SiteConfig> = {
        menuItems: [
          {
            name: '分类2',
            href: '/cat2',
            icon: 'icon2',
            type: 'single',
            sites: []
          }
        ]
      };

      const merged = mergeConfigs(base, override);
      expect(merged.menuItems).toHaveLength(1);
      expect(merged.menuItems[0].name).toBe('分类2');
    });

    it('应该合并 categoryMap', () => {
      const base: SiteConfig = {
        site: { title: '标题', description: '描述', logo: { text: '标题', href: '/' } },
        menuItems: [],
        categoryMap: {
          '分类1': 'cat1'
        }
      };

      const override: Partial<SiteConfig> = {
        categoryMap: {
          '分类2': 'cat2'
        }
      };

      const merged = mergeConfigs(base, override);
      expect(merged.categoryMap).toEqual({
        '分类1': 'cat1',
        '分类2': 'cat2'
      });
    });

    it('应该处理空的 override', () => {
      const base: SiteConfig = {
        site: { title: '标题', description: '描述', logo: { text: '标题', href: '/' } },
        categoryMap: {},
        menuItems: []
      };

      const merged = mergeConfigs(base, {});
      expect(merged).toEqual(base);
    });
  });
});
