import type { Env } from "./types";
import type { Logger } from "./logger";

export interface RouteContext {
  request: Request;
  env: Env;
  params: Record<string, string>;
  url: URL;
  logger: Logger;
}

export type Handler = (ctx: RouteContext) => Promise<Response>;
export type Middleware = (ctx: RouteContext, next: Handler) => Promise<Response>;

interface Route {
  method: string;
  pattern: URLPattern;
  handler: Handler;
  middlewares: Middleware[];
}

export interface IRouter {
  add(method: string, path: string, handler: Handler, ...middlewares: Middleware[]): void;
  handle(ctx: RouteContext): Promise<Response | null>;
}

export class Router implements IRouter {
  private routes: Route[] = [];

  add(method: string, path: string, handler: Handler, ...middlewares: Middleware[]): void {
    this.routes.push({
      method,
      pattern: new URLPattern({ pathname: path }),
      handler,
      middlewares,
    });
  }

  async handle(ctx: RouteContext): Promise<Response | null> {
    for (const route of this.routes) {
      if (route.method !== ctx.request.method) continue;
      const match = route.pattern.exec({ pathname: ctx.url.pathname });
      if (!match) continue;

      ctx.params = (match.pathname.groups as Record<string, string>) || {};

      // Chain middlewares then handler
      let fn = route.handler;
      for (let i = route.middlewares.length - 1; i >= 0; i--) {
        const mw = route.middlewares[i];
        const next = fn;
        fn = (c) => mw(c, next);
      }
      return fn(ctx);
    }

    return null;
  }
}
