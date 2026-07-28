/**
 * 统一请求体解析：兼容 application/json 与 form 提交，
 * 把所有字段规整为字符串，屏蔽 `as string` 裸断言。
 */
export async function parseFields(request: Request): Promise<Record<string, string>> {
  const ct = request.headers.get("Content-Type") || "";
  const out: Record<string, string> = {};

  if (ct.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (body) {
      for (const [k, v] of Object.entries(body)) {
        out[k] = v == null ? "" : String(v);
      }
    }
  } else {
    const form = await request.formData();
    for (const [k, v] of form.entries()) {
      out[k] = typeof v === "string" ? v : "";
    }
  }

  return out;
}
