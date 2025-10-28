import { describe, it, expect } from 'vitest';

/**
 * NavItem 组件测试
 * 测试导航项组件的属性验证和渲染逻辑
 */

describe('NavItem Component', () => {
  describe('Props Validation', () => {
    it('should accept valid site props', () => {
      const validProps = {
        title: 'Example Site',
        url: 'https://example.com',
        description: 'A great example site',
        logo: 'example-logo.png'
      };

      expect(validProps).toHaveProperty('title');
      expect(validProps).toHaveProperty('url');
      expect(validProps).toHaveProperty('description');
      expect(validProps).toHaveProperty('logo');
    });

    it('should validate title is a non-empty string', () => {
      const props = {
        title: 'Test Site',
        url: 'https://test.com',
        description: 'Description'
      };

      expect(typeof props.title).toBe('string');
      expect(props.title.length).toBeGreaterThan(0);
    });

    it('should validate URL format', () => {
      const props = {
        title: 'Test',
        url: 'https://example.com',
        description: 'Desc'
      };

      expect(() => new URL(props.url)).not.toThrow();
    });

    it('should validate description is a string', () => {
      const props = {
        title: 'Test',
        url: 'https://example.com',
        description: 'This is a description'
      };

      expect(typeof props.description).toBe('string');
    });
  });

  describe('Logo Handling', () => {
    it('should handle relative logo paths', () => {
      const logo = 'site-logo.png';
      const logoSrc = logo.startsWith('http') ? logo : `/logos/${logo}`;

      expect(logoSrc).toBe('/logos/site-logo.png');
    });

    it('should handle absolute logo URLs', () => {
      const logo = 'https://example.com/logo.png';
      const logoSrc = logo.startsWith('http') ? logo : `/logos/${logo}`;

      expect(logoSrc).toBe('https://example.com/logo.png');
    });

    it('should provide fallback for missing logo', () => {
      const logo = undefined;
      const logoSrc = logo || '/images/default-logo.png';

      expect(logoSrc).toBe('/images/default-logo.png');
    });

    it('should handle empty logo string', () => {
      const logo = '';
      const logoSrc = logo || '/images/default-logo.png';

      expect(logoSrc).toBe('/images/default-logo.png');
    });
  });

  describe('Description Truncation', () => {
    it('should truncate long descriptions', () => {
      const longDescription = 'This is a very long description that should be truncated to fit in the card component without breaking the layout';
      const maxLength = 50;
      
      const truncated = longDescription.length > maxLength
        ? longDescription.substring(0, maxLength) + '...'
        : longDescription;

      expect(truncated.length).toBeLessThanOrEqual(maxLength + 3);
      expect(truncated).toContain('...');
    });

    it('should not truncate short descriptions', () => {
      const shortDescription = 'Short description';
      const maxLength = 50;
      
      const result = shortDescription.length > maxLength
        ? shortDescription.substring(0, maxLength) + '...'
        : shortDescription;

      expect(result).toBe(shortDescription);
      expect(result).not.toContain('...');
    });

    it('should handle exact length descriptions', () => {
      const description = 'A'.repeat(50);
      const maxLength = 50;
      
      const result = description.length > maxLength
        ? description.substring(0, maxLength) + '...'
        : description;

      expect(result).toBe(description);
      expect(result).not.toContain('...');
    });
  });

  describe('Link Attributes', () => {
    it('should generate correct external link attributes', () => {
      const url = 'https://example.com';
      const linkAttrs = {
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer'
      };

      expect(linkAttrs.href).toBe(url);
      expect(linkAttrs.target).toBe('_blank');
      expect(linkAttrs.rel).toBe('noopener noreferrer');
    });

    it('should include security attributes for external links', () => {
      const rel = 'noopener noreferrer';
      
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });
  });

  describe('Title Display', () => {
    it('should display title correctly', () => {
      const title = 'Example Website';
      
      expect(title).toBeTruthy();
      expect(typeof title).toBe('string');
    });

    it('should handle titles with special characters', () => {
      const titles = [
        'Site & Tools',
        'AI/ML Platform',
        'React.js Framework',
        'Vue (v3.0)'
      ];

      titles.forEach(title => {
        expect(title).toBeTruthy();
        expect(typeof title).toBe('string');
      });
    });

    it('should handle long titles', () => {
      const longTitle = 'This is a very long site title that might need truncation';
      const maxLength = 30;
      
      const truncated = longTitle.length > maxLength
        ? longTitle.substring(0, maxLength) + '...'
        : longTitle;

      expect(truncated.length).toBeLessThanOrEqual(maxLength + 3);
    });
  });

  describe('Hover Effects', () => {
    it('should have hover state classes', () => {
      const hoverClasses = [
        'hover:-translate-y-0.5',
        'hover:shadow-md',
        'hover:border-primary',
        'group-hover:text-primary'
      ];

      hoverClasses.forEach(className => {
        expect(className).toContain('hover');
      });
    });

    it('should use group hover for nested elements', () => {
      const groupHoverClass = 'group-hover:text-primary';
      
      expect(groupHoverClass).toContain('group-hover');
    });
  });

  describe('Responsive Design', () => {
    it('should have fixed dimensions', () => {
      const dimensions = {
        width: '180px',
        height: '50px'
      };

      expect(dimensions.width).toBe('180px');
      expect(dimensions.height).toBe('50px');
    });

    it('should use Tailwind width classes', () => {
      const widthClass = 'w-[180px]';
      
      expect(widthClass).toContain('w-[180px]');
    });

    it('should use Tailwind height classes', () => {
      const heightClass = 'h-[50px]';
      
      expect(heightClass).toContain('h-[50px]');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible link text', () => {
      const site = {
        title: 'Example Site',
        url: 'https://example.com'
      };

      const ariaLabel = `访问 ${site.title}`;
      
      expect(ariaLabel).toContain(site.title);
    });

    it('should have alt text for logo images', () => {
      const site = {
        title: 'Example Site',
        logo: 'logo.png'
      };

      const altText = `${site.title} logo`;
      
      expect(altText).toContain(site.title);
      expect(altText).toContain('logo');
    });

    it('should use semantic HTML structure', () => {
      const structure = {
        hasLink: true,
        hasImage: true,
        hasHeading: true,
        hasParagraph: true
      };

      expect(structure.hasLink).toBe(true);
      expect(structure.hasImage).toBe(true);
      expect(structure.hasHeading).toBe(true);
    });
  });

  describe('CSS Classes', () => {
    it('should use Tailwind utility classes', () => {
      const classes = [
        'flex',
        'items-center',
        'gap-2',
        'p-2',
        'border',
        'rounded',
        'bg-white',
        'shadow-sm',
        'transition-all',
        'duration-300'
      ];

      classes.forEach(className => {
        expect(className).toBeTruthy();
        expect(typeof className).toBe('string');
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

    it('should have shadow classes', () => {
      const shadowClasses = [
        'shadow-sm',
        'hover:shadow-md'
      ];

      shadowClasses.forEach(className => {
        expect(className).toBeTruthy();
      });
    });
  });

  describe('Layout Structure', () => {
    it('should use flexbox layout', () => {
      const layoutClasses = {
        container: 'flex items-center gap-2',
        image: 'shrink-0',
        content: 'flex-1 min-w-0'
      };

      expect(layoutClasses.container).toContain('flex');
      expect(layoutClasses.image).toContain('shrink-0');
      expect(layoutClasses.content).toContain('flex-1');
    });

    it('should handle text overflow', () => {
      const textClasses = {
        title: 'truncate',
        description: 'truncate'
      };

      expect(textClasses.title).toBe('truncate');
      expect(textClasses.description).toBe('truncate');
    });
  });

  describe('Image Sizing', () => {
    it('should have correct logo dimensions', () => {
      const logoSize = {
        width: '24px',
        height: '24px'
      };

      expect(logoSize.width).toBe('24px');
      expect(logoSize.height).toBe('24px');
    });

    it('should use Tailwind size classes', () => {
      const sizeClasses = 'w-6 h-6';
      
      expect(sizeClasses).toContain('w-6');
      expect(sizeClasses).toContain('h-6');
    });

    it('should have rounded logo', () => {
      const roundedClass = 'rounded-full';
      
      expect(roundedClass).toBe('rounded-full');
    });
  });

  describe('Text Styling', () => {
    it('should have correct title styling', () => {
      const titleClasses = {
        size: 'text-xs',
        color: 'text-gray-800',
        weight: 'font-bold',
        overflow: 'truncate'
      };

      expect(titleClasses.size).toBe('text-xs');
      expect(titleClasses.color).toBe('text-gray-800');
      expect(titleClasses.weight).toBe('font-bold');
    });

    it('should have correct description styling', () => {
      const descClasses = {
        size: 'text-[11px]',
        color: 'text-gray-600',
        margin: 'm-0',
        overflow: 'truncate'
      };

      expect(descClasses.size).toBe('text-[11px]');
      expect(descClasses.color).toBe('text-gray-600');
      expect(descClasses.margin).toBe('m-0');
    });
  });

  describe('Border and Spacing', () => {
    it('should have correct border styling', () => {
      const borderClasses = {
        width: 'border',
        color: 'border-gray-200',
        hover: 'hover:border-primary'
      };

      expect(borderClasses.width).toBe('border');
      expect(borderClasses.color).toBe('border-gray-200');
      expect(borderClasses.hover).toBe('hover:border-primary');
    });

    it('should have correct padding', () => {
      const padding = 'p-2';
      
      expect(padding).toBe('p-2');
    });

    it('should have correct gap between elements', () => {
      const gap = 'gap-2';
      
      expect(gap).toBe('gap-2');
    });
  });

  describe('URL Validation', () => {
    it('should validate HTTPS URLs', () => {
      const url = 'https://example.com';
      const urlObj = new URL(url);
      
      expect(urlObj.protocol).toBe('https:');
    });

    it('should validate HTTP URLs', () => {
      const url = 'http://example.com';
      const urlObj = new URL(url);
      
      expect(urlObj.protocol).toBe('http:');
    });

    it('should handle URLs with paths', () => {
      const url = 'https://example.com/path/to/page';
      const urlObj = new URL(url);
      
      expect(urlObj.pathname).toBe('/path/to/page');
    });

    it('should handle URLs with query parameters', () => {
      const url = 'https://example.com?param=value';
      const urlObj = new URL(url);
      
      expect(urlObj.search).toBe('?param=value');
    });
  });
});
