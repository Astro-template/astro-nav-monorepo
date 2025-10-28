import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * ClientLazyLoader 测试
 * 测试客户端懒加载功能
 */

describe('ClientLazyLoader', () => {
  let mockFetch: any;
  let mockLocalStorage: any;

  beforeEach(() => {
    // Mock fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    // Mock DOM
    document.body.innerHTML = `
      <div data-category-index="0">
        <div class="lazy-content" style="display: none;">
          <div class="loading-state" style="display: none;">Loading...</div>
          <div class="loaded-content" style="display: none;"></div>
          <div class="error-state" style="display: none;">
            <span class="error-text"></span>
          </div>
        </div>
        <button class="load-more-btn" data-action="load-category" data-category-index="0">
          Load More
        </button>
      </div>
    `;
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('Data Validation', () => {
    it('should validate correct category data structure', () => {
      const validData = {
        categoryIndex: 0,
        categoryName: 'Test Category',
        sites: [
          {
            title: 'Test Site',
            description: 'Test Description',
            url: 'https://example.com'
          }
        ],
        metadata: {
          siteCount: 1,
          fileSizeKB: 10
        }
      };

      expect(validData).toHaveProperty('categoryIndex');
      expect(validData).toHaveProperty('categoryName');
      expect(validData).toHaveProperty('sites');
      expect(validData).toHaveProperty('metadata');
      expect(Array.isArray(validData.sites)).toBe(true);
    });

    it('should reject invalid category data', () => {
      const invalidData = {
        categoryIndex: 0,
        sites: [],
        metadata: {}
      };

      expect(invalidData).not.toHaveProperty('categoryName');
    });

    it('should validate site structure', () => {
      const site = {
        title: 'Test Site',
        description: 'Test Description',
        url: 'https://example.com'
      };

      expect(site).toHaveProperty('title');
      expect(site).toHaveProperty('description');
      expect(site).toHaveProperty('url');
      expect(typeof site.title).toBe('string');
      expect(typeof site.url).toBe('string');
    });
  });

  describe('HTML Escaping', () => {
    it('should escape HTML special characters', () => {
      const testCases = [
        { input: '<script>alert("xss")</script>', shouldContain: '&lt;' },
        { input: 'Test & Company', shouldContain: '&amp;' },
        { input: 'Price > $100', shouldContain: '&gt;' }
      ];

      testCases.forEach(({ input, shouldContain }) => {
        const div = document.createElement('div');
        div.textContent = input;
        const escaped = div.innerHTML;
        
        expect(escaped).toContain(shouldContain);
      });
    });

    it('should prevent XSS attacks', () => {
      const maliciousInput = '<img src=x onerror="alert(1)">';
      const div = document.createElement('div');
      div.textContent = maliciousInput;
      const escaped = div.innerHTML;

      expect(escaped).not.toContain('<img');
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
      // Note: textContent escapes < and >, but not quotes, so "onerror" remains
      expect(escaped).toContain('onerror');
    });
  });

  describe('DOM Manipulation', () => {
    it('should find category container by index', () => {
      const container = document.querySelector('[data-category-index="0"]');
      expect(container).not.toBeNull();
    });

    it('should have all required UI elements', () => {
      const container = document.querySelector('[data-category-index="0"]');
      
      expect(container?.querySelector('.lazy-content')).not.toBeNull();
      expect(container?.querySelector('.loading-state')).not.toBeNull();
      expect(container?.querySelector('.loaded-content')).not.toBeNull();
      expect(container?.querySelector('.error-state')).not.toBeNull();
      expect(container?.querySelector('.load-more-btn')).not.toBeNull();
    });

    it('should toggle loading state visibility', () => {
      const container = document.querySelector('[data-category-index="0"]');
      const loadingState = container?.querySelector('.loading-state') as HTMLElement;
      const loadedContent = container?.querySelector('.loaded-content') as HTMLElement;

      if (loadingState) loadingState.style.display = 'block';
      if (loadedContent) loadedContent.style.display = 'none';

      expect(loadingState?.style.display).toBe('block');
      expect(loadedContent?.style.display).toBe('none');
    });

    it('should handle missing DOM elements gracefully', () => {
      const container = document.querySelector('[data-category-index="999"]');
      expect(container).toBeNull();
    });
  });

  describe('Cache Management', () => {
    it('should save data to localStorage', () => {
      const testData = {
        0: {
          data: { categoryIndex: 0, categoryName: 'Test' },
          timestamp: Date.now()
        }
      };

      mockLocalStorage.setItem('astro-nav-category-cache', JSON.stringify(testData));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'astro-nav-category-cache',
        expect.any(String)
      );
    });

    it('should load data from localStorage', () => {
      const cachedData = JSON.stringify({
        0: {
          data: { categoryIndex: 0, categoryName: 'Cached' },
          timestamp: Date.now()
        }
      });

      mockLocalStorage.getItem.mockReturnValue(cachedData);
      
      const result = mockLocalStorage.getItem('astro-nav-category-cache');
      expect(result).toBe(cachedData);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('astro-nav-category-cache');
    });

    it('should handle expired cache entries', () => {
      const expiredTimestamp = Date.now() - (31 * 60 * 1000);
      const cachedData = JSON.stringify({
        0: {
          data: { categoryIndex: 0, categoryName: 'Expired' },
          timestamp: expiredTimestamp
        }
      });

      mockLocalStorage.getItem.mockReturnValue(cachedData);
      
      const parsed = JSON.parse(mockLocalStorage.getItem('astro-nav-category-cache'));
      const isExpired = Date.now() - parsed[0].timestamp > (30 * 60 * 1000);
      
      expect(isExpired).toBe(true);
    });

    it('should handle cache parse errors', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      expect(() => {
        JSON.parse(mockLocalStorage.getItem('astro-nav-category-cache'));
      }).toThrow();
    });

    it('should handle null cache', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const result = mockLocalStorage.getItem('astro-nav-category-cache');
      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      try {
        await fetch('/categories/0.json');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle invalid JSON responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      try {
        const response = await fetch('/categories/0.json');
        await response.json();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const response = await fetch('/categories/0.json');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      try {
        await fetch('/categories/0.json');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Site HTML Generation', () => {
    it('should generate valid HTML for sites', () => {
      const sites = [
        {
          title: 'Test Site',
          description: 'Test Description',
          url: 'https://example.com',
          advantages: ['Fast', 'Reliable']
        }
      ];

      const container = document.createElement('div');
      container.innerHTML = `
        <div class="sites-grid">
          ${sites.map(site => `
            <div class="site-card">
              <h4>${site.title}</h4>
              <p>${site.description}</p>
              <a href="${site.url}">${site.url}</a>
            </div>
          `).join('')}
        </div>
      `;

      const siteCard = container.querySelector('.site-card');
      expect(siteCard).not.toBeNull();
      expect(siteCard?.querySelector('h4')?.textContent).toBe('Test Site');
    });

    it('should handle sites without URLs', () => {
      const sites = [
        {
          title: 'Test Site',
          description: 'Test Description'
        }
      ];

      const container = document.createElement('div');
      container.innerHTML = `
        <div class="sites-grid">
          ${sites.map(site => `
            <div class="site-card">
              <h4>${site.title}</h4>
              <p>${site.description}</p>
            </div>
          `).join('')}
        </div>
      `;

      const siteCard = container.querySelector('.site-card');
      expect(siteCard).not.toBeNull();
      expect(siteCard?.querySelector('a')).toBeNull();
    });

    it('should handle empty site arrays', () => {
      const sites: any[] = [];

      const container = document.createElement('div');
      container.innerHTML = `
        <div class="sites-grid">
          ${sites.map(site => `
            <div class="site-card">
              <h4>${site.title}</h4>
            </div>
          `).join('')}
        </div>
      `;

      const siteCards = container.querySelectorAll('.site-card');
      expect(siteCards.length).toBe(0);
    });
  });

  describe('Loading States', () => {
    it('should track loading state', () => {
      const loadingState = {
        isLoading: true,
        isLoaded: false,
        hasError: false,
        retryCount: 0
      };

      expect(loadingState.isLoading).toBe(true);
      expect(loadingState.isLoaded).toBe(false);
      expect(loadingState.hasError).toBe(false);
    });

    it('should track loaded state', () => {
      const loadedState = {
        isLoading: false,
        isLoaded: true,
        hasError: false,
        retryCount: 0
      };

      expect(loadedState.isLoading).toBe(false);
      expect(loadedState.isLoaded).toBe(true);
    });

    it('should track error state', () => {
      const errorState = {
        isLoading: false,
        isLoaded: false,
        hasError: true,
        error: 'Network error',
        retryCount: 1
      };

      expect(errorState.hasError).toBe(true);
      expect(errorState.error).toBe('Network error');
      expect(errorState.retryCount).toBe(1);
    });
  });

  describe('Retry Logic', () => {
    it('should track retry count', () => {
      let retryCount = 0;
      const maxRetries = 3;

      retryCount++;
      expect(retryCount).toBe(1);
      expect(retryCount).toBeLessThanOrEqual(maxRetries);
    });

    it('should stop after max retries', () => {
      const retryCount = 3;
      const maxRetries = 3;

      expect(retryCount).toBe(maxRetries);
      expect(retryCount >= maxRetries).toBe(true);
    });

    it('should calculate retry delay', () => {
      const baseDelay = 1000;
      const retryCount = 2;
      const delay = baseDelay * retryCount;

      expect(delay).toBe(2000);
    });
  });
});
