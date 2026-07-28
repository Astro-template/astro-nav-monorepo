# 快速搭建一个导航网站

本文档面向「我想用这套代码，从零快速搭一个自己的导航站」的场景。跟着做，30 分钟能上线一个可用的导航网站。

## 这套系统是怎么运作的（先理解 5 分钟）

整个系统由 3 个部分组成，数据是**单向流动**的：

```
┌─────────────┐   点「发布」    ┌─────────────┐   前端 build    ┌─────────────┐
│  D1 数据库   │ ────────────▶ │  KV 快照     │ ────────────▶ │  静态网站    │
│ (后台管数据) │  全量生成JSON  │ nav:sites.json│  读JSON烤成HTML │ (用户访问)   │
└─────────────┘                └─────────────┘                └─────────────┘
     ▲
     │ 后台增删改
  你在这里操作
```

三个角色：

| 部分 | 是什么 | 跑在哪 |
|------|--------|--------|
| **Worker 后台** | 管理数据的网页后台 + API | Cloudflare Workers |
| **D1 + KV** | D1 存数据，KV 存「发布快照」 | Cloudflare 存储 |
| **Website 前端** | 用户看到的导航网站 | Cloudflare Pages |

**关键点**：
- 数据存在 D1，你在后台增删改。
- 点「发布」= 把 D1 里**已审核**的数据，全量生成一份 JSON 存进 KV（不是拼接，是覆盖）。
- 前端**构建时**读这份 JSON，烤成静态页。所以改完数据要「发布 + 重新构建前端」两步才能上线。
- 用户访问的是纯静态页 + CDN，速度极快，不实时查数据库。

---

## 第 0 步：前置准备

需要：

- Node.js 20+（推荐 LTS）
- pnpm 9+
- 一个 Cloudflare 账号（免费版即可）

```bash
# 安装依赖（在仓库根目录）
pnpm install
```

### 只在本地跑？不用登录 Cloudflare，也不用 wrangler secret

密钥有两个来源，**用哪个取决于你在哪跑**，别混：

| 场景 | 密钥放哪 | 要不要 `wrangler secret put` |
|------|---------|------------------------------|
| 本地开发（`wrangler dev`） | `packages/worker/.dev.vars` 文件（已 gitignore） | **不需要** |
| 部署到 Cloudflare | 云端 secret | 需要，见第 5 步 |

本地开发只需复制一份模板并改掉密码：

```bash
cd packages/worker
cp .dev.vars.example .dev.vars
# 打开 .dev.vars，把 ADMIN_TOKEN 改成你自己的本地密码（这就是后台登录密码）
```

打算部署到线上时，再登录 Cloudflare：

```bash
npx wrangler login
npx wrangler whoami   # 确认已登录
```

---

## 第 1 步：先在本地跑起来看效果（不碰线上）

强烈建议先本地跑通，熟悉整个流程，再部署到线上。

### 1.1 初始化本地数据库

```bash
cd packages/worker
# 本地库存在 .wrangler/state 目录，跟线上隔离。分两步：
# 第 1 步 建表（0001 建表 → 0002 升级 v2 → 0004 设置表）
pnpm db:migrate:local
# 第 2 步 灌一套数据（二选一，互斥，别都跑）
pnpm db:seed:aff:local        # Affiliate 导航（167 站点）
# pnpm db:seed:eooce:local    # 或：老王导航（269 站点）
```

### 1.2 启动后台

```bash
npx wrangler dev --port 8787
```

打开 http://localhost:8787/login 。用户名是 `wrangler.toml` 里的 `ADMIN_USER`（默认 `kiro`），密码是你刚才在 `.dev.vars` 里写的 `ADMIN_TOKEN`。

> 登录报「用户名或密码错误」？多半是没建 `.dev.vars`，或者密码填的不是 `.dev.vars` 里的 `ADMIN_TOKEN`。仓库里**不存在**默认密码，密钥不入库。

登录后能看到 6 个页面：仪表盘、添加网站、待审核、所有网站、分类管理、站点设置。

### 1.3 启动前端

另开一个终端：

```bash
cd packages/website
npx astro dev
```

打开 http://localhost:4321/ 。

> 注意：前端默认可能配了 `.env` 里的 `PUBLIC_API_URL` 指向线上后台。本地开发想让前端读**本地**数据，见第 4 步说明。

---

## 第 2 步：录入你的导航数据

数据模型很简单：**分类（categories）** 下面挂 **网站（sites）**。所以先建分类，再往分类里加网站。

### 2.1 先建分类

**方式 A：后台页面（推荐）** 打开 http://localhost:8787/admin/categories ，填名称、slug、图标即可，图标支持 mdi 搜索选择。

**方式 B：API（适合脚本批量）** 另开一个终端，先把密码放进环境变量（值就是 `.dev.vars` 里的 `ADMIN_TOKEN`）：

