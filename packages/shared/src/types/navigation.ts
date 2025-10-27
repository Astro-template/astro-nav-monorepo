export interface NavItem {
  title: string;
  url: string;
  description: string;
  details?: {
    intro?: string;
    pricing?: string;
    pros?: string[];
    cons?: string[];
    tips?: string[];
  };
  features?: string[];
}

export interface Category {
  name: string;
  icon: string;
  items?: NavItem[];
  subCategories?: {
    name: string;
    items: NavItem[];
  }[];
}
