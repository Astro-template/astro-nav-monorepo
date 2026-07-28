import type { Env } from "./types";
import { DEFAULT_SETTINGS } from "./constants";
import { createLogger } from "./logger";
import { Router } from "./router";
import type { RouteContext } from "./router";
import { addCorsHeaders, authMiddleware, rateLimitMiddleware, Res } from "./middleware";
import { D1SiteRepository, D1CategoryRepository, D1SettingsRepository, KVPublisher } from "./repositories";
import { createSitesHandler } from "./handlers/sites";
import { createCategoriesHandler } from "./handlers/categories";
import { createAdminHandler } from "./handlers/admin";
import { createAdminPages } from "./handlers/pages";
import { handleLogin, handleLogout } from "./services/auth";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return addCorsHeaders(new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);
    const requestId = crypto.randomUUID();
    const logger = createLogger({
      requestId,
      method: request.method,
      path: url.pathname,
      ip: request.headers.get("CF-Connecting-IP") || "unknown",
    });

    try {
      const siteRepo = new D1SiteRepository(env.DB);
      const categoryRepo = new D1CategoryRepository(env.DB);
      const settingsRepo = new D1SettingsRepository(env.DB);
      const publisher = new KVPublisher(env.DB, env.KV, settingsRepo);

      const sitesHandler = createSitesHandler(siteRepo, categoryRepo);
      const categoriesHandler = createCategoriesHandler(categoryRepo, siteRepo);
      const adminHandler = createAdminHandler(siteRepo, publisher, settingsRepo);
      const adminPages = createAdminPages(siteRepo, categoryRepo, settingsRepo);

      const router = new Router();

      // 公开路由
      router.add("GET", "/login", (ctx) => handleLogin(ctx.request, ctx.env));
      router.add("POST", "/login", (ctx) => handleLogin(ctx.request, ctx.env));
      router.add("GET", "/logout", async () => handleLogout());
      router.add("POST", "/logout", async () => handleLogout());
      router.add("GET", "/api/nav", async (ctx) => {
        const data = await ctx.env.KV.get("nav:sites.json");
        if (!data) return Res.json({ site: DEFAULT_SETTINGS, categories: [], generatedAt: null, totalSites: 0 });
        return new Response(data, { headers: { "Content-Type": "application/json" } });
      });
      router.add("GET", "/api/sites", sitesHandler.list);
      router.add("GET", "/api/categories", categoriesHandler.list);
      router.add("POST", "/api/sites", sitesHandler.create, rateLimitMiddleware);

      // 需要认证：Bearer token 或后台会话，由 authMiddleware 统一判定
      router.add("GET", "/api/sites/pending", adminHandler.listPending, authMiddleware);
      router.add("PUT", "/api/sites/:id", adminHandler.update, authMiddleware);
      router.add("DELETE", "/api/sites/:id", adminHandler.delete, authMiddleware);
      router.add("POST", "/api/sites/publish", adminHandler.publish, authMiddleware);
      router.add("POST", "/api/admin/sites", adminHandler.createSite, authMiddleware);
      router.add("POST", "/api/admin/settings", adminHandler.saveSettings, authMiddleware);
      router.add("POST", "/api/admin/categories", categoriesHandler.create, authMiddleware);
      router.add("DELETE", "/api/admin/categories/:id", categoriesHandler.delete, authMiddleware);

      router.add("GET", "/admin", adminPages.dashboard, authMiddleware);
      router.add("GET", "/admin/pending", adminPages.pending, authMiddleware);
      router.add("GET", "/admin/sites", adminPages.sitesList, authMiddleware);
      router.add("GET", "/admin/categories", adminPages.categoriesList, authMiddleware);
      router.add("GET", "/admin/add", adminPages.addSite, authMiddleware);
      router.add("GET", "/admin/settings", adminPages.settings, authMiddleware);

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
