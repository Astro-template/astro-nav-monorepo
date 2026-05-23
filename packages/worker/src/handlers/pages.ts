import type { RouteContext } from "../router";
import type { ISiteRepository, ICategoryRepository } from "../repositories";
import { layout } from "../lib/layout";
import { renderPending, renderSites, renderCategories, renderAddSite } from "../views/admin";

export function createAdminPages(sites: ISiteRepository, categories: ICategoryRepository) {
  return {
    async dashboard(ctx: RouteContext): Promise<Response> {
      const pending = await sites.listPending();
      ctx.logger.info("admin_dashboard", { pendingCount: pending.length });
      return layout("仪表盘", renderPending(pending, 0));
    },

    async pending(ctx: RouteContext): Promise<Response> {
      const pending = await sites.listPending();
      ctx.logger.info("admin_pending", { pendingCount: pending.length });
      return layout("待审核", renderPending(pending, 0));
    },

    async sitesList(ctx: RouteContext): Promise<Response> {
      const { sites: allSites } = await sites.listApproved({ limit: 100 });
      ctx.logger.info("admin_sites", { count: allSites.length });
      return layout("所有网站", renderSites(allSites));
    },

    async categoriesList(ctx: RouteContext): Promise<Response> {
      const cats = await categories.listAll();
      ctx.logger.info("admin_categories", { count: cats.length });
      return layout("分类管理", renderCategories(cats));
    },

    async addSite(ctx: RouteContext): Promise<Response> {
      const cats = await categories.listAll();
      ctx.logger.info("admin_add_site");
      return layout("添加网站", renderAddSite(cats));
    },
  };
}
