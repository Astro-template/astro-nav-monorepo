import type { RouteContext } from "../router";
import type { ICategoryRepository, ISiteRepository } from "../repositories";
import { Res } from "../middleware";
import { parseFields } from "../lib/request";

export function createCategoriesHandler(categories: ICategoryRepository, sites: ISiteRepository) {
  return {
    async list(ctx: RouteContext): Promise<Response> {
      const results = await categories.listAll();
      ctx.logger.info("categories_listed", { count: results.length });
      return Res.json({ categories: results });
    },

    async create(ctx: RouteContext): Promise<Response> {
      const f = await parseFields(ctx.request);
      const name = f.name || "";
      const slug = f.slug || "";
      if (!name || !slug) {
        ctx.logger.warn("category_rejected", { reason: "missing_name_or_slug" });
        return Res.error("name and slug are required");
      }

      const parentId = f.parent_id || null;
      const id = await categories.create({
        name,
        slug,
        icon: f.icon,
        description: f.description,
        sort_order: Number(f.sort_order) || 0,
        parent_id: parentId,
      });

      // 有了子分类，父分类才需要渲染成 tabs
      if (parentId) await categories.setType(parentId, "tabs");

      ctx.logger.info("category_added", { id, name, parent_id: parentId });
      return Res.json({ success: true, message: `已添加分类: ${name}`, id });
    },

    async delete(ctx: RouteContext): Promise<Response> {
      const id = ctx.params.id;

      if ((await categories.countChildren(id)) > 0) {
        return Res.error("该分类下还有子分类，请先删除子分类");
      }
      // 分类下还有网站时外键约束会失败，提前给出可读错误
      if ((await sites.countByCategory(id)) > 0) {
        return Res.error("该分类下还有网站，请先移除或删除网站");
      }

      const existing = await categories.findById(id);
      if (!existing) return Res.notFound("分类不存在");

      await categories.delete(id);

      // 父分类已无子分类时恢复为 single
      const parentId = existing.parent_id;
      if (parentId && (await categories.countChildren(parentId)) === 0) {
        await categories.setType(parentId, "single");
      }

      ctx.logger.info("category_deleted", { id });
      return Res.json({ success: true, message: "分类已删除" });
    },
  };
}
