# AGENTS.md

astro-nav-monorepo — pnpm monorepo，Affiliate 导航站。

## 架构

```
packages/
├── shared/    # 类型定义 + 工具函数
├── website/   # Astro 前端（Cloudflare Pages）
└── worker/    # Cloudflare Worker API + D1 + KV + 管理后台
```

## 开发

```bash
pnpm install && pnpm build
```

## 部署后端（Worker）

```bash
cd packages/worker
npx wrangler deploy
```

线上地址：https://astro-nav-api.ouraihub.workers.dev
后台登录：https://astro-nav-api.ouraihub.workers.dev/login（kiro / admin）

D1 数据库名：astro-nav-db
KV namespace binding：KV

### 数据库：两步，先建表再灌数据

**结构（migrations）和内容（seeds）是分开的，顺序不能反。**

**第 1 步 — 建表（必跑）。** `migrations/` 只含表结构：`0001` 建 v1 表 → `0002` DROP 重建为 v2 结构（以它为准）→ `0004` 站点设置表。`db:migrate` 不再包含任何数据。

```bash
pnpm --filter @astro-nav/worker db:migrate:remote   # 线上库
pnpm --filter @astro-nav/worker db:migrate:local    # 本地库
```

**第 2 步 — 灌一套导航数据（seeds，二选一）。** `seeds/` 下每个文件是一整套导航内容，**开头都会 `DELETE FROM sites/categories` 整站替换，互斥，绝不能同时跑**：

```bash
# A) Affiliate 导航（16 分类 / 167 站点，带 advantages/details）
pnpm --filter @astro-nav/worker db:seed:aff:remote     # 或 :local

# B) 老王导航 nav.eooce.com（16 分类 / 269 站点）
pnpm --filter @astro-nav/worker db:seed:eooce:remote   # 或 :local
```

> ⚠️ 部署者注意：`db:migrate` 只建表、灌完是空库；必须再选一个 `db:seed:*` 才有数据。**不要**把两个 seed 都跑——后跑的会清空先跑的。想换数据集，直接重跑另一个 seed 即可（它自带清空）。新增导航数据集时，在 `seeds/` 加文件并配一对 `db:seed:<名字>:local|remote` 脚本，不要写进 `migrations/`。

### 发布数据到 KV（让前端能读到最新数据）

```bash
curl -X POST https://astro-nav-api.ouraihub.workers.dev/api/sites/publish -H "Authorization: Bearer admin"
```

## 部署前端（Pages）

```bash
cd packages/website
echo "PUBLIC_API_URL=https://astro-nav-api.ouraihub.workers.dev" > .env
npx astro build
npx wrangler pages deploy dist --project-name=astro-nav --commit-dirty=true
```

线上地址：https://astro-nav.pages.dev

### 完整更新流程（改了数据后）

1. 后台添加/修改网站
2. 点「发布」或执行 publish API
3. 重新构建前端并部署（上面的 3 条命令）

## 环境变量

### Worker（wrangler.toml [vars]）

| 变量 | 值 | 说明 |
|------|---|------|
| ADMIN_USER | kiro | 后台用户名 |
| ADMIN_TOKEN | admin | 后台密码 |
| TURNSTILE_SECRET | 1x000...AA | Turnstile 测试密钥 |

### Website（.env）

| 变量 | 值 | 说明 |
|------|---|------|
| PUBLIC_API_URL | https://astro-nav-api.ouraihub.workers.dev | Worker API 地址 |

## 文件放置规范（严格遵守）

| 路径 | 允许放什么 |
|------|-----------| 
| `packages/*/src/` | 各包源码 |
| `docs/` | 设计文档 |

**根目录允许的文件（不得新增）：**

```
package.json, pnpm-lock.yaml, pnpm-workspace.yaml, turbo.json, README.md, .gitignore, CLAUDE.md, AGENTS.md
```

**绝对禁止：**

- ❌ 创建新 package（除非明确要求）
- ❌ 在 `packages/` 外放源码
- ❌ 创建新顶层目录
