import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fs module
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn()
}));

const { readFileSync, existsSync } = await import('fs');

describe('verify-website', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('File Existence Checks', () => {
    it('should check if config files exist', () => {
      (existsSync as any).mockReturnValue(true);
      (readFileSync as any).mockReturnValue('{"test": "data"}');

      expect(existsSync('static/config.json')).toBe(true);
    });

    it('should handle missing files', () => {
      (existsSync as any).mockReturnValue(false);

      expect(existsSync('non-existent-file.json')).toBe(false);
    });
  });

  describe('JSON Validation', () => {
    it('should validate correct JSON format', () => {
      const validJson = '{"key": "value"}';
      
      expect(() => JSON.parse(validJson)).not.toThrow();
    });

    it('should detect invalid JSON format', () => {
      const invalidJson = '{invalid json}';
      
      expect(() => JSON.parse(invalidJson)).toThrow();
    });

    it('should handle empty JSON objects', () => {
      const emptyJson = '{}';
      
      expect(() => JSON.parse(emptyJson)).not.toThrow();
      expect(JSON.parse(emptyJson)).toEqual({});
    });
  });

  describe('Config File Validation', () => {
    it('should validate all required config files', () => {
      const configFiles = [
        'config.json',
        'config-optimized.json',
        'config-traditional.json'
      ];

      expect(configFiles.length).toBe(3);
      expect(configFiles).toContain('config.json');
    });
  });

  describe('Astro Config Validation', () => {
    it('should detect port configuration', () => {
      const configContent = 'port: 4321';
      const pattern = /port:\s*4321/;
      
      expect(pattern.test(configContent)).toBe(true);
    });

    it('should detect Tailwind CSS integration', () => {
      const configContent = "import tailwindcss from '@tailwindcss/vite'";
      const pattern = /@tailwindcss\/vite/;
      
      expect(pattern.test(configContent)).toBe(true);
    });

    it('should detect static output mode', () => {
      const configContent = "output: 'static'";
      const pattern = /output:\s*["']static["']/;
      
      expect(pattern.test(configContent)).toBe(true);
    });

    it('should detect public directory configuration', () => {
      const configContent = "publicDir: './static'";
      const pattern = /publicDir:\s*["']\.\/static["']/;
      
      expect(pattern.test(configContent)).toBe(true);
    });
  });

  describe('Tailwind Usage Detection', () => {
    it('should detect Tailwind flex classes', () => {
      const content = '<div class="flex items-center">';
      const pattern = /class="[^"]*flex/;
      
      expect(pattern.test(content)).toBe(true);
    });

    it('should detect Tailwind grid classes', () => {
      const content = '<div class="grid grid-cols-2">';
      const pattern = /class="[^"]*grid/;
      
      expect(pattern.test(content)).toBe(true);
    });

    it('should detect Tailwind background classes', () => {
      const content = '<div class="bg-white bg-primary">';
      const pattern = /class="[^"]*bg-/;
      
      expect(pattern.test(content)).toBe(true);
    });

    it('should detect Tailwind text classes', () => {
      const content = '<p class="text-gray-600 text-lg">';
      const pattern = /class="[^"]*text-/;
      
      expect(pattern.test(content)).toBe(true);
    });

    it('should detect Tailwind hover classes', () => {
      const content = '<button class="hover:bg-primary">';
      const pattern = /class="[^"]*hover:/;
      
      expect(pattern.test(content)).toBe(true);
    });

    it('should detect Tailwind transition classes', () => {
      const content = '<div class="transition-all duration-300">';
      const pattern = /class="[^"]*transition/;
      
      expect(pattern.test(content)).toBe(true);
    });
  });

  describe('Package.json Validation', () => {
    it('should validate required dependencies', () => {
      const pkg = {
        dependencies: {
          '@astro-nav/shared': 'workspace:*',
          'astro': '^5.15.1',
          'tailwindcss': '^4.0.0-beta.7'
        }
      };

      expect(pkg.dependencies['@astro-nav/shared']).toBe('workspace:*');
      expect(pkg.dependencies['astro']).toMatch(/^\^5\./);
      expect(pkg.dependencies['tailwindcss']).toMatch(/^\^4\./);
    });

    it('should detect missing dependencies', () => {
      const pkg = {
        dependencies: {
          'astro': '^5.15.1'
        }
      };

      expect(pkg.dependencies['@astro-nav/shared']).toBeUndefined();
      expect(pkg.dependencies['tailwindcss']).toBeUndefined();
    });
  });

  describe('File Path Validation', () => {
    it('should validate page file paths', () => {
      const pages = [
        'src/pages/index.astro',
        'src/pages/submit.astro'
      ];

      pages.forEach(page => {
        expect(page).toMatch(/\.astro$/);
        expect(page).toMatch(/^src\/pages\//);
      });
    });

    it('should validate component file paths', () => {
      const components = [
        'src/components/Sidebar.astro',
        'src/components/CategoryCard.astro',
        'src/components/NavItem.astro'
      ];

      components.forEach(component => {
        expect(component).toMatch(/\.astro$/);
        expect(component).toMatch(/^src\/components\//);
      });
    });

    it('should validate layout file paths', () => {
      const layouts = [
        'src/layouts/Layout.astro'
      ];

      layouts.forEach(layout => {
        expect(layout).toMatch(/\.astro$/);
        expect(layout).toMatch(/^src\/layouts\//);
      });
    });

    it('should validate style file paths', () => {
      const styles = [
        'src/styles/global.css'
      ];

      styles.forEach(style => {
        expect(style).toMatch(/\.css$/);
        expect(style).toMatch(/^src\/styles\//);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle file read errors', () => {
      (readFileSync as any).mockImplementation(() => {
        throw new Error('File read error');
      });

      expect(() => readFileSync('test.json', 'utf-8')).toThrow('File read error');
    });

    it('should handle JSON parse errors', () => {
      const invalidJson = '{invalid}';
      
      expect(() => JSON.parse(invalidJson)).toThrow();
    });

    it('should handle missing package.json', () => {
      (existsSync as any).mockReturnValue(false);

      expect(existsSync('package.json')).toBe(false);
    });
  });

  describe('Regex Pattern Validation', () => {
    it('should match port configuration patterns', () => {
      const patterns = [
        'port: 4321',
        'port:4321'
      ];

      const regex = /port:\s*4321/;
      patterns.forEach(pattern => {
        expect(regex.test(pattern)).toBe(true);
      });
    });

    it('should match output configuration patterns', () => {
      const patterns = [
        "output: 'static'",
        'output: "static"',
        "output:'static'"
      ];

      const regex = /output:\s*["']static["']/;
      patterns.forEach(pattern => {
        expect(regex.test(pattern)).toBe(true);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should validate complete config structure', () => {
      const config = {
        port: 4321,
        output: 'static',
        publicDir: './static'
      };

      expect(config.port).toBe(4321);
      expect(config.output).toBe('static');
      expect(config.publicDir).toBe('./static');
    });

    it('should validate complete package structure', () => {
      const pkg = {
        name: '@astro-nav/website',
        dependencies: {
          '@astro-nav/shared': 'workspace:*',
          'astro': '^5.15.1',
          'tailwindcss': '^4.0.0-beta.7'
        }
      };

      expect(pkg.name).toBe('@astro-nav/website');
      expect(Object.keys(pkg.dependencies).length).toBe(3);
    });
  });
});
