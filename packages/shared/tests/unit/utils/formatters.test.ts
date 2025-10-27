import { describe, it, expect } from 'vitest';
import {
  formatUrl,
  generateId,
  generateSlug,
  formatFileSize,
  formatDate,
  formatDateTime,
  truncateText,
  escapeHtml,
  sanitizeInput,
  splitBySemicolon,
  joinWithSemicolon
} from '../../../src/utils/formatters';

describe('formatters', () => {
  describe('formatUrl', () => {
    it('应该返回空字符串对于空输入', () => {
      expect(formatUrl('')).toBe('');
    });

    it('应该移除首尾空格', () => {
      expect(formatUrl('  https://example.com  ')).toBe('https://example.com');
    });

    it('应该保留已有协议的 URL', () => {
      expect(formatUrl('https://example.com')).toBe('https://example.com');
      expect(formatUrl('http://example.com')).toBe('http://example.com');
    });

    it('应该为没有协议的 URL 添加 https://', () => {
      expect(formatUrl('example.com')).toBe('https://example.com');
      expect(formatUrl('www.example.com')).toBe('https://www.example.com');
    });

    it('应该保留相对路径', () => {
      expect(formatUrl('/path/to/page')).toBe('/path/to/page');
    });
  });

  describe('generateId', () => {
    it('应该生成带默认前缀的 ID', () => {
      const id = generateId();
      expect(id).toMatch(/^id-[a-z0-9]+-[a-z0-9]+$/);
    });

    it('应该生成带自定义前缀的 ID', () => {
      const id = generateId('custom');
      expect(id).toMatch(/^custom-[a-z0-9]+-[a-z0-9]+$/);
    });

    it('应该生成唯一的 ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateSlug', () => {
    it('应该转换为小写', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('应该将空格替换为连字符', () => {
      expect(generateSlug('hello world test')).toBe('hello-world-test');
    });

    it('应该移除特殊字符', () => {
      expect(generateSlug('hello@world!test')).toBe('helloworldtest');
    });

    it('应该处理多个连续空格', () => {
      expect(generateSlug('hello   world')).toBe('hello-world');
    });

    it('应该移除首尾的连字符', () => {
      expect(generateSlug('-hello-world-')).toBe('hello-world');
    });

    it('应该保留中文字符', () => {
      expect(generateSlug('你好 世界')).toBe('你好-世界');
    });

    it('应该处理下划线', () => {
      expect(generateSlug('hello_world')).toBe('hello-world');
    });
  });

  describe('formatFileSize', () => {
    it('应该格式化 0 字节', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('应该格式化字节', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('应该格式化 KB', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
    });

    it('应该格式化 MB', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
    });

    it('应该格式化 GB', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('应该保留两位小数', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('formatDate', () => {
    it('应该格式化 Date 对象', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/2024/);
      expect(formatted).toMatch(/01/);
      expect(formatted).toMatch(/15/);
    });

    it('应该格式化日期字符串', () => {
      const formatted = formatDate('2024-01-15');
      expect(formatted).toMatch(/2024/);
      expect(formatted).toMatch(/01/);
      expect(formatted).toMatch(/15/);
    });
  });

  describe('formatDateTime', () => {
    it('应该格式化 Date 对象为日期时间', () => {
      const date = new Date('2024-01-15T10:30:45');
      const formatted = formatDateTime(date);
      expect(formatted).toMatch(/2024/);
      expect(formatted).toMatch(/01/);
      expect(formatted).toMatch(/15/);
      expect(formatted).toMatch(/10/);
      expect(formatted).toMatch(/30/);
      expect(formatted).toMatch(/45/);
    });

    it('应该格式化日期时间字符串', () => {
      const formatted = formatDateTime('2024-01-15T10:30:45');
      expect(formatted).toMatch(/2024/);
    });
  });

  describe('truncateText', () => {
    it('应该不截断短文本', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('应该截断长文本', () => {
      expect(truncateText('Hello World', 8)).toBe('Hello...');
    });

    it('应该使用自定义后缀', () => {
      expect(truncateText('Hello World', 8, '…')).toBe('Hello W…');
    });

    it('应该处理等于最大长度的文本', () => {
      expect(truncateText('Hello', 5)).toBe('Hello');
    });
  });

  describe('escapeHtml', () => {
    it('应该转义 & 符号', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('应该转义 < 和 >', () => {
      expect(escapeHtml('<div>content</div>')).toBe('&lt;div&gt;content&lt;/div&gt;');
    });

    it('应该转义引号', () => {
      expect(escapeHtml('"Hello"')).toBe('&quot;Hello&quot;');
      expect(escapeHtml("'Hello'")).toBe('&#039;Hello&#039;');
    });

    it('应该转义所有特殊字符', () => {
      expect(escapeHtml('<a href="url">Link & Text</a>'))
        .toBe('&lt;a href=&quot;url&quot;&gt;Link &amp; Text&lt;/a&gt;');
    });

    it('应该不改变普通文本', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('sanitizeInput', () => {
    it('应该移除首尾空格', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('应该移除 < 和 > 符号', () => {
      expect(sanitizeInput('hello<script>alert()</script>world'))
        .toBe('helloscriptalert()/scriptworld');
    });

    it('应该同时处理空格和特殊字符', () => {
      expect(sanitizeInput('  <div>content</div>  ')).toBe('divcontent/div');
    });

    it('应该保留普通文本', () => {
      expect(sanitizeInput('Hello World')).toBe('Hello World');
    });
  });

  describe('splitBySemicolon', () => {
    it('应该分割分号分隔的字符串', () => {
      expect(splitBySemicolon('item1; item2; item3')).toEqual(['item1', 'item2', 'item3']);
    });

    it('应该移除空白项', () => {
      expect(splitBySemicolon('item1;  ; item2')).toEqual(['item1', 'item2']);
    });

    it('应该处理空字符串', () => {
      expect(splitBySemicolon('')).toEqual([]);
    });

    it('应该处理 undefined', () => {
      expect(splitBySemicolon(undefined)).toEqual([]);
    });

    it('应该移除每项的首尾空格', () => {
      expect(splitBySemicolon('  item1  ;  item2  ')).toEqual(['item1', 'item2']);
    });

    it('应该处理单个项', () => {
      expect(splitBySemicolon('item1')).toEqual(['item1']);
    });
  });

  describe('joinWithSemicolon', () => {
    it('应该用分号连接数组', () => {
      expect(joinWithSemicolon(['item1', 'item2', 'item3'])).toBe('item1; item2; item3');
    });

    it('应该过滤空字符串', () => {
      expect(joinWithSemicolon(['item1', '', 'item2'])).toBe('item1; item2');
    });

    it('应该过滤只有空格的字符串', () => {
      expect(joinWithSemicolon(['item1', '   ', 'item2'])).toBe('item1; item2');
    });

    it('应该处理空数组', () => {
      expect(joinWithSemicolon([])).toBe('');
    });

    it('应该处理单个项', () => {
      expect(joinWithSemicolon(['item1'])).toBe('item1');
    });
  });
});
