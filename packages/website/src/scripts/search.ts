/**
 * 搜索功能实现
 * 支持搜索网站标题、描述和分类名称
 */

interface SearchableItem {
  element: HTMLElement;
  title: string;
  description: string;
  categoryName: string;
}

class SearchManager {
  private searchInput: HTMLInputElement | null = null;
  private categoriesContainer: HTMLElement | null = null;
  private searchableItems: SearchableItem[] = [];
  private debounceTimer: number | null = null;

  constructor() {
    this.init();
  }

  /**
   * 初始化搜索功能
   */
  private init(): void {
    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * 设置搜索功能
   */
  private setup(): void {
    this.searchInput = document.getElementById('search-input') as HTMLInputElement;
    this.categoriesContainer = document.getElementById('categories-container');

    if (!this.searchInput || !this.categoriesContainer) {
      console.warn('搜索元素未找到');
      return;
    }

    // 收集所有可搜索的项目
    this.collectSearchableItems();

    // 绑定搜索事件
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearch((e.target as HTMLInputElement).value);
    });

    // 支持 ESC 键清空搜索
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSearch();
      }
    });
  }

  /**
   * 收集所有可搜索的项目
   */
  private collectSearchableItems(): void {
    if (!this.categoriesContainer) return;

    this.searchableItems = [];

    // 遍历所有分类
    const categories = this.categoriesContainer.querySelectorAll('[id^="category-"]');
    
    categories.forEach((category) => {
      const categoryElement = category as HTMLElement;
      const categoryName = categoryElement.querySelector('h2')?.textContent?.trim() || '';

      // 收集分类下的所有网站卡片（NavItem 组件的外层 div）
      const siteCards = categoryElement.querySelectorAll('div.w-\\[180px\\]');
      
      siteCards.forEach((card) => {
        const cardElement = card as HTMLElement;
        // 从 strong 标签获取标题
        const title = cardElement.querySelector('strong')?.textContent?.trim() || '';
        // 从 p 标签获取描述
        const description = cardElement.querySelector('p')?.textContent?.trim() || '';

        this.searchableItems.push({
          element: cardElement,
          title,
          description,
          categoryName
        });
      });
    });

    console.log(`已收集 ${this.searchableItems.length} 个可搜索项目`);
  }

  /**
   * 处理搜索
   */
  private handleSearch(query: string): void {
    // 使用防抖优化性能
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.performSearch(query);
    }, 300);
  }

  /**
   * 执行搜索
   */
  private performSearch(query: string): void {
    const searchQuery = query.trim().toLowerCase();

    // 如果搜索为空，显示所有内容
    if (!searchQuery) {
      this.showAllItems();
      return;
    }

    let visibleCount = 0;
    const categoryVisibility = new Map<HTMLElement, boolean>();

    // 遍历所有项目，检查是否匹配搜索条件
    this.searchableItems.forEach((item) => {
      const matches = this.matchesSearch(item, searchQuery);
      
      if (matches) {
        item.element.style.display = '';
        visibleCount++;

        // 标记该分类应该显示
        const category = item.element.closest('[id^="category-"]') as HTMLElement;
        if (category) {
          categoryVisibility.set(category, true);
        }
      } else {
        item.element.style.display = 'none';
      }
    });

    // 隐藏没有匹配项的分类
    if (this.categoriesContainer) {
      const categories = this.categoriesContainer.querySelectorAll('[id^="category-"]');
      categories.forEach((category) => {
        const categoryElement = category as HTMLElement;
        if (categoryVisibility.get(categoryElement)) {
          categoryElement.style.display = '';
        } else {
          categoryElement.style.display = 'none';
        }
      });
    }

    console.log(`搜索 "${query}" 找到 ${visibleCount} 个结果`);
  }

  /**
   * 检查项目是否匹配搜索条件
   */
  private matchesSearch(item: SearchableItem, query: string): boolean {
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.categoryName.toLowerCase().includes(query)
    );
  }

  /**
   * 显示所有项目
   */
  private showAllItems(): void {
    this.searchableItems.forEach((item) => {
      item.element.style.display = '';
    });

    // 显示所有分类
    if (this.categoriesContainer) {
      const categories = this.categoriesContainer.querySelectorAll('[id^="category-"]');
      categories.forEach((category) => {
        (category as HTMLElement).style.display = '';
      });
    }
  }

  /**
   * 清空搜索
   */
  private clearSearch(): void {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.showAllItems();
    }
  }
}

// 初始化搜索管理器
new SearchManager();

export {};
