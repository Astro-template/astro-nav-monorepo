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

# 登录 Cloudflare
cd packages/worker
npx wrangler login
npx wrangler whoami   # 确认已登录
```

---

## 第 1 步：先在本地跑起来看效果（不碰线上）

强烈建议先本地跑通，熟悉整个流程，再部署到线上。

### 1.1 初始化本地数据库

```bash
cd packages/worker
# 一键建表 + 导入数据（本地库，存在 .wrangler/state 目录，跟线上隔离）
# 按顺序跑 0001 建表 → 0002 升级结构 → 0003 导入数据
pnpm db:migrate:local
```

### 1.2 启动后台

```bash
npx wrangler dev --port 8787
```

打开 http://localhost:8787/login ，用 `kiro` / `admin` 登录（这是默认账号，见 `wrangler.toml`）。

登录后能看到 5 个页面：仪表盘、添加网站、待审核、所有网站、分类管理。此时数据库是空的，属正常。

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

在后台没有独立的「建分类」表单，用 API 建最快（后台运行时，另开终端）：

```bash
# 建一个「云服务器」分类
curl -X POST http://localhost:8787/api/admin/categories \
  -H "Authorization: Bearer admin" \
  -H "Content-Type: application/json" \
  -d '{"name":"云服务器","slug":"cloud","icon":"☁️","sort_order":1}'

# 再建一个「支付工具」
curl -X POST http://localhost:8787/api/admin/categories \
  -H "Authorization: Bearer admin" \
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
  -H "Authorization: Bearer admin" \
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
  -H "Authorization: Bearer admin"
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

# 4. 给云端库建表 + 导入数据（一键按顺序跑 0001→0002→0003）
pnpm db:migrate:remote

# 5. 部署 Worker
npx wrangler deploy
```

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

默认配置只适合本地/演示，正式上线前务必改：

1. **改后台账号密码**：`wrangler.toml` 的 `[vars]` 里 `ADMIN_USER` / `ADMIN_TOKEN` 是明文默认值（kiro/admin），任何人都能猜到。
   - 更安全的做法：用 secret 而不是明文写在 toml 里
     ```bash
     cd packages/worker
     npx wrangler secret put ADMIN_TOKEN   # 按提示输入，不会进 git
     ```
   - 同时把 `wrangler.toml` 里的明文 `ADMIN_TOKEN` 删掉。
2. **不要把真实密钥提交进 git**：`TURNSTILE_SECRET` 等同理，用 `wrangler secret put`。
3. 部署后立刻用新密码登录验证一次。

---

## 常见问题

**Q：我在后台加了网站，前端怎么没变？**
A：三步没走完。加完要「发布」，还要「重新构建部署前端」。见上面的日常更新流程。

**Q：加的网站在「所有网站」页看不到？**
A：新加的默认是 `pending`（待审核），「所有网站」只显示 `approved`。去「待审核」页审核通过，或录入时直接设 `status: "approved"`。

**Q：发布是把新数据追加到旧数据上吗？**
A：不是。发布是**全量重建**——把 D1 里当前所有 approved 网站重新生成一份完整 JSON，覆盖 KV。删掉的站发布后就消失，pending 的不会进去。

**Q：数据必须用 D1 吗？能不能纯静态？**
A：可以。不设 `PUBLIC_API_URL` 时，前端直接读 `static/config.json`。如果你的站数据很少、很少变，手写这个 JSON 文件 + 构建，是最简方案，连后端都不用部署。D1 后台是为「网页化管理、频繁增删改」准备的。

**Q：本地数据和线上数据是一套吗？**
A：不是。`--local` 操作的是本机 `.wrangler/state` 里的模拟库；`--remote` 才是云端真实库。两者完全隔离，互不影响。

---

## 最简路径总结

想最快看到一个自己的导航站上线：

1. `pnpm install` + `wrangler login`
2. 本地建表 → `wrangler dev` → 后台录几个分类和网站（设 approved）→ 发布
3. 前端 `.env` 指向本地后台 → `astro dev` 看效果
4. 满意后：部署 Worker（建 D1/KV、填 id、迁移、deploy）→ 部署 Pages（build + deploy）
5. 改默认密码

搞定。

