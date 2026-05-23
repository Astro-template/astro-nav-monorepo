import type { Env } from "./types";
import { createLogger } from "./logger";
import { Router } from "./router";
import type { RouteContext } from "./router";
import { addCorsHeaders, rateLimitMiddleware, Res } from "./middleware";
import { D1SiteRepository, D1CategoryRepository, KVPublisher } from "./repositories";
import { createSitesHandler } from "./handlers/sites";
import { createCategoriesHandler } from "./handlers/categories";
import { createAdminHandler } from "./handlers/admin";
import { createAdminPages } from "./handlers/pages";
import { handleLogin, handleLogout, hasValidSession } from "./services/auth";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return addCorsHeaders(new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const logger = createLogger({
      requestId: crypto.randomUUID(),
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

      // Admin API — Bearer token auth
      if ((path.startsWith("/api/sites/") && method !== "GET") || (path === "/api/sites/pending")) {
        const bearer = request.headers.get("Authorization")?.replace("Bearer ", "");
        const sessionOk = await hasValidSession(request, env);
        if (bearer !== env.ADMIN_TOKEN && !sessionOk) {
          return addCorsHeaders(Res.error("Unauthorized", 401));
        }
      }

      // Wire dependencies
      const siteRepo = new D1SiteRepository(env.DB);
      const categoryRepo = new D1CategoryRepository(env.DB);
      const publisher = new KVPublisher(env.DB, env.KV);

      const sitesHandler = createSitesHandler(siteRepo, categoryRepo);
      const categoriesHandler = createCategoriesHandler(categoryRepo);
      const adminHandler = createAdminHandler(siteRepo, publisher);
      const adminPages = createAdminPages(siteRepo, categoryRepo);

      // Register routes
      const router = new Router();
      router.add("GET", "/api/nav", async (ctx) => {
        const data = await ctx.env.KV.get("nav:sites.json");
        if (!data) return Res.json({ categories: [], generatedAt: null, totalSites: 0 });
        return new Response(data, { headers: { "Content-Type": "application/json" } });
      });
      router.add("POST", "/api/sites", sitesHandler.create, rateLimitMiddleware);
      router.add("GET", "/api/sites", sitesHandler.list);
      router.add("GET", "/api/categories", categoriesHandler.list);
      router.add("GET", "/api/sites/pending", adminHandler.listPending);
      router.add("PUT", "/api/sites/:id", adminHandler.update);
      router.add("DELETE", "/api/sites/:id", adminHandler.delete);
      router.add("POST", "/api/sites/publish", adminHandler.publish);

      // Admin HTML pages (auth already checked above)
      router.add("GET", "/admin", adminPages.dashboard);
      router.add("GET", "/admin/pending", adminPages.pending);
      router.add("GET", "/admin/sites", adminPages.sitesList);
      router.add("GET", "/admin/categories", adminPages.categoriesList);

      const ctx: RouteContext = { request, env, params: {}, url, logger };
      const response = await router.handle(ctx);
      return addCorsHeaders(response || Res.notFound());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal error";
      logger.error("unhandled", { error: msg });
      return addCorsHeaders(Res.error(msg, 500));
    }
  },
} satisfies ExportedHandler<Env>;
