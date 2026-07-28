/**
 * 统一 logo 回退：显式 logo 字段优先，其次按域名依次尝试多个 favicon 源，
 * 全部失败时前端回退到首字母占位（由组件处理）。
 *
 * 返回按优先级排序的候选 URL 数组，供 <img> 的 onerror 链式降级使用。
 */
export function buildLogoCandidates(url?: string, logo?: string): string[] {
  const candidates: string[] = [];

  const explicit = logo?.trim();
  if (explicit) candidates.push(explicit);

  if (url) {
    try {
      const domain = new URL(url).hostname;
      candidates.push(
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        `https://icon.horse/icon/${domain}`,
        `https://${domain}/favicon.ico`,
      );
    } catch {
      // url 非法：忽略 favicon 源，只保留显式 logo（若有）
    }
  }

  return candidates;
}
