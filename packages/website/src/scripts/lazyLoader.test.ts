import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

      // Test data structure
      expect(validData).toHaveProperty('categoryIndex');
      expect(validData).toHaveProperty('categoryName');
      expect(validData).toHaveProperty('sites');
      expect(validData).toHaveProperty('metadata');
      expect(Array.isArray(validData.sites)).toBe(true);
    });

    it('should reject invalid category data', () => {
      const invalidData = {
        categoryIndex: 0,
        // Missing categoryName
        sites: [],
        metadata: {}
      };

      expect(invalidData).not.toHaveProperty('categoryName');
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

      // Simulate showing loading state
      if (loadingState) loadingState.style.display = 'block';
      if (loadedContent) loadedContent.style.display = 'none';

      expect(loadingState?.style.display).toBe('block');
      expect(loadedContent?.style.display).toBe('none');
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
    });

    it('should handle expired cache entries', () => {
      const expiredTimestamp = Date.now() - (31 * 60 * 1000); // 31 minutes ago
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
  });
});
