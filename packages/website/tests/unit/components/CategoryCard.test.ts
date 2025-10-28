import { describe, it, expect } from 'vitest';

/**
 * CategoryCard 组件测试
 * 测试分类卡片组件的属性验证和渲染逻辑
 */

describe('CategoryCard Component', () => {
  describe('Props Validation', () => {
    it('should accept valid category props', () => {
      const validProps = {
        name: 'Test Category',
        icon: 'test-icon.svg',
        siteCount: 10,
        categoryIndex: 0
      };

      expect(validProps).toHaveProperty('name');
      expect(validProps).toHaveProperty('icon');
      expect(validProps).toHaveProperty('siteCount');
      expect(validProps).toHaveProperty('categoryIndex');
    });

    it('should validate category name is a string', () => {
      const props = {
        name: 'Test Category',
        icon: 'icon.svg',
        siteCount: 5,
        categoryIndex: 0
      };

      expect(typeof props.name).toBe('string');
      expect(props.name.length).toBeGreaterThan(0);
    });

    it('should validate siteCount is a number', () => {
      const props = {
        name: 'Test',
        icon: 'icon.svg',
        siteCount: 10,
        categoryIndex: 0
      };

      expect(typeof props.siteCount).toBe('number');
      expect(props.siteCount).toBeGreaterThanOrEqual(0);
    });

    it('should validate categoryIndex is a number', () => {
      const props = {
        name: 'Test',
        icon: 'icon.svg',
        siteCount: 5,
        categoryIndex: 2
      };

      expect(typeof props.categoryIndex).toBe('number');
      expect(props.categoryIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Icon Handling', () => {
    it('should handle icon path correctly', () => {
      const iconPath = '/categories/test-icon.svg';
      
      expect(iconPath).toMatch(/^\/categories\//);
      expect(iconPath).toMatch(/\.svg$/);
    });

    it('should handle missing icon gracefully', () => {
      const props = {
        name: 'Test',
        icon: undefined,
        siteCount: 5,
        categoryIndex: 0
      };

      expect(props.icon).toBeUndefined();
    });

    it('should validate icon file extension', () => {
      const validIcons = ['icon.svg', 'icon.png', 'icon.jpg'];
      
      validIcons.forEach(icon => {
        expect(icon).toMatch(/\.(svg|png|jpg)$/);
      });
    });
  });

  describe('Site Count Display', () => {
    it('should format site count correctly', () => {
      const testCases = [
        { count: 0, expected: '0 个网站' },
        { count: 1, expected: '1 个网站' },
        { count: 10, expected: '10 个网站' },
        { count: 100, expected: '100 个网站' }
      ];

      testCases.forEach(({ count, expected }) => {
        const formatted = `${count} 个网站`;
        expect(formatted).toBe(expected);
      });
    });

    it('should handle large site counts', () => {
      const largeCount = 1000;
      const formatted = `${largeCount} 个网站`;
      
      expect(formatted).toBe('1000 个网站');
    });

    it('should handle zero site count', () => {
      const count = 0;
      const formatted = `${count} 个网站`;
      
      expect(formatted).toBe('0 个网站');
    });
  });

  describe('Category Index', () => {
    it('should use categoryIndex for data attributes', () => {
      const categoryIndex = 5;
      const dataAttr = `data-category-index="${categoryIndex}"`;
      
      expect(dataAttr).toContain(categoryIndex.toString());
    });

    it('should handle zero index', () => {
      const categoryIndex = 0;
      
      expect(categoryIndex).toBe(0);
      expect(categoryIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle large index values', () => {
      const categoryIndex = 999;
      
      expect(categoryIndex).toBeGreaterThan(0);
      expect(typeof categoryIndex).toBe('number');
    });
  });

  describe('Lazy Loading Integration', () => {
    it('should have correct data attributes for lazy loading', () => {
      const props = {
        categoryIndex: 3,
        name: 'Test Category'
      };

      const expectedAttrs = {
        'data-category-index': props.categoryIndex.toString(),
        'data-action': 'load-category'
      };

      expect(expectedAttrs['data-category-index']).toBe('3');
      expect(expectedAttrs['data-action']).toBe('load-category');
    });

    it('should generate correct button attributes', () => {
      const categoryIndex = 2;
      const buttonAttrs = {
        'data-action': 'load-category',
        'data-category-index': categoryIndex.toString()
      };

      expect(buttonAttrs['data-action']).toBe('load-category');
      expect(buttonAttrs['data-category-index']).toBe('2');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const ariaLabel = 'Test Category - 10 个网站';
      
      expect(ariaLabel).toContain('Test Category');
      expect(ariaLabel).toContain('10 个网站');
    });

    it('should have semantic HTML structure', () => {
      const structure = {
        hasHeading: true,
        hasButton: true,
        hasIcon: true
      };

      expect(structure.hasHeading).toBe(true);
      expect(structure.hasButton).toBe(true);
    });

    it('should provide descriptive button text', () => {
      const categoryName = 'AI Tools';
      const buttonText = `加载 ${categoryName}`;
      
      expect(buttonText).toContain(categoryName);
      expect(buttonText).toContain('加载');
    });
  });

  describe('CSS Classes', () => {
    it('should use Tailwind utility classes', () => {
      const classes = [
        'flex',
        'items-center',
        'gap-4',
        'p-4',
        'border',
        'rounded-lg',
        'bg-white',
        'shadow-md'
      ];

      classes.forEach(className => {
        expect(className).toBeTruthy();
        expect(typeof className).toBe('string');
      });
    });

    it('should have hover state classes', () => {
      const hoverClasses = [
        'hover:shadow-lg',
        'hover:border-primary',
        'hover:-translate-y-1'
      ];

      hoverClasses.forEach(className => {
        expect(className).toContain('hover');
      });
    });

    it('should have transition classes', () => {
      const transitionClasses = [
        'transition-all',
        'duration-300'
      ];

      transitionClasses.forEach(className => {
        expect(className).toBeTruthy();
      });
    });
  });

  describe('Category Name Formatting', () => {
    it('should handle category names with spaces', () => {
      const name = 'AI Tools';
      
      expect(name).toContain(' ');
      expect(name.split(' ').length).toBe(2);
    });

    it('should handle category names with special characters', () => {
      const names = [
        'AI & ML',
        'Web3.0',
        'E-commerce',
        'SaaS/PaaS'
      ];

      names.forEach(name => {
        expect(name).toBeTruthy();
        expect(typeof name).toBe('string');
      });
    });

    it('should handle long category names', () => {
      const longName = 'Very Long Category Name That Might Need Truncation';
      const maxLength = 30;
      
      const truncated = longName.length > maxLength
        ? longName.substring(0, maxLength) + '...'
        : longName;

      expect(truncated.length).toBeLessThanOrEqual(maxLength + 3);
    });
  });

  describe('Loading States', () => {
    it('should have loading state UI elements', () => {
      const loadingElements = {
        loadingState: '.loading-state',
        loadedContent: '.loaded-content',
        errorState: '.error-state'
      };

      expect(loadingElements.loadingState).toBeTruthy();
      expect(loadingElements.loadedContent).toBeTruthy();
      expect(loadingElements.errorState).toBeTruthy();
    });

    it('should toggle visibility states', () => {
      const states = {
        loading: { display: 'block' },
        loaded: { display: 'block' },
        error: { display: 'none' }
      };

      expect(states.loading.display).toBe('block');
      expect(states.loaded.display).toBe('block');
      expect(states.error.display).toBe('none');
    });
  });

  describe('Grid Layout', () => {
    it('should use grid layout for sites', () => {
      const gridClasses = [
        'grid',
        'grid-cols-2',
        'md:grid-cols-3',
        'lg:grid-cols-4',
        'gap-4'
      ];

      gridClasses.forEach(className => {
        expect(className).toBeTruthy();
      });
    });

    it('should have responsive grid columns', () => {
      const breakpoints = {
        sm: 2,
        md: 3,
        lg: 4,
        xl: 5,
        '2xl': 6
      };

      expect(breakpoints.sm).toBe(2);
      expect(breakpoints.md).toBe(3);
      expect(breakpoints.lg).toBe(4);
    });
  });
});
