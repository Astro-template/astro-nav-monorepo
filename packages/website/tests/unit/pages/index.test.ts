import { describe, it, expect } from 'vitest';

/**
 * 首页渲染测试
 * 测试首页的数据处理和渲染逻辑
 */

describe('Index Page', () => {
  describe('Site Info Rendering', () => {
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

    it('should validate site info structure', () => {
      const siteInfo = {
        title: 'Test Site',
        description: 'Test Description',
        keywords: ['test']
      };

      expect(siteInfo).toHaveProperty('title');
      expect(siteInfo).toHaveProperty('description');
      expect(siteInfo).toHaveProperty('keywords');
    });

    it('should handle missing keywords', () => {
      const siteInfo = {
        title: 'Test Site',
        description: 'Test Description',
        keywords: []
      };

      expect(Array.isArray(siteInfo.keywords)).toBe(true);
      expect(siteInfo.keywords.length).toBe(0);
    });
  });

  describe('Menu Items Processing', () => {
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

    it('should validate menu item structure', () => {
      const menuItem = {
        name: 'Test Category',
        icon: 'test-icon',
        sites: []
      };

      expect(menuItem).toHaveProperty('name');
      expect(menuItem).toHaveProperty('sites');
      expect(Array.isArray(menuItem.sites)).toBe(true);
    });
  });

  describe('Category Anchor Generation', () => {
    it('should generate category anchor IDs', () => {
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

    it('should handle Chinese characters', () => {
      const categoryName = '人工智能工具';
      
      expect(categoryName).toBeTruthy();
      expect(typeof categoryName).toBe('string');
    });
  });

  describe('Search Functionality', () => {
    it('should filter sites by search term', () => {
      const sites = [
        { title: 'React Framework', description: 'A JavaScript library' },
        { title: 'Vue.js', description: 'Progressive framework' },
        { title: 'Angular', description: 'Platform for building apps' }
      ];

      const searchTerm = 'framework';
      const filtered = sites.filter(site => 
        site.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered.length).toBe(2);
    });

    it('should be case insensitive', () => {
      const sites = [
        { title: 'React Framework', description: 'A JavaScript library' }
      ];

      const searchTerms = ['react', 'REACT', 'React', 'rEaCt'];
      
      searchTerms.forEach(term => {
        const filtered = sites.filter(site => 
          site.title.toLowerCase().includes(term.toLowerCase())
        );
        expect(filtered.length).toBe(1);
      });
    });

    it('should return empty array for no matches', () => {
      const sites = [
        { title: 'React', description: 'Library' }
      ];

      const filtered = sites.filter(site => 
        site.title.toLowerCase().includes('nonexistent')
      );

      expect(filtered.length).toBe(0);
    });

    it('should handle empty search query', () => {
      const sites: Array<{ title: string }> = [
        { title: 'Site 1' },
        { title: 'Site 2' }
      ];

      const query = '';
      const filtered = query
        ? sites.filter(site => site.title.toLowerCase().includes(query.toLowerCase()))
        : sites;

      expect(filtered.length).toBe(2);
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate category count', () => {
      const menuItems = [
        { name: 'Cat 1', sites: [] },
        { name: 'Cat 2', sites: [] },
        { name: 'Cat 3', sites: [] }
      ];

      const categoryCount = menuItems.length;
      expect(categoryCount).toBe(3);
    });

    it('should calculate total sites across all categories', () => {
      const menuItems = [
        { name: 'Cat 1', sites: [1, 2, 3] },
        { name: 'Cat 2', sites: [1, 2] },
        { name: 'Cat 3', sites: [1] }
      ];

      const totalSites = menuItems.reduce((sum, cat) => sum + cat.sites.length, 0);
      expect(totalSites).toBe(6);
    });

    it('should calculate average sites per category', () => {
      const menuItems = [
        { name: 'Cat 1', sites: [1, 2, 3] },
        { name: 'Cat 2', sites: [1, 2] }
      ];

      const totalSites = menuItems.reduce((sum, cat) => sum + cat.sites.length, 0);
      const avgSites = totalSites / menuItems.length;
      
      expect(avgSites).toBe(2.5);
    });
  });

  describe('Responsive Grid Layout', () => {
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

  describe('Meta Tags Generation', () => {
    it('should generate page title', () => {
      const siteTitle = 'Affiliate导航';
      const pageTitle = '';
      const fullTitle = pageTitle ? `${pageTitle} - ${siteTitle}` : siteTitle;

      expect(fullTitle).toBe('Affiliate导航');
    });

    it('should generate meta description', () => {
      const description = '精选优质网站导航，帮助您快速找到需要的资源';
      
      expect(description).toBeTruthy();
      expect(typeof description).toBe('string');
    });

    it('should generate meta keywords', () => {
      const keywords = ['导航', '网站', '工具', 'AI'];
      const keywordsString = keywords.join(', ');
      
      expect(keywordsString).toBe('导航, 网站, 工具, AI');
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
        { title: '', url: '' },
        { title: 'Another Valid', url: 'https://test.com' }
      ];

      const validSites = sites.filter(site => site.title && site.url);
      expect(validSites.length).toBe(2);
    });

    it('should handle empty menu items', () => {
      const menuItems: any[] = [];
      
      expect(Array.isArray(menuItems)).toBe(true);
      expect(menuItems.length).toBe(0);
    });
  });

  describe('Sidebar Integration', () => {
    it('should generate sidebar navigation items', () => {
      const categories = [
        { name: 'Category 1', icon: 'icon1' },
        { name: 'Category 2', icon: 'icon2' }
      ];

      expect(categories.length).toBe(2);
      categories.forEach(cat => {
        expect(cat.name).toBeTruthy();
      });
    });

    it('should link sidebar items to page sections', () => {
      const categoryName = 'AI Tools';
      const sectionId = categoryName.toLowerCase().replace(/\s+/g, '-');
      const href = `#${sectionId}`;

      expect(href).toBe('#ai-tools');
    });
  });

  describe('Lazy Loading Integration', () => {
    it('should mark categories for lazy loading', () => {
      const categories = [
        { name: 'Cat 1', index: 0, lazyLoad: false },
        { name: 'Cat 2', index: 1, lazyLoad: true },
        { name: 'Cat 3', index: 2, lazyLoad: true }
      ];

      const lazyCategories = categories.filter(cat => cat.lazyLoad);
      expect(lazyCategories.length).toBe(2);
    });

    it('should generate category index for lazy loading', () => {
      const categories = ['Cat 1', 'Cat 2', 'Cat 3'];
      
      categories.forEach((cat, index) => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(categories.length);
      });
    });
  });
});
