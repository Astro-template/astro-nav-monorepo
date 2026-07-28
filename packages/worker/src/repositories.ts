import type { CategoryRow, SiteRow, CreateSiteBody, CreateCategoryBody, UpdateSiteBody, NavData, SiteSettings } from "./types";
import { KV_KEY, SITE_STATUS, DEFAULT_SETTINGS, SETTINGS_KEY } from "./constants";

// --- Interfaces ---

export interface ISiteRepository {
  create(data: CreateSiteBody): Promise<string>;
  createApproved(data: CreateSiteBody & { featured?: boolean }): Promise<string>;
  countByCategory(categoryId: string): Promise<number>;
  findById(id: string): Promise<SiteRow | null>;
  findByUrl(url: string): Promise<SiteRow | null>;
  listApproved(opts: { category?: string; featured?: boolean; limit: number }): Promise<{ sites: SiteRow[]; total: number }>;
  listPending(): Promise<SiteRow[]>;
  update(id: string, data: UpdateSiteBody): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ICategoryRepository {
  findById(id: string): Promise<CategoryRow | null>;
  listAll(): Promise<(CategoryRow & { siteCount: number })[]>;
  create(data: CreateCategoryBody): Promise<string>;
  delete(id: string): Promise<void>;
  countChildren(parentId: string): Promise<number>;
  setType(id: string, type: "single" | "tabs"): Promise<void>;
}

export interface IPublisher {
  publish(): Promise<NavData>;
}

export interface ISettingsRepository {
  get(): Promise<SiteSettings>;
  save(settings: SiteSettings): Promise<void>;
}

// --- D1 Implementations ---

export class D1SiteRepository implements ISiteRepository {
  constructor(private readonly db: D1Database) {}

