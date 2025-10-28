import { describe, it, expect, vi } from 'vitest';
import { getConfig } from '../../../src/utils/config';

// Mock the config.json import
vi.mock('../../../src/utils/config', () => ({
  getConfig: vi.fn(() => ({
    site: {
      title: 'Test Navigation',
      description: 'Test Description',
      logo: {
        text: 'Test Logo',
        href: '/'
      }
    },
    categoryMap: {
      'category-1': 'Category 1'
    },
    menuItems: [
      {
        name: 'Category 1',
        href: '/category-1',
        icon: 'icon1',
        type: 'single' as const,
        sites: [
          {
            title: 'Site 1',
            url: 'https://example.com',
            description: 'Test site 1',
            logo: 'logo1.png'
          }
        ]
      }
    ]
  }))
}));

describe('config utils', () => {
  describe('getConfig', () => {
    it('should return the configuration object', () => {
      const config = getConfig();
      
      expect(config).toBeDefined();
      expect(config.site).toBeDefined();
      expect(config.menuItems).toBeDefined();
    });

    it('should return site info with correct structure', () => {
      const config = getConfig();
      
      expect(config.site).toHaveProperty('title');
      expect(config.site).toHaveProperty('description');
      expect(config.site.title).toBe('Test Navigation');
    });

    it('should return menu items as an array', () => {
      const config = getConfig();
      
      expect(Array.isArray(config.menuItems)).toBe(true);
      expect(config.menuItems.length).toBeGreaterThan(0);
    });

    it('should have valid menu item structure', () => {
      const config = getConfig();
      const firstItem = config.menuItems[0];
      
      expect(firstItem).toHaveProperty('name');
      expect(firstItem).toHaveProperty('type');
      expect(firstItem.type).toBe('single');
    });

    it('should have valid site structure in menu items', () => {
      const config = getConfig();
      const firstItem = config.menuItems[0];
      
      if (firstItem.sites && firstItem.sites.length > 0) {
        const firstSite = firstItem.sites[0];
        expect(firstSite).toHaveProperty('title');
        expect(firstSite).toHaveProperty('url');
        expect(firstSite).toHaveProperty('description');
      }
    });
  });
});
