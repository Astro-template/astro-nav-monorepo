import { describe, it, expect } from 'vitest';

/**
 * 组件辅助函数测试
 * 测试组件中使用的工具函数和逻辑
 */

describe('Component Helpers', () => {
  describe('URL Validation', () => {
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://test.com',
        'https://sub.domain.com/path',
        'https://example.com:8080'
      ];

      validUrls.forEach(url => {
        expect(() => new URL(url)).not.toThrow();
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'just some text',
        '//invalid'
      ];

      invalidUrls.forEach(url => {
        expect(() => new URL(url)).toThrow();
      });
    });
  });

  describe('Text Truncation', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long description that should be truncated';
      const maxLength = 30;
      
      const truncated = longText.length > maxLength 
        ? longText.substring(0, maxLength) + '...'
        : longText;

      expect(truncated.length).toBeLessThanOrEqual(maxLength + 3);
      expect(truncated).toContain('...');
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      const maxLength = 30;
      
      const result = shortText.length > maxLength 
        ? shortText.substring(0, maxLength) + '...'
        : shortText;

      expect(result).toBe(shortText);
      expect(result).not.toContain('...');
    });
  });

  describe('CSS Class Generation', () => {
    it('should generate conditional classes', () => {
      const isActive = true;
      const isLoading = false;
      
      const classes = [
        'base-class',
        isActive && 'active',
        isLoading && 'loading'
      ].filter(Boolean).join(' ');

      expect(classes).toBe('base-class active');
      expect(classes).not.toContain('loading');
    });

    it('should handle empty class list', () => {
      const classes = [
        false && 'class1',
        false && 'class2'
      ].filter(Boolean).join(' ');

      expect(classes).toBe('');
    });
  });

  describe('Icon Path Generation', () => {
    it('should generate correct icon paths', () => {
      const iconName = 'test-icon';
      const iconPath = `/icons/${iconName}.svg`;

      expect(iconPath).toBe('/icons/test-icon.svg');
      expect(iconPath).toMatch(/\.svg$/);
    });

    it('should handle icon names with special characters', () => {
      const iconName = 'icon-with-dash';
      const iconPath = `/icons/${iconName}.svg`;

      expect(iconPath).toBe('/icons/icon-with-dash.svg');
    });
  });

  describe('Site Data Validation', () => {
    it('should validate complete site data', () => {
      const site = {
        title: 'Test Site',
        url: 'https://example.com',
        description: 'Test description',
        logo: 'logo.png'
      };

      expect(site.title).toBeTruthy();
      expect(site.url).toBeTruthy();
      expect(site.description).toBeTruthy();
      expect(() => new URL(site.url)).not.toThrow();
    });

    it('should handle missing optional fields', () => {
      const site = {
        title: 'Test Site',
        url: 'https://example.com',
        description: 'Test description'
        // logo is optional
      };

      expect(site.title).toBeTruthy();
      expect(site.url).toBeTruthy();
      expect(site).not.toHaveProperty('logo');
    });
  });

  describe('Category Data Validation', () => {
    it('should validate category structure', () => {
      const category = {
        name: 'Test Category',
        icon: 'category-icon',
        sites: [
          {
            title: 'Site 1',
            url: 'https://example1.com',
            description: 'Description 1'
          }
        ]
      };

      expect(category.name).toBeTruthy();
      expect(Array.isArray(category.sites)).toBe(true);
      expect(category.sites.length).toBeGreaterThan(0);
    });

    it('should handle empty site list', () => {
      const category = {
        name: 'Empty Category',
        icon: 'icon',
        sites: []
      };

      expect(Array.isArray(category.sites)).toBe(true);
      expect(category.sites.length).toBe(0);
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
      expect(filtered[0].title).toBe('React Framework');
      expect(filtered[1].title).toBe('Vue.js');
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
  });

  describe('Responsive Grid Calculation', () => {
    it('should calculate grid columns based on screen width', () => {
      const getGridColumns = (width: number) => {
        if (width >= 1920) return 6;
        if (width >= 1536) return 5;
        if (width >= 1280) return 4;
        if (width >= 768) return 3;
        return 2;
      };

      expect(getGridColumns(2000)).toBe(6);
      expect(getGridColumns(1600)).toBe(5);
      expect(getGridColumns(1400)).toBe(4);
      expect(getGridColumns(1000)).toBe(3);
      expect(getGridColumns(500)).toBe(2);
    });
  });

  describe('Image Loading', () => {
    it('should generate correct image src', () => {
      const logo = 'test-logo.png';
      const src = logo.startsWith('http') ? logo : `/logos/${logo}`;

      expect(src).toBe('/logos/test-logo.png');
    });

    it('should handle external URLs', () => {
      const logo = 'https://example.com/logo.png';
      const src = logo.startsWith('http') ? logo : `/logos/${logo}`;

      expect(src).toBe('https://example.com/logo.png');
    });

    it('should provide fallback for missing logos', () => {
      const logo = undefined;
      const src = logo || '/images/default-logo.png';

      expect(src).toBe('/images/default-logo.png');
    });
  });
});
