/**
 * 结构化日志 — JSON 格式，wrangler tail 友好。
 */

export interface LogFields {
  [key: string]: string | number | boolean | null | undefined;
}

export interface Logger {
  info(msg: string, fields?: LogFields): void;
  warn(msg: string, fields?: LogFields): void;
  error(msg: string, fields?: LogFields): void;
}

export interface RequestContext {
  requestId: string;
  method: string;
  path: string;
  ip: string;
}

export function createLogger(ctx: RequestContext): Logger {
  const base: LogFields = { rid: ctx.requestId, method: ctx.method, path: ctx.path, ip: ctx.ip };

  function emit(level: "info" | "warn" | "error", msg: string, fields?: LogFields): void {
    console[level](JSON.stringify({ ts: Date.now(), level, msg, ...base, ...fields }));
  }

  return {
    info: (msg, fields) => emit("info", msg, fields),
    warn: (msg, fields) => emit("warn", msg, fields),
    error: (msg, fields) => emit("error", msg, fields),
  };
}
