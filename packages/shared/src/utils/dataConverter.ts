import type { Category, NavItem } from '../types/navigation.js';
import type { MenuItem, Site, SubMenuItem } from '../types/config.js';

// 将旧的NavItem转换为新的Site格式
export function convertNavItemToSite(navItem: NavItem): Site {
  return {
    title: navItem.title,
    description: navItem.description,
    url: navItem.url,
    advantages: navItem.features, // 将features映射为advantages
    details: navItem.details,
  };
}

// 将旧的Category转换为新的MenuItem格式
export function convertCategoryToMenuItem(category: Category): MenuItem {
  // 如果有子分类，转换为tabs类型
  if (category.subCategories && category.subCategories.length > 0) {
    const submenu: SubMenuItem[] = category.subCategories.map(subCat => ({
      name: subCat.name,
      href: `#${category.name.toLowerCase()}-${subCat.name.toLowerCase()}`,
      icon: category.icon,
      sites: subCat.items.map(convertNavItemToSite)
    }));

    return {
      name: category.name,
      href: `#${category.name.toLowerCase()}`,
      icon: category.icon,
      type: 'tabs',
      submenu
    };
  } 
  // 否则转换为single类型
  else {
    return {
      name: category.name,
      href: `#${category.name.toLowerCase()}`,
      icon: category.icon,
      type: 'single',
      sites: category.items ? category.items.map(convertNavItemToSite) : []
    };
  }
}

// 将旧的导航数据数组转换为新的配置格式
export function convertNavigationData(categories: Category[]) {
  const menuItems = categories.map(convertCategoryToMenuItem);
  
  // 生成分类映射
  const categoryMap: { [key: string]: string } = {};
  categories.forEach(category => {
    categoryMap[category.name] = category.name.toLowerCase().replace(/\s+/g, '-');
  });

  return {
    site: {
      title: "Affiliate导航",
      description: "专业的Affiliate营销导航网站",
      logo: {
        text: "Affiliate导航",
        href: "/"
      }
    },
    categoryMap,
    menuItems
  };
}

// 反向转换：将新格式转换回旧格式（用于向后兼容）
export function convertMenuItemToCategory(menuItem: MenuItem): Category {
  if (menuItem.type === 'tabs' && menuItem.submenu) {
    return {
      name: menuItem.name,
      icon: menuItem.icon,
      subCategories: menuItem.submenu.map(sub => ({
        name: sub.name,
        items: sub.sites.map(convertSiteToNavItem)
      }))
    };
  } else {
    return {
      name: menuItem.name,
      icon: menuItem.icon,
      items: menuItem.sites ? menuItem.sites.map(convertSiteToNavItem) : []
    };
  }
}

// 将新的Site转换为旧的NavItem格式
export function convertSiteToNavItem(site: Site): NavItem {
  return {
    title: site.title,
    description: site.description,
    url: site.url || '#',
    features: site.advantages,
    details: site.details
  };
}
