import type { CategoryRow, SiteRow, CreateSiteBody, UpdateSiteBody, NavData } from "./types";
import { KV_KEY, SITE_STATUS } from "./constants";

// --- Interfaces ---

export interface ISiteRepository {
  create(data: CreateSiteBody): Promise<string>;
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
}

export interface IPublisher {
  publish(): Promise<NavData>;
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

  async findById(id: string): Promise<SiteRow | null> {
    return this.db.prepare("SELECT * FROM sites WHERE id = ?").bind(id).first<SiteRow>();
  }

  async findByUrl(url: string): Promise<SiteRow | null> {
    return this.db.prepare("SELECT * FROM sites WHERE url = ?").bind(url).first<SiteRow>();
  }

  async listApproved(opts: { category?: string; featured?: boolean; limit: number }): Promise<{ sites: SiteRow[]; total: number }> {
    let sql = `SELECT s.* FROM sites s JOIN categories c ON s.category_id = c.id WHERE s.status = '${SITE_STATUS.APPROVED}'`;
    const params: (string | number)[] = [];

    if (opts.category) { sql += " AND c.slug = ?"; params.push(opts.category); }
    if (opts.featured) { sql += " AND s.featured = 1"; }
    sql += " ORDER BY s.sort_order ASC, s.created_at DESC LIMIT ?";
    params.push(opts.limit);

    const { results } = await this.db.prepare(sql).bind(...params).all<SiteRow>();
    const total = await this.db.prepare(`SELECT COUNT(*) as c FROM sites WHERE status = '${SITE_STATUS.APPROVED}'`).first<{ c: number }>();
    return { sites: results || [], total: total?.c || 0 };
  }

  async listPending(): Promise<SiteRow[]> {
    const { results } = await this.db
      .prepare(`SELECT * FROM sites WHERE status = '${SITE_STATUS.PENDING}' ORDER BY created_at DESC`)
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
        `SELECT c.*, (SELECT COUNT(*) FROM sites s WHERE s.category_id = c.id AND s.status = '${SITE_STATUS.APPROVED}') as siteCount
         FROM categories c ORDER BY c.sort_order ASC`
      )
      .all<CategoryRow & { siteCount: number }>();
    return results || [];
  }
}

export class KVPublisher implements IPublisher {
  constructor(private readonly db: D1Database, private readonly kv: KVNamespace) {}

  async publish(): Promise<NavData> {
    const { results: allCategories } = await this.db.prepare("SELECT * FROM categories ORDER BY sort_order ASC").all<CategoryRow>();
    const { results: sites } = await this.db
      .prepare(`SELECT * FROM sites WHERE status = '${SITE_STATUS.APPROVED}' ORDER BY sort_order ASC, created_at DESC`)
      .all<SiteRow>();

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
