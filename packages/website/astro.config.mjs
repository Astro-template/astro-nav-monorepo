import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// 部署域名，用于 canonical 链接和 sitemap。换域名时设 SITE_URL 环境变量，不用改代码。
const site = process.env.SITE_URL || "https://astro-nav.pages.dev";

// https://astro.build/config
export default defineConfig({
  site,

  output: "static",
  publicDir: "./static",
  compressHTML: true,

  integrations: [
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],

  build: {
    assets: "_astro",
    inlineStylesheets: "auto",
    format: "directory",
  },

  server: {
    port: 4321,
    open: false,
  },

  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: "esbuild",
      cssCodeSplit: true,
      target: "es2020",
    },
    // config.json 体积较大，stringify 后由 JSON.parse 解析比生成对象字面量更快
    json: { stringify: true },
  },
});