  async create(data: CreateSiteBody): Promise<string> {
    const id = crypto.randomUUID();
    await this.db
      .prepare(
        `INSERT INTO sites (id, title, url, description, logo, category_id, tags, submitter_name, submitter_email, submitter_reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id, data.title, data.url, data.description, data.logo || "",
        data.category_id, JSON.stringify(data.tags || []),
        data.submitter_name || "", data.submitter_email || "", data.submitter_reason || ""
      )
      .run();
    return id;
  }

  async createApproved(data: CreateSiteBody & { featured?: boolean }): Promise<string> {
    const id = crypto.randomUUID();
    await this.db
      .prepare(
        `INSERT INTO sites (id, title, url, description, logo, category_id, tags, status, featured, reviewed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      )
      .bind(
        id, data.title, data.url, data.description, data.logo || "",
        data.category_id, JSON.stringify(data.tags || []),
        SITE_STATUS.APPROVED, data.featured ? 1 : 0
      )
      .run();
    return id;
  }

  async countByCategory(categoryId: string): Promise<number> {
    const row = await this.db
      .prepare("SELECT COUNT(*) as n FROM sites WHERE category_id = ?")
      .bind(categoryId)
      .first<{ n: number }>();
    return row?.n ?? 0;
  }

  async findById(id: string): Promise<SiteRow | null> {
    return this.db.prepare("SELECT * FROM sites WHERE id = ?").bind(id).first<SiteRow>();
  }

  async findByUrl(url: string): Promise<SiteRow | null> {
    return this.db.prepare("SELECT * FROM sites WHERE url = ?").bind(url).first<SiteRow>();
  }

  async listApproved(opts: { category?: string; featured?: boolean; limit: number }): Promise<{ sites: SiteRow[]; total: number }> {
    let sql = "SELECT s.* FROM sites s JOIN categories c ON s.category_id = c.id WHERE s.status = ?";
    const params: (string | number)[] = [SITE_STATUS.APPROVED];

    if (opts.category) { sql += " AND c.slug = ?"; params.push(opts.category); }
    if (opts.featured) { sql += " AND s.featured = 1"; }
    sql += " ORDER BY s.sort_order ASC, s.created_at DESC LIMIT ?";
    params.push(opts.limit);

    const { results } = await this.db.prepare(sql).bind(...params).all<SiteRow>();
    const total = await this.db.prepare("SELECT COUNT(*) as c FROM sites WHERE status = ?").bind(SITE_STATUS.APPROVED).first<{ c: number }>();
    return { sites: results || [], total: total?.c || 0 };
  }

  async listPending(): Promise<SiteRow[]> {
    const { results } = await this.db
      .prepare("SELECT * FROM sites WHERE status = ? ORDER BY created_at DESC")
      .bind(SITE_STATUS.PENDING)
      .all<SiteRow>();
    return results || [];
  }

  async update(id: string, data: UpdateSiteBody): Promise<void> {
    const sets: string[] = [];
    const vals: (string | number)[] = [];

    if (data.status) { sets.push("status = ?", "reviewed_at = ?"); vals.push(data.status, new Date().toISOString()); }
    if (data.reviewer_note !== undefined) { sets.push("reviewer_note = ?"); vals.push(data.reviewer_note); }
    if (data.title) { sets.push("title = ?"); vals.push(data.title); }
    if (data.description) { sets.push("description = ?"); vals.push(data.description); }
    if (data.category_id) { sets.push("category_id = ?"); vals.push(data.category_id); }
    if (data.featured !== undefined) { sets.push("featured = ?"); vals.push(data.featured ? 1 : 0); }
    if (data.sort_order !== undefined) { sets.push("sort_order = ?"); vals.push(data.sort_order); }

    sets.push("updated_at = ?");
    vals.push(new Date().toISOString());
    vals.push(id);

    await this.db.prepare(`UPDATE sites SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
  }

  async delete(id: string): Promise<void> {
    await this.db.prepare("DELETE FROM sites WHERE id = ?").bind(id).run();
  }
}

export class D1CategoryRepository implements ICategoryRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: string): Promise<CategoryRow | null> {
    return this.db.prepare("SELECT * FROM categories WHERE id = ?").bind(id).first<CategoryRow>();
  }

  async listAll(): Promise<(CategoryRow & { siteCount: number })[]> {
    const { results } = await this.db
      .prepare(
        "SELECT c.*, (SELECT COUNT(*) FROM sites s WHERE s.category_id = c.id AND s.status = ?) as siteCount " +
        "FROM categories c ORDER BY c.sort_order ASC"
      )
      .bind(SITE_STATUS.APPROVED)
      .all<CategoryRow & { siteCount: number }>();
    return results || [];
  }

  async create(data: CreateCategoryBody): Promise<string> {
    const id = crypto.randomUUID();
    await this.db
      .prepare(
        "INSERT INTO categories (id, name, slug, icon, description, sort_order, parent_id, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        id, data.name, data.slug, data.icon || "", data.description || "",
        data.sort_order || 0, data.parent_id || null, "single"
      )
      .run();
    return id;
  }

  async delete(id: string): Promise<void> {
    await this.db.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
  }

  async countChildren(parentId: string): Promise<number> {
    const row = await this.db
      .prepare("SELECT COUNT(*) as n FROM categories WHERE parent_id = ?")
      .bind(parentId)
      .first<{ n: number }>();
    return row?.n ?? 0;
  }

  async setType(id: string, type: "single" | "tabs"): Promise<void> {
    await this.db.prepare("UPDATE categories SET type = ? WHERE id = ?").bind(type, id).run();
  }
}

export class D1SettingsRepository implements ISettingsRepository {
  constructor(private readonly db: D1Database) {}

  async get(): Promise<SiteSettings> {
    const { results } = await this.db.prepare("SELECT key, value FROM site_settings").all<{ key: string; value: string }>();
    const map = new Map((results || []).map((r) => [r.key, r.value]));
    return {
      title: map.get(SETTINGS_KEY.title) ?? DEFAULT_SETTINGS.title,
      description: map.get(SETTINGS_KEY.description) ?? DEFAULT_SETTINGS.description,
      logoText: map.get(SETTINGS_KEY.logoText) ?? DEFAULT_SETTINGS.logoText,
    };
  }

  async save(settings: SiteSettings): Promise<void> {
    const entries: [string, string][] = [
      [SETTINGS_KEY.title, settings.title],
      [SETTINGS_KEY.description, settings.description],
      [SETTINGS_KEY.logoText, settings.logoText],
    ];
    const stmt = this.db.prepare(
      "INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now')) " +
      "ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
    );
    await this.db.batch(entries.map(([k, v]) => stmt.bind(k, v)));
  }
}

export class KVPublisher implements IPublisher {
  constructor(
    private readonly db: D1Database,
    private readonly kv: KVNamespace,
    private readonly settings: ISettingsRepository,
  ) {}

  async publish(): Promise<NavData> {
    const { results: allCategories } = await this.db.prepare("SELECT * FROM categories ORDER BY sort_order ASC").all<CategoryRow>();
    const { results: sites } = await this.db
      .prepare("SELECT * FROM sites WHERE status = ? ORDER BY sort_order ASC, created_at DESC")
      .bind(SITE_STATUS.APPROVED)
      .all<SiteRow>();
    const site = await this.settings.get();

    const cats = allCategories || [];
    const allSites = sites || [];

    // Separate top-level and child categories
    const topLevel = cats.filter((c) => !c.parent_id);
    const children = cats.filter((c) => c.parent_id);

    const mapSite = (s: SiteRow) => ({
      id: s.id,
      title: s.title,
      url: s.url,
      description: s.description,
      logo: s.logo,
      tags: JSON.parse(s.tags || "[]") as string[],
      featured: s.featured === 1,
    });

    const navData: NavData = {
      site,
      categories: topLevel.map((cat) => {
        const subs = children.filter((c) => c.parent_id === cat.id);
        if (subs.length > 0) {
          // Has subcategories (tabs)
          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            sites: [],
            subCategories: subs.map((sub) => ({
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              icon: sub.icon,
              sites: allSites.filter((s) => s.category_id === sub.id).map(mapSite),
            })),
          };
        }
        // No subcategories (single)
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          sites: allSites.filter((s) => s.category_id === cat.id).map(mapSite),
        };
      }),
      generatedAt: new Date().toISOString(),
      totalSites: allSites.length,
    };

    await this.kv.put(KV_KEY.NAV_SITES, JSON.stringify(navData));
    return navData;
  }
}
