import type { RouteContext } from "../router";
import type { CreateSiteBody } from "../types";
import type { ISiteRepository, ICategoryRepository } from "../repositories";
import { Res } from "../middleware";
import { LIMITS } from "../constants";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = await res.json() as { success: boolean };
  return data.success;
}

export function createSitesHandler(sites: ISiteRepository, categories: ICategoryRepository) {
  return {
    async create(ctx: RouteContext): Promise<Response> {
      const body = await ctx.request.json().catch(() => null);
      const { data, error } = validateCreateSite(body);
      if (error || !data) return Res.error(error || "Invalid body");

      // Verify Turnstile token
      const token = (body as Record<string, unknown>)?.turnstile_token;
      if (!token || typeof token !== "string") return Res.error("Turnstile verification required");
      const turnstileOk = await verifyTurnstile(token, ctx.env.TURNSTILE_SECRET, ctx.request.headers.get("CF-Connecting-IP") || "");
      if (!turnstileOk) return Res.error("Turnstile verification failed", 403);

      const existing = await sites.findByUrl(data.url);
      if (existing) return Res.error("This URL has already been submitted", 409);

      const cat = await categories.findById(data.category_id);
      if (!cat) return Res.error("Invalid category_id");

      const id = await sites.create(data);
      ctx.logger.info("site_submitted", { siteId: id, url: data.url });
      return Res.json({ id, message: "提交成功，等待审核" }, 201);
    },

    async list(ctx: RouteContext): Promise<Response> {
      const category = ctx.url.searchParams.get("category") || undefined;
      const featured = ctx.url.searchParams.get("featured") === "true";
      const limit = Math.min(
        parseInt(ctx.url.searchParams.get("limit") || String(LIMITS.DEFAULT_LIST_LIMIT), 10),
        LIMITS.MAX_LIST_LIMIT
      );

      const result = await sites.listApproved({ category, featured, limit });
      return Res.json(result);
    },
  };
}

// --- Validation ---

function validateCreateSite(body: unknown): { data?: CreateSiteBody; error?: string } {
  if (!body || typeof body !== "object") return { error: "Invalid JSON body" };
  const b = body as Record<string, unknown>;

  if (!b.title || typeof b.title !== "string") return { error: "title is required" };
  if (!b.url || typeof b.url !== "string") return { error: "url is required" };
  if (!b.description || typeof b.description !== "string") return { error: "description is required" };
  if (!b.category_id || typeof b.category_id !== "string") return { error: "category_id is required" };

  try { new URL(b.url as string); } catch { return { error: "Invalid url format" }; }

  const desc = b.description as string;
  if (desc.length < LIMITS.MIN_DESCRIPTION_LENGTH || desc.length > LIMITS.MAX_DESCRIPTION_LENGTH) {
    return { error: `description must be ${LIMITS.MIN_DESCRIPTION_LENGTH}-${LIMITS.MAX_DESCRIPTION_LENGTH} chars` };
  }

  return {
    data: {
      title: (b.title as string).slice(0, LIMITS.MAX_TITLE_LENGTH),
      url: b.url as string,
      description: desc,
      category_id: b.category_id as string,
      logo: typeof b.logo === "string" ? b.logo : undefined,
      tags: Array.isArray(b.tags) ? b.tags.filter((t): t is string => typeof t === "string") : undefined,
      submitter_name: typeof b.submitter_name === "string" ? b.submitter_name : undefined,
      submitter_email: typeof b.submitter_email === "string" ? b.submitter_email : undefined,
      submitter_reason: typeof b.submitter_reason === "string" ? b.submitter_reason : undefined,
    },
  };
}
