import type { RouteContext } from "../router";
import type { UpdateSiteBody } from "../types";
import type { ISiteRepository, IPublisher, ISettingsRepository } from "../repositories";
import { Res } from "../middleware";
import { parseFields } from "../lib/request";

export function createAdminHandler(
  sites: ISiteRepository,
  publisher: IPublisher,
  settings: ISettingsRepository
) {
  return {
    async listPending(ctx: RouteContext): Promise<Response> {
      const results = await sites.listPending();
      ctx.logger.info("pending_listed", { count: results.length });
      return Res.json({ sites: results });
    },

    async update(ctx: RouteContext): Promise<Response> {
      const id = ctx.params.id;
      const body = (await ctx.request.json().catch(() => null)) as UpdateSiteBody | null;
      if (!body) return Res.error("Invalid JSON body");

      const existing = await sites.findById(id);
      if (!existing) return Res.notFound("Site not found");

      await sites.update(id, body);
      ctx.logger.info("site_updated", { siteId: id, status: body.status });
      return Res.json({ message: "Updated" });
    },

    async delete(ctx: RouteContext): Promise<Response> {
      const id = ctx.params.id;
      const existing = await sites.findById(id);
      if (!existing) return Res.notFound("Site not found");

      await sites.delete(id);
      ctx.logger.info("site_deleted", { siteId: id });
      return Res.json({ message: "Deleted" });
    },

    async publish(ctx: RouteContext): Promise<Response> {
      const navData = await publisher.publish();
      ctx.logger.info("published", { totalSites: navData.totalSites });
      return Res.json({ message: "发布成功", totalSites: navData.totalSites });
    },

    /** 后台直接录入，跳过审核直接 approved */
    async createSite(ctx: RouteContext): Promise<Response> {
      const f = await parseFields(ctx.request);
      const title = f.title || "";
      const url = f.url || "";
      const description = f.description || "";
      const category_id = f.category_id || "";
      if (!title || !url || !description || !category_id) {
        ctx.logger.warn("admin_site_rejected", { reason: "missing_required_fields" });
        return Res.error("Missing required fields");
      }

      const id = await sites.createApproved({
        title,
        url,
        description,
        category_id,
        logo: f.logo,
        tags: f.tags ? f.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        featured: f.featured === "1" || f.featured === "true",
      });

      ctx.logger.info("admin_site_added", { siteId: id, title });
      return Res.json({ success: true, message: `已添加: ${title}`, id });
    },

    async saveSettings(ctx: RouteContext): Promise<Response> {
      const f = await parseFields(ctx.request);
      const title = f.title?.trim() || "";
      if (!title) {
        ctx.logger.warn("settings_rejected", { reason: "empty_title" });
        return Res.error("站点名称不能为空");
      }

      const description = f.description?.trim() || "";
      const logoText = f.logoText?.trim() || title;
      await settings.save({ title, description, logoText });
      ctx.logger.info("settings_saved", { title });
      return Res.json({ success: true, message: "已保存，点「发布」后生效" });
    },
  };
}
