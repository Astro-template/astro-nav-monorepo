// 新的配置化类型定义
export interface Site {
  title: string;
  description: string;
  url?: string;
  logo?: string;
  advantages?: string[];
  features?: string[];
  related?: {
    title: string;
    description: string;
  }[];
  details?: {
    intro?: string;
    pricing?: string;
    pros?: string[];
    cons?: string[];
    tips?: string[];
  };
}

export interface SubMenuItem {
  name: string;
  href: string;
  icon: string;
  sites: Site[];
}

export interface MenuItem {
  name: string;
  href: string;
  icon: string;
  type: 'single' | 'tabs';
  sites?: Site[];
  submenu?: SubMenuItem[];
}

export interface SiteConfig {
  site: {
    title: string;
    description: string;
    logo: {
      text: string;
      href: string;
    };
  };
  categoryMap: {
    [key: string]: string;
  };
  menuItems: MenuItem[];
}

export interface StaticPath {
  params: { slug: string };
  props: {
    site: Site;
    category: string;
    subcategory?: string;
  };
}