```bash
export ADMIN_TOKEN='你在 .dev.vars 里设的值'

# 建一个「云服务器」分类
curl -X POST http://localhost:8787/api/admin/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"云服务器","slug":"cloud","icon":"☁️","sort_order":1}'

# 再建一个「支付工具」
curl -X POST http://localhost:8787/api/admin/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"支付工具","slug":"payment","icon":"💳","sort_order":2}'
```

字段说明：`name` 显示名、`slug` URL 用的英文标识（唯一）、`icon` emoji 图标、`sort_order` 排序（小的在前）。

### 2.2 再加网站

**方式 A：后台表单（推荐，直观）**

打开 http://localhost:8787/admin/add ，填标题、URL、描述、选分类，提交。

**方式 B：API（适合脚本批量）**

```bash
curl -X POST http://localhost:8787/api/admin/sites \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"AWS","url":"https://aws.amazon.com","description":"亚马逊云服务","category_id":"<上一步返回的分类id>","status":"approved"}'
```

> ⚠️ **重要**：网站有个 `status` 字段，默认是 `pending`（待审核）。**只有 `approved`（已审核）的网站才会被发布到前端**。
> - 通过后台表单加的、用户提交的，通常是 `pending`，需要去「待审核」页面审核通过。
> - 你自己录入的可信数据，直接设 `status: "approved"` 省去审核。

---

## 第 3 步：发布

数据录好后，点「发布」把它们生成到 KV 快照：

```bash
curl -X POST http://localhost:8787/api/sites/publish \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

返回 `{"message":"发布成功","totalSites":N}`，N 是已审核网站数。

验证生成的数据：

```bash
curl http://localhost:8787/api/nav
```

能看到一份嵌套的 JSON（分类 → 网站），这就是前端要读的数据。

---

## 第 4 步：让前端读到你的数据

前端 `packages/website/src/utils/config.ts` 的取数逻辑：

- 若设了环境变量 `PUBLIC_API_URL` → 构建时 `fetch(PUBLIC_API_URL/api/nav)` 读后台。
- 否则 → 读本地文件 `static/config.json`。

### 本地联调（读本地后台）

```bash
cd packages/website
echo "PUBLIC_API_URL=http://localhost:8787" > .env
# 重启 astro dev，首页就会显示你在本地后台录入的数据
```

### 改站点标题 / 描述 / Logo

这些「站点品牌信息」不在 D1 里，而在前端配置文件 `packages/website/static/config.json` 顶部：

```json
{
  "site": {
    "title": "我的导航站",
    "description": "一句话介绍",
    "logo": { "text": "我的导航站", "href": "/" }
  }
}
```

改完重新构建前端即可。

---

## 第 5 步：部署上线

本地跑通后，把后台和前端分别部署到 Cloudflare。

### 5.1 部署后端（Worker + D1 + KV）

首次部署需要先创建云端资源：

```bash
cd packages/worker

# 1. 创建云端 D1 数据库（记下输出的 database_id）
npx wrangler d1 create astro-nav-db

# 2. 创建云端 KV namespace（记下输出的 id）
npx wrangler kv namespace create NAV_KV

# 3. 把上面两个 id 填进 wrangler.toml 的 database_id / kv_namespaces.id

# 4a. 给云端库建表（migrations，只有表结构）
pnpm db:migrate:remote
# 4b. 灌一套数据（seeds，二选一，互斥，后跑的会清空先跑的）
pnpm db:seed:aff:remote       # Affiliate 导航（167 站点）
# pnpm db:seed:eooce:remote   # 或：老王导航（269 站点）

# 5. 注入云端密钥（.dev.vars 只作用于本地，云端读不到，必须单独注入一次）
npx wrangler secret put ADMIN_TOKEN        # 后台密码，用强随机值，不要沿用本地的
npx wrangler secret put TURNSTILE_SECRET   # Cloudflare 后台申请的真实 Turnstile secret

# 6. 部署 Worker
npx wrangler deploy
```

> ⚠️ 第 5 步不能跳过。`.dev.vars` 是本地文件、不会上传，云端 Worker 读不到里面的值；漏了这步，线上后台的 `ADMIN_TOKEN` 为空，登录和所有写接口都会 401。
> 也不要为了省事把密钥写回 `wrangler.toml [vars]` —— 那是明文并且会进 git。

部署后拿到后台地址：`https://<worker名>.<你的子域>.workers.dev`

> 之后录数据、发布，都对**云端**操作：把上面第 2~3 步的 `curl` 地址换成线上后台地址即可（云端后台数据默认也走 approved/发布流程）。

### 5.2 部署前端（Cloudflare Pages）

