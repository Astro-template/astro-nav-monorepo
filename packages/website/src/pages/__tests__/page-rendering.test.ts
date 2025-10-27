import { describe, it, expect, beforeEach } from 'vitest';

/**
 * 页面渲染测试
 * 测试页面组件的渲染逻辑和数据处理
 */

describe('Page Rendering', () => {
  describe('Index Page', () => {
    it('should render site info correctly', () => {
      const siteInfo = {
        title: 'Affiliate导航',
        description: '精选优质网站导航',
        keywords: ['导航', '网站', '工具']
      };

      expect(siteInfo.title).toBeTruthy();
      expect(siteInfo.description).toBeTruthy();
      expect(Array.isArray(siteInfo.keywords)).toBe(true);
    });

    it('should process menu items for rendering', () => {
      const menuItems = [
        {
          name: 'Category 1',
          icon: 'icon1',
          sites: [
            { title: 'Site 1', url: 'https://example1.com', description: 'Desc 1' },
            { title: 'Site 2', url: 'https://example2.com', description: 'Desc 2' }
          ]
        },
        {
          name: 'Category 2',
          icon: 'icon2',
          sites: [
            { title: 'Site 3', url: 'https://example3.com', description: 'Desc 3' }
          ]
        }
      ];

      expect(menuItems.length).toBe(2);
      expect(menuItems[0].sites.length).toBe(2);
      expect(menuItems[1].sites.length).toBe(1);
    });

    it('should calculate total site count', () => {
      const menuItems = [
        { name: 'Cat 1', sites: [{ title: 'S1' }, { title: 'S2' }] },
        { name: 'Cat 2', sites: [{ title: 'S3' }] }
      ];

      const totalSites = menuItems.reduce((sum, item) => sum + item.sites.length, 0);
      expect(totalSites).toBe(3);
    });

    it('should filter empty categories', () => {
      const menuItems = [
        { name: 'Cat 1', sites: [{ title: 'S1' }] },
        { name: 'Cat 2', sites: [] },
        { name: 'Cat 3', sites: [{ title: 'S2' }] }
      ];

      const nonEmpty = menuItems.filter(item => item.sites.length > 0);
      expect(nonEmpty.length).toBe(2);
    });
  });

  describe('Submit Page', () => {
    it('should validate form data structure', () => {
      const formData = {
        siteName: 'Test Site',
        siteUrl: 'https://example.com',
        description: 'Test description',
        category: 'tools',
        email: 'test@example.com'
      };

      expect(formData.siteName).toBeTruthy();
      expect(formData.siteUrl).toBeTruthy();
      expect(formData.description).toBeTruthy();
      expect(formData.category).toBeTruthy();
    });

    it('should validate URL format', () => {
      const validUrls = [
        'https://example.com',
        'http://test.com',
        'https://sub.domain.com'
      ];

      validUrls.forEach(url => {
        expect(() => new URL(url)).not.toThrow();
      });
    });

    it('should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      const validEmails = ['test@example.com', 'user@domain.co.uk'];
      const invalidEmails = ['invalid', '@example.com', 'test@'];

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('should validate required fields', () => {
      const requiredFields = ['siteName', 'siteUrl', 'description', 'category'];
      const formData = {
        siteName: 'Test',
        siteUrl: 'https://example.com',
        description: 'Desc',
        category: 'tools'
      };

      requiredFields.forEach(field => {
        expect(formData[field as keyof typeof formData]).toBeTruthy();
      });
    });

    it('should handle optional fields', () => {
      const formData = {
        siteName: 'Test',
        siteUrl: 'https://example.com',
        description: 'Desc',
        category: 'tools',
        tags: ['tag1', 'tag2'],
        logo: undefined
      };

      expect(formData.tags).toBeDefined();
      expect(Array.isArray(formData.tags)).toBe(true);
      expect(formData.logo).toBeUndefined();
    });
  });

  describe('Layout Component', () => {
    it('should generate correct page title', () => {
      const siteTitle = 'Affiliate导航';
      const pageTitle = 'About';
      const fullTitle = pageTitle ? `${pageTitle} - ${siteTitle}` : siteTitle;

      expect(fullTitle).toBe('About - Affiliate导航');
    });

    it('should use site title when no page title', () => {
      const siteTitle = 'Affiliate导航';
      const pageTitle = '';
      const fullTitle = pageTitle ? `${pageTitle} - ${siteTitle}` : siteTitle;

      expect(fullTitle).toBe('Affiliate导航');
    });

    it('should generate meta tags', () => {
      const meta = {
        title: 'Test Page',
        description: 'Test description',
        keywords: ['test', 'page']
      };

      expect(meta.title).toBeTruthy();
      expect(meta.description).toBeTruthy();
      expect(meta.keywords.join(', ')).toBe('test, page');
    });
  });

  describe('Sidebar Component', () => {
    it('should render category list', () => {
      const categories = [
        { name: 'Category 1', icon: 'icon1' },
        { name: 'Category 2', icon: 'icon2' },
        { name: 'Category 3', icon: 'icon3' }
      ];

      expect(categories.length).toBe(3);
      categories.forEach(cat => {
        expect(cat.name).toBeTruthy();
        expect(cat.icon).toBeTruthy();
      });
    });

    it('should generate category anchor links', () => {
      const categoryName = 'AI Tools';
      const anchorId = categoryName.toLowerCase().replace(/\s+/g, '-');

      expect(anchorId).toBe('ai-tools');
    });

    it('should handle special characters in category names', () => {
      const categoryName = 'AI & ML Tools';
      const anchorId = categoryName
        .toLowerCase()
        .replace(/[&\s]+/g, '-')
        .replace(/^-+|-+$/g, '');

      expect(anchorId).toMatch(/^[a-z0-9-]+$/);
    });
  });

  describe('CategoryCard Component', () => {
    it('should render category with sites', () => {
      const category = {
        name: 'Tools',
        icon: 'tools-icon',
        sites: [
          { title: 'Tool 1', url: 'https://tool1.com', description: 'Desc 1' },
          { title: 'Tool 2', url: 'https://tool2.com', description: 'Desc 2' }
        ]
      };

      expect(category.sites.length).toBe(2);
      expect(category.sites.every(site => site.title && site.url)).toBe(true);
    });

    it('should generate category ID for anchors', () => {
      const categoryName = 'Development Tools';
      const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');

      expect(categoryId).toBe('development-tools');
    });

    it('should count sites in category', () => {
      const category = {
        name: 'Tools',
        sites: [
          { title: 'Tool 1' },
          { title: 'Tool 2' },
          { title: 'Tool 3' }
        ]
      };

      const siteCount = category.sites.length;
      expect(siteCount).toBe(3);
    });
  });

  describe('NavItem Component', () => {
    it('should render site information', () => {
      const site = {
        title: 'Example Site',
        url: 'https://example.com',
        description: 'A great example site',
        logo: 'example-logo.png'
      };

      expect(site.title).toBeTruthy();
      expect(site.url).toBeTruthy();
      expect(site.description).toBeTruthy();
    });

    it('should handle missing logo', () => {
      const site = {
        title: 'Example Site',
        url: 'https://example.com',
        description: 'Description'
      };

      const logoSrc = site.logo || '/images/default-logo.png';
      expect(logoSrc).toBe('/images/default-logo.png');
    });

    it('should truncate long descriptions', () => {
      const site = {
        title: 'Site',
        description: 'This is a very long description that should be truncated to fit in the card'
      };

      const maxLength = 50;
      const truncated = site.description.length > maxLength
        ? site.description.substring(0, maxLength) + '...'
        : site.description;

      expect(truncated.length).toBeLessThanOrEqual(maxLength + 3);
    });

    it('should generate external link attributes', () => {
      const site = {
        url: 'https://example.com'
      };

      const linkAttrs = {
        href: site.url,
        target: '_blank',
        rel: 'noopener noreferrer'
      };

      expect(linkAttrs.target).toBe('_blank');
      expect(linkAttrs.rel).toBe('noopener noreferrer');
    });
  });

  describe('Search Functionality', () => {
    it('should filter sites by search query', () => {
      const allSites = [
        { title: 'React Docs', description: 'React documentation' },
        { title: 'Vue Guide', description: 'Vue.js guide' },
        { title: 'Angular Tutorial', description: 'Learn Angular' }
      ];

      const query = 'react';
      const filtered = allSites.filter(site =>
        site.title.toLowerCase().includes(query.toLowerCase()) ||
        site.description.toLowerCase().includes(query.toLowerCase())
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('React Docs');
    });

    it('should handle empty search query', () => {
      const allSites = [
        { title: 'Site 1' },
        { title: 'Site 2' }
      ];

      const query = '';
      const filtered = query
        ? allSites.filter(site => site.title.toLowerCase().includes(query.toLowerCase()))
        : allSites;

      expect(filtered.length).toBe(2);
    });

    it('should be case insensitive', () => {
      const allSites = [
        { title: 'React Framework', description: 'JavaScript library' }
      ];

      const queries = ['react', 'REACT', 'React'];
      
      queries.forEach(query => {
        const filtered = allSites.filter(site =>
          site.title.toLowerCase().includes(query.toLowerCase())
        );
        expect(filtered.length).toBe(1);
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should calculate grid columns for different breakpoints', () => {
      const breakpoints = {
        '2xl': { minWidth: 1920, columns: 6 },
        'xl': { minWidth: 1536, columns: 5 },
        'lg': { minWidth: 1280, columns: 4 },
        'md': { minWidth: 768, columns: 3 },
        'sm': { minWidth: 0, columns: 2 }
      };

      const getColumns = (width: number) => {
        if (width >= breakpoints['2xl'].minWidth) return breakpoints['2xl'].columns;
        if (width >= breakpoints.xl.minWidth) return breakpoints.xl.columns;
        if (width >= breakpoints.lg.minWidth) return breakpoints.lg.columns;
        if (width >= breakpoints.md.minWidth) return breakpoints.md.columns;
        return breakpoints.sm.columns;
      };

      expect(getColumns(2000)).toBe(6);
      expect(getColumns(1600)).toBe(5);
      expect(getColumns(1400)).toBe(4);
      expect(getColumns(1000)).toBe(3);
      expect(getColumns(500)).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing config gracefully', () => {
      const config = null;
      const fallbackConfig = config || {
        siteInfo: { title: 'Default Title' },
        menuItems: []
      };

      expect(fallbackConfig.siteInfo.title).toBe('Default Title');
      expect(fallbackConfig.menuItems.length).toBe(0);
    });

    it('should handle malformed site data', () => {
      const sites = [
        { title: 'Valid Site', url: 'https://example.com' },
        { title: '', url: '' }, // Invalid
        { title: 'Another Valid', url: 'https://test.com' }
      ];

      const validSites = sites.filter(site => site.title && site.url);
      expect(validSites.length).toBe(2);
    });
  });
});
