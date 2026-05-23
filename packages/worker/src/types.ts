export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  ADMIN_USER: string;
  ADMIN_TOKEN: string;
  TURNSTILE_SECRET: string;
}

// DB row types
export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  type: "single" | "tabs";
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface SiteRow {
  id: string;
  title: string;
  url: string;
  description: string;
  logo: string;
  category_id: string;
  tags: string;         // JSON array
  advantages: string;   // JSON array
  details: string;      // JSON object {intro, pricing, pros[], cons[], tips[]}
  submitter_name: string;
  submitter_email: string;
  submitter_reason: string;
  status: "pending" | "approved" | "rejected";
  reviewer_note: string;
  reviewed_at: string | null;
  sort_order: number;
  featured: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

// API request bodies
export interface CreateSiteBody {
  title: string;
  url: string;
  description: string;
  category_id: string;
  logo?: string;
  tags?: string[];
  submitter_name?: string;
  submitter_email?: string;
  submitter_reason?: string;
}

export interface UpdateSiteBody {
  status?: "approved" | "rejected";
  reviewer_note?: string;
  title?: string;
  description?: string;
  category_id?: string;
  featured?: boolean;
  sort_order?: number;
}

// KV stored format
export interface NavSite {
  id: string;
  title: string;
  url: string;
  description: string;
  logo: string;
  tags: string[];
  featured: boolean;
}

export interface NavSubCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sites: NavSite[];
}

export interface NavData {
  categories: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    sites: NavSite[];
    subCategories?: NavSubCategory[];
  }[];
  generatedAt: string;
  totalSites: number;
}
