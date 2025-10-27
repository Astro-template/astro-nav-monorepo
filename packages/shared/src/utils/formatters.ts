/**
 * 格式化工具函数
 */

/**
 * 格式化URL - 确保URL格式正确
 */
export function formatUrl(url: string): string {
  if (!url) return '';
  
  // 移除首尾空格
  url = url.trim();
  
  // 如果没有协议，添加 https://
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    url = 'https://' + url;
  }
  
  return url;
}

/**
 * 生成唯一ID
 */
export function generateId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * 生成slug（URL友好的字符串）
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\-\u4e00-\u9fa5]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * 格式化时间
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 转义HTML特殊字符
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * 清理输入（防止XSS）
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '');
}

/**
 * 分割字符串为数组（处理分号分隔的字符串）
 */
export function splitBySemicolon(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(';')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * 数组转分号分隔的字符串
 */
export function joinWithSemicolon(items: string[]): string {
  return items.filter(item => item.trim().length > 0).join('; ');
}
