# @astro-nav/website

用户导航网站包 - 提供导航、搜索和网站详情功能。

## 功能

- 导航网站展示
- 搜索功能
- 网站详情页
- 网站提交表单

## 开发

```bash
# 启动开发服务器（端口 4321）
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview

# 类型检查
pnpm type-check
```

## 依赖

- `@astro-nav/shared` - 共享类型和工具函数
- `astro` - Astro 框架
- `@astrojs/sitemap` - Sitemap 生成

## 配置

构建前 `scripts/sync-config.ts` 会从 Worker 的 `/api/nav` 拉取导航数据，生成 `static/config.json`（前端唯一数据源）。未配置 `PUBLIC_API_URL` 时沿用现有 `config.json`。
