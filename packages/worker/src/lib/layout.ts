import Mustache from "mustache";
import layoutTemplate from "../templates/layout.mustache";

export function layout(title: string, content: string): Response {
  const html = Mustache.render(layoutTemplate, { title, content });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
