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

### 数据库迁移

```bash
npx wrangler d1 execute astro-nav-db --remote --file=./migrations/0001_init.sql
npx wrangler d1 execute astro-nav-db --remote --file=./migrations/0002_v2_schema.sql
```

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
