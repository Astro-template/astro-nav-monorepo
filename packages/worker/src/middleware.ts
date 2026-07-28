import type { RouteContext, Handler } from "./router";
import { KV_PREFIX, TTL, LIMITS } from "./constants";
import { hasValidSession } from "./services/auth";

/**
 * Response factory — eliminates repetitive Response construction.
 */
export const Res = {
  json: (data: unknown, status = 200): Response =>
    new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } }),

  error: (message: string, status = 400): Response =>
    Res.json({ error: message }, status),

  notFound: (message = "Not found"): Response =>
    Res.error(message, 404),
} as const;

export function addCorsHeaders(res: Response): Response {
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  return new Response(res.body, { status: res.status, headers });
}

export async function authMiddleware(ctx: RouteContext, next: Handler): Promise<Response> {
  // Bearer token (API clients)
  const bearer = ctx.request.headers.get("Authorization")?.replace("Bearer ", "");
  if (bearer === ctx.env.ADMIN_TOKEN) return next(ctx);

  // Session cookie (browser)
  const valid = await hasValidSession(ctx.request, ctx.env);
  if (valid) return next(ctx);

  // Browser → redirect to login; API → 401
  const accept = ctx.request.headers.get("Accept") || "";
  if (accept.includes("text/html")) {
    return Response.redirect(new URL("/login", ctx.request.url).toString(), 302);
  }

  ctx.logger.warn("Unauthorized access attempt");
  return Res.error("Unauthorized", 401);
}

export async function rateLimitMiddleware(ctx: RouteContext, next: Handler): Promise<Response> {
  const ip = ctx.request.headers.get("CF-Connecting-IP") || "unknown";
  const key = `${KV_PREFIX.RATE_LIMIT}${ip}`;
  const val = await ctx.env.KV.get(key);
  const count = val ? parseInt(val, 10) : 0;

  if (count >= LIMITS.SUBMISSIONS_PER_HOUR) {
    ctx.logger.warn("Rate limit exceeded", { ip, count });
    return Res.error(`Rate limit exceeded. Max ${LIMITS.SUBMISSIONS_PER_HOUR} submissions per hour.`, 429);
  }

  await ctx.env.KV.put(key, String(count + 1), { expirationTtl: TTL.RATE_LIMIT });
  return next(ctx);
}
