import type { Env } from "./types";
import { DEFAULT_SETTINGS } from "./constants";
import { createLogger } from "./logger";
import { Router } from "./router";
import type { RouteContext } from "./router";
import { addCorsHeaders, rateLimitMiddleware, Res } from "./middleware";
import { D1SiteRepository, D1CategoryRepository, D1SettingsRepository, KVPublisher } from "./repositories";
import { createSitesHandler } from "./handlers/sites";
import { createCategoriesHandler } from "./handlers/categories";
import { createAdminHandler } from "./handlers/admin";
import { createAdminPages } from "./handlers/pages";
import { handleLogin, handleLogout, hasValidSession } from "./services/auth";
import { parseFields } from "./lib/request";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return addCorsHeaders(new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const requestId = crypto.randomUUID();
    const logger = createLogger({
      requestId,
      method,
      path,
      ip: request.headers.get("CF-Connecting-IP") || "unknown",
    });

    try {
      // Public auth routes — handled before anything else
      if (path === "/login" && method === "GET") return handleLogin(request, env);
      if (path === "/login" && method === "POST") return handleLogin(request, env);
      if (path === "/logout") return handleLogout();

      // Admin pages — session auth (browser)
      if (path.startsWith("/admin")) {
        const valid = await hasValidSession(request, env);
        if (!valid) return Response.redirect(new URL("/login", request.url).toString(), 302);
      }

      // Admin API — Bearer token or session auth
      if ((path.startsWith("/api/sites/") && method !== "GET") || path === "/api/sites/pending" || path.startsWith("/api/admin/")) {
        const bearer = request.headers.get("Authorization")?.replace("Bearer ", "");
        const sessionOk = await hasValidSession(request, env);
        if (bearer !== env.ADMIN_TOKEN && !sessionOk) {
          return addCorsHeaders(Res.error("Unauthorized", 401));
        }
      }

      // Wire dependencies
      const siteRepo = new D1SiteRepository(env.DB);
      const categoryRepo = new D1CategoryRepository(env.DB);
      const settingsRepo = new D1SettingsRepository(env.DB);
      const publisher = new KVPublisher(env.DB, env.KV, settingsRepo);

      const sitesHandler = createSitesHandler(siteRepo, categoryRepo);
      const categoriesHandler = createCategoriesHandler(categoryRepo);
      const adminHandler = createAdminHandler(siteRepo, publisher);
      const adminPages = createAdminPages(siteRepo, categoryRepo, settingsRepo);

      // Register routes
      const router = new Router();
      router.add("GET", "/api/nav", async (ctx) => {
        const data = await ctx.env.KV.get("nav:sites.json");
        if (!data) return Res.json({ site: DEFAULT_SETTINGS, categories: [], generatedAt: null, totalSites: 0 });
        return new Response(data, { headers: { "Content-Type": "application/json" } });
      });
      router.add("POST", "/api/sites", sitesHandler.create, rateLimitMiddleware);
      router.add("GET", "/api/sites", sitesHandler.list);
      router.add("GET", "/api/categories", categoriesHandler.list);
      router.add("GET", "/api/sites/pending", adminHandler.listPending);
      router.add("PUT", "/api/sites/:id", adminHandler.update);
      router.add("DELETE", "/api/sites/:id", adminHandler.delete);
      router.add("POST", "/api/sites/publish", adminHandler.publish);
      router.add("POST", "/api/admin/settings", async (ctx) => {
        const f = await parseFields(ctx.request);
        const title = f.title?.trim() || "";
        const description = f.description?.trim() || "";
        const logoText = f.logoText?.trim() || "";
        if (!title) {
          ctx.logger.warn("settings_rejected", { reason: "empty_title" });
          return Res.error("站点名称不能为空");
        }

        await settingsRepo.save({ title, description, logoText: logoText || title });
        ctx.logger.info("settings_saved", { title });
        return Res.json({ success: true, message: "已保存，点「发布」后生效" });
      });

      // Admin HTML pages (auth already checked above)
      router.add("GET", "/admin", adminPages.dashboard);
      router.add("GET", "/admin/pending", adminPages.pending);
      router.add("GET", "/admin/sites", adminPages.sitesList);
      router.add("GET", "/admin/categories", adminPages.categoriesList);
      router.add("GET", "/admin/add", adminPages.addSite);
      router.add("GET", "/admin/settings", adminPages.settings);

      // Admin direct add site (auto-approved)
      router.add("POST", "/api/admin/categories", async (ctx) => {
        const f = await parseFields(ctx.request);
        const name = f.name || "";
        const slug = f.slug || "";
        const icon = f.icon || "";
        const description = f.description || "";
        const sort_order = Number(f.sort_order) || 0;
        const parent_id = f.parent_id || "";
        if (!name || !slug) {
          ctx.logger.warn("category_rejected", { reason: "missing_name_or_slug" });
          return Res.error("name and slug are required");
        }

        const id = crypto.randomUUID();
        const parentId = parent_id || null;
        await ctx.env.DB.prepare(
          "INSERT INTO categories (id, name, slug, icon, description, sort_order, parent_id, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(id, name, slug, icon, description, sort_order, parentId, "single").run();

        // 作为子分类时，把父分类标记为 tabs
        if (parentId) {
          await ctx.env.DB.prepare("UPDATE categories SET type = 'tabs' WHERE id = ?").bind(parentId).run();
        }

        ctx.logger.info("category_added", { id, name, parent_id: parentId });
        return Res.json({ success: true, message: `已添加分类: ${name}`, id });
      });

      router.add("DELETE", "/api/admin/categories/:id", async (ctx) => {
        const id = ctx.params.id;

        // 有子分类的父分类不允许直接删除，需先删空子分类
        const childCount = await ctx.env.DB.prepare(
          "SELECT COUNT(*) as n FROM categories WHERE parent_id = ?"
        ).bind(id).first<{ n: number }>();
        if (childCount && childCount.n > 0) {
          return Res.error("该分类下还有子分类，请先删除子分类");
        }

        // 分类下还有网站时不允许删除（外键约束会失败）
        const siteCount = await ctx.env.DB.prepare(
          "SELECT COUNT(*) as n FROM sites WHERE category_id = ?"
        ).bind(id).first<{ n: number }>();
        if (siteCount && siteCount.n > 0) {
          return Res.error("该分类下还有网站，请先移除或删除网站");
        }

        const row = await ctx.env.DB.prepare("SELECT parent_id FROM categories WHERE id = ?")
          .bind(id).first<{ parent_id: string | null }>();
        const parentId = row?.parent_id || null;

        await ctx.env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();

        // 若删除的是子分类且父分类已无其他子分类，把父分类恢复为 single
        if (parentId) {
          const remain = await ctx.env.DB.prepare(
            "SELECT COUNT(*) as n FROM categories WHERE parent_id = ?"
          ).bind(parentId).first<{ n: number }>();
          if (remain && remain.n === 0) {
            await ctx.env.DB.prepare("UPDATE categories SET type = 'single' WHERE id = ?").bind(parentId).run();
          }
        }

        ctx.logger.info("category_deleted", { id });
        return Res.json({ success: true, message: "分类已删除" });
      });

      router.add("POST", "/api/admin/sites", async (ctx) => {
        const f = await parseFields(ctx.request);
        const title = f.title || "";
        const url = f.url || "";
        const description = f.description || "";
        const category_id = f.category_id || "";
        const logo = f.logo || "";
        const tagsRaw = f.tags || "";
        const featured = f.featured === "1" || f.featured === "true";

        const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];
        if (!title || !url || !description || !category_id) {
          ctx.logger.warn("admin_site_rejected", { reason: "missing_required_fields" });
          return Res.error("Missing required fields");
        }

        const id = crypto.randomUUID();
        await ctx.env.DB.prepare(
          `INSERT INTO sites (id, title, url, description, logo, category_id, tags, status, featured, reviewed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?, datetime('now'))`
        ).bind(id, title, url, description, logo, category_id, JSON.stringify(tags), featured ? 1 : 0).run();

        ctx.logger.info("admin_site_added", { siteId: id, title });
        return Res.json({ success: true, message: `已添加: ${title}`, id });
      });

      const ctx: RouteContext = { request, env, params: {}, url, logger };
      const response = await router.handle(ctx);
      return addCorsHeaders(response || Res.notFound());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal error";
      const stack = e instanceof Error ? e.stack : undefined;
      logger.error("unhandled", { error: msg, stack });
      // 对外只返回泛化消息 + requestId，内部细节仅进日志
      return addCorsHeaders(Res.json({ error: "Internal server error", requestId }, 500));
    }
  },
} satisfies ExportedHandler<Env>;
