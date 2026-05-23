/**
 * 搜索功能 — 实时过滤网站卡片，匹配标题/描述/分类名
 */

class SearchManager {
  private input: HTMLInputElement | null = null;
  private items: { el: HTMLElement; title: string; desc: string; cat: string }[] = [];
  private timer: number | null = null;

  constructor() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  private setup(): void {
    this.input = document.getElementById('search-input') as HTMLInputElement;
    if (!this.input) return;

    // Collect all .nav-item elements with their text
    document.querySelectorAll('.nav-item').forEach((el) => {
      const card = el as HTMLElement;
      const cat = card.closest('[id^="category-"]')?.querySelector('h2')?.textContent?.trim() || '';
      this.items.push({
        el: card,
        title: (card.querySelector('.site-title')?.textContent || '').toLowerCase(),
        desc: (card.querySelector('.site-desc')?.textContent || '').toLowerCase(),
        cat: cat.toLowerCase(),
      });
    });

    this.input.addEventListener('input', () => this.search());
    this.input.addEventListener('keydown', (e) => { if (e.key === 'Escape') { this.input!.value = ''; this.search(); } });
  }

  private search(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.filter(), 200);
  }

  private filter(): void {
    const q = (this.input?.value || '').trim().toLowerCase();

    if (!q) {
      this.items.forEach(i => i.el.style.display = '');
      document.querySelectorAll('[id^="category-"]').forEach(el => (el as HTMLElement).style.display = '');
      return;
    }

    const visibleCats = new Set<HTMLElement>();

    this.items.forEach(({ el, title, desc, cat }) => {
      const match = title.includes(q) || desc.includes(q) || cat.includes(q);
      el.style.display = match ? '' : 'none';
      if (match) {
        const catEl = el.closest('[id^="category-"]') as HTMLElement;
        if (catEl) visibleCats.add(catEl);
      }
    });

    document.querySelectorAll('[id^="category-"]').forEach(el => {
      (el as HTMLElement).style.display = visibleCats.has(el as HTMLElement) ? '' : 'none';
    });
  }
}

new SearchManager();
export {};
