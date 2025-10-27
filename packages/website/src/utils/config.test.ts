import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getConfig } from './config';

// Mock the config.json import
vi.mock('../../static/config.json', () => ({
  default: {
    siteInfo: {
      title: 'Test Navigation',
      description: 'Test Description',
      keywords: ['test', 'navigation']
    },
    menuItems: [
      {
        name: 'Category 1',
        icon: 'icon1',
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
  }
}));

describe('config utils', () => {
  describe('getConfig', () => {
    it('should return the configuration object', () => {
      const config = getConfig();
      
      expect(config).toBeDefined();
      expect(config.siteInfo).toBeDefined();
      expect(config.menuItems).toBeDefined();
    });

    it('should return site info with correct structure', () => {
      const config = getConfig();
      
      expect(config.siteInfo).toHaveProperty('title');
      expect(config.siteInfo).toHaveProperty('description');
      expect(config.siteInfo.title).toBe('Test Navigation');
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
      expect(firstItem).toHaveProperty('sites');
      expect(Array.isArray(firstItem.sites)).toBe(true);
    });

    it('should have valid site structure in menu items', () => {
      const config = getConfig();
      const firstSite = config.menuItems[0].sites[0];
      
      expect(firstSite).toHaveProperty('title');
      expect(firstSite).toHaveProperty('url');
      expect(firstSite).toHaveProperty('description');
    });
  });
});
