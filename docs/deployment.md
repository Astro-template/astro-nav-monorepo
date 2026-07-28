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

# 4a. 建表（migrations，只有表结构，灌完是空库）
pnpm db:migrate:remote

# 4b. 灌一套导航数据（seeds，二选一，互斥！不要都跑）
pnpm db:seed:aff:remote      # Affiliate 导航（167 站点）
# pnpm db:seed:eooce:remote  # 或：老王导航 nav.eooce.com（269 站点）

# 5. 注入云端密钥（只在部署时需要，本地开发不需要）
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put TURNSTILE_SECRET

# 6. 部署 Worker
npx wrangler deploy
```

> ⚠️ 第 4 步是两小步：`db:migrate` 只建表，必须再跑一个 `db:seed:*` 才有数据。两个 seed 互斥，后跑的会清空先跑的。
>
> ⚠️ 第 5 步不能跳过，也不能用 `.dev.vars` 代替 —— 那个文件只作用于本地 `wrangler dev`，不会上传。漏了这步，线上 `ADMIN_TOKEN` 为空，登录和写接口全部 401。

### 日常更新

```bash
cd packages/worker
npx wrangler deploy
```

### 线上地址

- API：https://astro-nav-api.ouraihub.workers.dev
- 后台：https://astro-nav-api.ouraihub.workers.dev/login
- 账号：`ADMIN_USER` / `ADMIN_TOKEN`（见下方环境变量，密钥用 `wrangler secret` 注入）

### 环境变量

| 变量 | 位置 | 说明 |
|------|------|------|
| ADMIN_USER | `wrangler.toml [vars]` | 后台用户名（非敏感） |
| ADMIN_TOKEN | **secret** | 后台密码 / API Bearer token |
| TURNSTILE_SECRET | **secret** | Turnstile 服务端密钥 |

前端还有两个可选变量（写 `packages/website/.env`）：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PUBLIC_API_URL | 空（读 `static/config.json`） | Worker API 地址，构建时取数用 |
| SITE_URL | https://astro-nav.pages.dev | 部署域名，用于 canonical 链接和 sitemap |

密钥不写进 `wrangler.toml`（那是明文且入库）。两套环境两个来源，别混：

| 环境 | 密钥来源 | 命令 |
|------|---------|------|
| 本地 `wrangler dev` | `packages/worker/.dev.vars`（gitignore） | `cp .dev.vars.example .dev.vars` 后改值 |
| 云端 Worker | Cloudflare secret | `npx wrangler secret put <NAME>` |

```bash
cd packages/worker

# 本地：只要这一步，不需要 wrangler login / secret put
cp .dev.vars.example .dev.vars

# 云端：部署前执行一次；改密码后需重新执行 + 重新 deploy
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put TURNSTILE_SECRET
```

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
  -H "Authorization: Bearer $ADMIN_TOKEN"
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

本地不碰云端，因此不需要 `wrangler login`，也不需要 `wrangler secret put`。

```bash
# 后端
cd packages/worker
cp .dev.vars.example .dev.vars   # 首次：改掉里面的 ADMIN_TOKEN，它就是后台登录密码
pnpm db:migrate:local        # 建表
pnpm db:seed:aff:local       # 灌数据（二选一，另一个是 db:seed:eooce:local）
npx wrangler dev --port 8787

# 前端
cd packages/website
npx astro dev
```
