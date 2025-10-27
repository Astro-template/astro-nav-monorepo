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

配置文件在构建前会自动从 `@astro-nav/shared/config` 同步到 `static/` 目录。
