import Mustache from "mustache";
import type { Env } from "../types";
import { KV_PREFIX, TTL } from "../constants";
import loginTemplate from "../templates/login.mustache";

const SESSION_COOKIE = "session";

export function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/session=([^;]+)/);
  return match?.[1] || null;
}

export async function hasValidSession(request: Request, env: Env): Promise<boolean> {
  const token = getSessionToken(request);
  if (!token) return false;
  const stored = await env.KV.get(`${KV_PREFIX.SESSION}${token}`);
  return Boolean(stored);
}

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  if (request.method === "GET") {
    return renderLogin();
  }

  const form = await request.formData();
  const user = (form.get("user") as string) || "";
  const pass = (form.get("pass") as string) || "";

  if (user !== env.ADMIN_USER || pass !== env.ADMIN_TOKEN) {
    return renderLogin('<div class="alert alert-error mt-4">用户名或密码错误</div>', 401);
  }

  const token = crypto.randomUUID();
  await env.KV.put(`${KV_PREFIX.SESSION}${token}`, user, { expirationTtl: TTL.SESSION });

  const isLocal = new URL(request.url).hostname === "localhost";
  const flags = isLocal
    ? `Path=/; HttpOnly; Max-Age=${TTL.SESSION}`
    : `Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL.SESSION}`;

  return new Response(null, {
    status: 303,
    headers: { Location: "/admin", "Set-Cookie": `${SESSION_COOKIE}=${token}; ${flags}` },
  });
}

export function handleLogout(): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: "/login", "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0` },
  });
}

function renderLogin(error = "", status = 200): Response {
  const html = Mustache.render(loginTemplate, { error });
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
