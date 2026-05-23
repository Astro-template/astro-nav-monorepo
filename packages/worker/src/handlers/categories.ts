import type { RouteContext } from "../router";
import type { ICategoryRepository } from "../repositories";
import { Res } from "../middleware";

export function createCategoriesHandler(categories: ICategoryRepository) {
  return {
    async list(ctx: RouteContext): Promise<Response> {
      const results = await categories.listAll();
      ctx.logger.info("categories_listed", { count: results.length });
      return Res.json({ categories: results });
    },
  };
}
