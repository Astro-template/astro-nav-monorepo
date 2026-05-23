import type { RouteContext } from "../router";
import type { UpdateSiteBody } from "../types";
import type { ISiteRepository, IPublisher } from "../repositories";
import { Res } from "../middleware";

export function createAdminHandler(sites: ISiteRepository, publisher: IPublisher) {
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
  };
}
