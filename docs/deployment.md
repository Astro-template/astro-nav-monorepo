# 部署指南

## 前置条件

- Node.js 18+
- pnpm 8+
- Cloudflare 账号（已登录 `wrangler`）

```bash
# 验证 wrangler 登录状态
cd packages/worker && npx wrangler whoami
```

---

## 后端部署（Worker API）

### 首次部署

```bash
# 1. 创建 D1 数据库
npx wrangler d1 create astro-nav-db

# 2. 创建 KV namespace
npx wrangler kv namespace create NAV_KV

# 3. 更新 wrangler.toml 中的 database_id 和 KV id

# 4. 执行数据库迁移
npx wrangler d1 execute astro-nav-db --remote --file=./migrations/0001_init.sql
npx wrangler d1 execute astro-nav-db --remote --file=./migrations/0002_v2_schema.sql

# 5. 部署 Worker
npx wrangler deploy
```

### 日常更新

```bash
cd packages/worker
npx wrangler deploy
```

### 线上地址

- API：https://astro-nav-api.ouraihub.workers.dev
- 后台：https://astro-nav-api.ouraihub.workers.dev/login
- 账号：kiro / admin

### 环境变量（wrangler.toml）

| 变量 | 说明 |
|------|------|
| ADMIN_USER | 后台用户名 |
| ADMIN_TOKEN | 后台密码 |
| TURNSTILE_SECRET | Turnstile 验证密钥 |

---

## 前端部署（Cloudflare Pages）

### 首次部署

```bash
cd packages/website

# 1. 创建 .env 文件
echo "PUBLIC_API_URL=https://astro-nav-api.ouraihub.workers.dev" > .env

# 2. 构建
npx astro build

# 3. 创建 Pages 项目并部署
npx wrangler pages project create astro-nav --production-branch main
npx wrangler pages deploy dist --project-name=astro-nav --commit-dirty=true
```

### 日常更新

```bash
cd packages/website
npx astro build
npx wrangler pages deploy dist --project-name=astro-nav --commit-dirty=true
```

### 线上地址

- https://astro-nav.pages.dev

---

## 数据管理

### 发布网站数据到前端

后台操作：登录后台 → 点侧边栏「🚀 发布」按钮

或命令行：
```bash
curl -X POST https://astro-nav-api.ouraihub.workers.dev/api/sites/publish \
  -H "Authorization: Bearer admin"
```

发布后需要重新构建前端才能看到更新：
```bash
cd packages/website && npx astro build && npx wrangler pages deploy dist --project-name=astro-nav --commit-dirty=true
```

### 导入数据

```bash
# 从 SQL 文件导入
cd packages/worker
npx wrangler d1 execute astro-nav-db --remote --file=./path/to/data.sql
```

---

## 本地开发

```bash
# 后端
cd packages/worker
npx wrangler d1 execute astro-nav-db --local --file=./migrations/0001_init.sql
npx wrangler dev --port 8787

# 前端
cd packages/website
npx astro dev
```