```bash
cd packages/website

# 1. 指向线上后台
echo "PUBLIC_API_URL=https://<你的worker地址>" > .env

# 2. 构建
npx astro build

# 3. 首次创建 Pages 项目并部署
npx wrangler pages project create astro-nav --production-branch main
npx wrangler pages deploy dist --project-name=astro-nav --commit-dirty=true
```

拿到前端地址：`https://astro-nav.pages.dev`

---

## 日常更新流程（记住这 3 步）

改完数据后，前端不会自动更新，必须走完整流程：

```
1. 后台增删改数据（表单或 API）
2. 点「发布」          → curl -X POST https://<worker>/api/sites/publish -H "Authorization: Bearer <ADMIN_TOKEN>"
3. 重新构建 + 部署前端  → cd packages/website && npx astro build && npx wrangler pages deploy dist --project-name=astro-nav --commit-dirty=true
```

**为什么要第 3 步？** 因为前端是静态站，数据在构建时烤进 HTML。不重新构建，用户看到的还是旧页面。

---

## ⚠️ 上线前必做的安全设置

1. **`ADMIN_TOKEN` 用强随机值**，且线上和本地不要用同一个。`wrangler.toml` 里只留非敏感的 `ADMIN_USER`，密钥一律 `wrangler secret put`，不要写回 `[vars]`。
2. **`TURNSTILE_SECRET` 必须换成真实密钥**。`.dev.vars.example` 里的 `1x0000000000000000000000000000000AA` 是 Cloudflare 官方「总是通过」的测试密钥，线上继续用它等于关掉人机验证。去 Cloudflare 后台 Turnstile 申请一对真实 key。
3. **本仓库 git 历史里存在过明文的 `ADMIN_TOKEN=admin`**。如果你 fork 的是这个仓库，历史仍可查到，务必设置全新的 token，不要沿用。
4. 部署后立刻用新密码登录一次，确认 secret 生效。

---

## 常见问题

**Q：我只想本地玩，必须跑 `wrangler secret put` 吗？**
A：不用。那条命令是往**云端** Worker 写密钥，只有部署时才需要。本地开发只需 `cp .dev.vars.example .dev.vars` 并改掉里面的 `ADMIN_TOKEN`，连 `wrangler login` 都不用。

**Q：本地能登录，部署到线上却一直 401？**
A：漏了往云端注入密钥。`.dev.vars` 是本地文件、不会上传，云端读不到。执行 `npx wrangler secret put ADMIN_TOKEN`（和 `TURNSTILE_SECRET`）后重新 `wrangler deploy`。

**Q：我在后台加了网站，前端怎么没变？**
A：三步没走完。加完要「发布」，还要「重新构建部署前端」。见上面的日常更新流程。

**Q：加的网站在「所有网站」页看不到？**
A：新加的默认是 `pending`（待审核），「所有网站」只显示 `approved`。去「待审核」页审核通过，或录入时直接设 `status: "approved"`。

**Q：发布是把新数据追加到旧数据上吗？**
A：不是。发布是**全量重建**——把 D1 里当前所有 approved 网站重新生成一份完整 JSON，覆盖 KV。删掉的站发布后就消失，pending 的不会进去。

**Q：数据必须用 D1 吗？能不能纯静态？**
A：可以，而且仓库自带两套现成数据集，一条命令装上就能构建，连后端都不用部署：

```bash
pnpm --filter @astro-nav/website use:aff      # Affiliate 导航，167 站点，含优缺点/价格等详情
# pnpm --filter @astro-nav/website use:eooce  # 或：老王导航，269 站点
pnpm --filter @astro-nav/website build
```

它把 `packages/worker/seeds/<名字>-nav.json` 拷成 `static/config.json`，和 `db:seed:*` 用的 SQL 同源。
**这条路径下不要设 `PUBLIC_API_URL`** —— 设了 build 前会去抓 worker 并覆盖 `config.json`。
数据很少、很少变的话，直接手写 `static/config.json` 也行。D1 后台是为「网页化管理、频繁增删改」准备的。

**Q：本地数据和线上数据是一套吗？**
A：不是。`--local` 操作的是本机 `.wrangler/state` 里的模拟库；`--remote` 才是云端真实库。两者完全隔离，互不影响。

---

## 最简路径总结

想最快看到一个自己的导航站上线：

1. `pnpm install` + `cp packages/worker/.dev.vars.example .dev.vars` 并改掉 `ADMIN_TOKEN`（本地到这一步为止，不用登录 Cloudflare）
2. 本地建表 → `wrangler dev` → 后台录几个分类和网站（设 approved）→ 发布
3. 前端 `.env` 指向本地后台 → `astro dev` 看效果
4. 满意后再上云：`wrangler login` → 建 D1/KV、填 id、迁移 → `wrangler secret put ADMIN_TOKEN` / `TURNSTILE_SECRET` → `wrangler deploy` → 部署 Pages（build + deploy）

搞定。

