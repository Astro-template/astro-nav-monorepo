import { describe, it, expect } from 'vitest';
import {
  validateConfig,
  validateMenuItem,
  validateSubMenuItem,
  validateSite,
  validateUrl,
  validateSiteUrl
} from '../../../src/utils/validation';
import type { SiteConfig, MenuItem, Site } from '../../../src/types/config';

describe('validation', () => {
  describe('validateConfig', () => {
    it('应该验证有效的配置对象', () => {
      const validConfig: SiteConfig = {
        site: {
          title: '测试网站',
          description: '测试描述',
          logo: {
            text: '测试',
            href: '/'
          }
        },
        categoryMap: {},
        menuItems: []
      };

      expect(() => validateConfig(validConfig)).not.toThrow();
      expect(validateConfig(validConfig)).toBe(true);
    });

    it('应该拒绝非对象的配置', () => {
      expect(() => validateConfig(null)).toThrow('配置必须是一个对象');
      expect(() => validateConfig(undefined)).toThrow('配置必须是一个对象');
      expect(() => validateConfig('string')).toThrow('配置必须是一个对象');
    });

    it('应该拒绝缺少 site 字段的配置', () => {
      const invalidConfig = { menuItems: [] };
      expect(() => validateConfig(invalidConfig)).toThrow('配置缺少 site 字段');
    });

    it('应该拒绝缺少 site.title 的配置', () => {
      const invalidConfig = {
        site: { description: '描述' },
        menuItems: []
      };
      expect(() => validateConfig(invalidConfig)).toThrow('site.title 必须是字符串');
    });

    it('应该拒绝缺少 site.description 的配置', () => {
      const invalidConfig = {
        site: { title: '标题' },
        menuItems: []
      };
      expect(() => validateConfig(invalidConfig)).toThrow('site.description 必须是字符串');
    });

    it('应该拒绝 menuItems 不是数组的配置', () => {
      const invalidConfig = {
        site: { title: '标题', description: '描述' },
        menuItems: 'not-array'
      };
      expect(() => validateConfig(invalidConfig)).toThrow('menuItems 必须是数组');
    });

    it('应该验证包含有效菜单项的配置', () => {
      const validConfig: SiteConfig = {
        site: {
          title: '测试网站',
          description: '测试描述',
          logo: {
            text: '测试',
            href: '/'
          }
        },
        categoryMap: {},
        menuItems: [
          {
            name: '分类1',
            href: '/category1',
            icon: 'icon1',
            type: 'single',
            sites: [
              {
                title: '网站1',
                description: '描述1'
              }
            ]
          }
        ]
      };

      expect(() => validateConfig(validConfig)).not.toThrow();
    });
  });

  describe('validateMenuItem', () => {
    it('应该验证有效的 single 类型菜单项', () => {
      const validItem: MenuItem = {
        name: '分类',
        href: '/category',
        icon: 'icon',
        type: 'single',
        sites: [
          {
            title: '网站',
            description: '描述'
          }
        ]
      };

      expect(() => validateMenuItem(validItem)).not.toThrow();
      expect(validateMenuItem(validItem)).toBe(true);
    });

    it('应该验证有效的 tabs 类型菜单项', () => {
      const validItem: MenuItem = {
        name: '分类',
        href: '/category',
        icon: 'icon',
        type: 'tabs',
        submenu: [
          {
            name: '子分类',
            href: '/subcategory',
            icon: 'subicon',
            sites: [
              {
                title: '网站',
                description: '描述'
              }
            ]
          }
        ]
      };

      expect(() => validateMenuItem(validItem)).not.toThrow();
    });

    it('应该拒绝非对象的菜单项', () => {
      expect(() => validateMenuItem(null)).toThrow('必须是对象');
      expect(() => validateMenuItem('string', 0)).toThrow('菜单项 0 必须是对象');
    });

    it('应该拒绝缺少 name 的菜单项', () => {
      const invalidItem = {
        href: '/category',
        icon: 'icon',
        type: 'single',
        sites: []
      };
      expect(() => validateMenuItem(invalidItem)).toThrow('缺少 name 字段');
    });

    it('应该拒绝缺少 href 的菜单项', () => {
      const invalidItem = {
        name: '分类',
        icon: 'icon',
        type: 'single',
        sites: []
      };
      expect(() => validateMenuItem(invalidItem)).toThrow('缺少 href 字段');
    });

    it('应该拒绝缺少 icon 的菜单项', () => {
      const invalidItem = {
        name: '分类',
        href: '/category',
        type: 'single',
        sites: []
      };
      expect(() => validateMenuItem(invalidItem)).toThrow('缺少 icon 字段');
    });

    it('应该拒绝无效的 type', () => {
      const invalidItem = {
        name: '分类',
        href: '/category',
        icon: 'icon',
        type: 'invalid',
        sites: []
      };
      expect(() => validateMenuItem(invalidItem)).toThrow("type 必须是 'single' 或 'tabs'");
    });

    it('应该拒绝 single 类型但缺少 sites 的菜单项', () => {
      const invalidItem = {
        name: '分类',
        href: '/category',
        icon: 'icon',
        type: 'single'
      };
      expect(() => validateMenuItem(invalidItem)).toThrow('必须包含 sites 数组');
    });

    it('应该拒绝 tabs 类型但缺少 submenu 的菜单项', () => {
      const invalidItem = {
        name: '分类',
        href: '/category',
        icon: 'icon',
        type: 'tabs'
      };
      expect(() => validateMenuItem(invalidItem)).toThrow('必须包含 submenu 数组');
    });
  });

  describe('validateSubMenuItem', () => {
    it('应该验证有效的子菜单项', () => {
      const validSubItem = {
        name: '子分类',
        href: '/subcategory',
        icon: 'icon',
        sites: [
          {
            title: '网站',
            description: '描述'
          }
        ]
      };

      expect(() => validateSubMenuItem(validSubItem)).not.toThrow();
      expect(validateSubMenuItem(validSubItem)).toBe(true);
    });

    it('应该拒绝非对象的子菜单项', () => {
      expect(() => validateSubMenuItem(null)).toThrow('子菜单项 必须是对象');
    });

    it('应该拒绝缺少必需字段的子菜单项', () => {
      const invalidSubItem = {
        name: '子分类',
        href: '/subcategory'
      };
      expect(() => validateSubMenuItem(invalidSubItem)).toThrow('缺少 icon 字段');
    });

    it('应该拒绝缺少 sites 的子菜单项', () => {
      const invalidSubItem = {
        name: '子分类',
        href: '/subcategory',
        icon: 'icon'
      };
      expect(() => validateSubMenuItem(invalidSubItem)).toThrow('必须包含 sites 数组');
    });
  });

  describe('validateSite', () => {
    it('应该验证有效的网站对象', () => {
      const validSite: Site = {
        title: '网站标题',
        description: '网站描述'
      };

      expect(() => validateSite(validSite)).not.toThrow();
      expect(validateSite(validSite)).toBe(true);
    });

    it('应该验证包含可选字段的网站对象', () => {
      const validSite: Site = {
        title: '网站标题',
        description: '网站描述',
        url: 'https://example.com',
        logo: '/logo.png',
        advantages: ['优势1', '优势2'],
        features: ['特性1', '特性2']
      };

      expect(() => validateSite(validSite)).not.toThrow();
    });

    it('应该拒绝非对象的网站', () => {
      expect(() => validateSite(null)).toThrow('网站 必须是对象');
      expect(() => validateSite('string', '网站1')).toThrow('网站1 必须是对象');
    });

    it('应该拒绝缺少 title 的网站', () => {
      const invalidSite = {
        description: '描述'
      };
      expect(() => validateSite(invalidSite)).toThrow('缺少 title 字段');
    });

    it('应该拒绝缺少 description 的网站', () => {
      const invalidSite = {
        title: '标题'
      };
      expect(() => validateSite(invalidSite)).toThrow('缺少 description 字段');
    });

    it('应该拒绝无效类型的可选字段', () => {
      const invalidSite = {
        title: '标题',
        description: '描述',
        url: 123
      };
      expect(() => validateSite(invalidSite)).toThrow('url 必须是字符串');
    });

    it('应该拒绝 advantages 不是数组', () => {
      const invalidSite = {
        title: '标题',
        description: '描述',
        advantages: 'not-array'
      };
      expect(() => validateSite(invalidSite)).toThrow('advantages 必须是数组');
    });
  });

  describe('validateUrl', () => {
    it('应该验证有效的 HTTP URL', () => {
      expect(validateUrl('http://example.com')).toBe(true);
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('https://example.com/path')).toBe(true);
      expect(validateUrl('https://example.com:8080/path?query=1')).toBe(true);
    });

    it('应该拒绝无效的 URL', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('example.com')).toBe(false);
      expect(validateUrl('')).toBe(false);
      expect(validateUrl('//example.com')).toBe(false);
    });
  });

  describe('validateSiteUrl', () => {
    it('应该验证绝对 URL', () => {
      expect(validateSiteUrl('http://example.com')).toBe(true);
      expect(validateSiteUrl('https://example.com')).toBe(true);
    });

    it('应该验证相对路径', () => {
      expect(validateSiteUrl('/path/to/page')).toBe(true);
      expect(validateSiteUrl('/page')).toBe(true);
    });

    it('应该验证锚点链接', () => {
      expect(validateSiteUrl('#section')).toBe(true);
    });

    it('应该拒绝空字符串', () => {
      expect(validateSiteUrl('')).toBe(false);
    });

    it('应该拒绝无效的 URL', () => {
      expect(validateSiteUrl('not-a-url')).toBe(false);
      expect(validateSiteUrl('example.com')).toBe(false);
    });
  });
});
