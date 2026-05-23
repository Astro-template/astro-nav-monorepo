# astro-nav 重构设计：用户提交 + Worker + 数据库

## 背景

当前架构是管理员手动维护 JSON，前端读取渲染。目标是：
1. 提供公开的网站登记页面，用户可以提交网站
2. 管理员审核后自动生成前端渲染数据
3. 利用 Cloudflare Worker + D1 + KV 实现全栈

## 架构总览

```
┌─────────────────────────────────────────────────────────┐
│                      用户侧                              │
├─────────────────────────────────────────────────────────┤
│  提交页面（/submit）                                     │
│  ├── 填写：网站名称/URL/描述/分类/Logo                    │
│  └── POST /api/sites → Worker → D1（status: pending）   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Worker API                             │
├─────────────────────────────────────────────────────────┤
│  POST /api/sites          → 用户提交（公开）              │
│  GET  /api/sites          → 获取已审核列表（公开）        │
│  GET  /api/sites/pending  → 待审核列表（管理员）          │
│  PUT  /api/sites/:id      → 审核/编辑（管理员）           │
│  DELETE /api/sites/:id    → 删除（管理员）                │
│  POST /api/sites/publish  → 生成 JSON 到 KV（管理员）    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      存储层                               │
├─────────────────────────────────────────────────────────┤
│  D1（主数据库）                                          │
│  ├── sites 表：所有网站记录（含 pending/approved/rejected）│
│  └── categories 表：分类定义                             │
│                                                         │
│  KV（缓存层）                                            │
│  ├── nav:sites.json → 前端渲染用的完整 JSON              │
│  └── nav:categories.json → 分类列表                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    前端渲染                               │
├─────────────────────────────────────────────────────────┤
│  Astro 静态站 或 SSR                                     │
│  ├── 构建时：fetch KV JSON → 生成静态页面                 │
│  └── 或运行时：fetch /api/sites → 动态渲染               │
└─────────────────────────────────────────────────────────┘
```

## 数据模型

### D1 Schema

```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sites (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  category_id TEXT NOT NULL,
  tags TEXT DEFAULT '[]',
  
  -- 提交信息
  submitter_name TEXT DEFAULT '',
  submitter_email TEXT DEFAULT '',
  submitter_reason TEXT DEFAULT '',
  
  -- 审核状态
  status TEXT DEFAULT 'pending',  -- pending | approved | rejected
  reviewer_note TEXT DEFAULT '',
  reviewed_at TEXT,
  
  -- 元数据
  sort_order INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_sites_category ON sites(category_id);
CREATE INDEX idx_sites_featured ON sites(featured);
```

### KV 存储格式

```typescript
// KV key: "nav:sites.json"
interface NavData {
  categories: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    sites: {
      id: string;
      title: string;
      url: string;
      description: string;
      logo: string;
      tags: string[];
      featured: boolean;
    }[];
  }[];
  generatedAt: string;
  totalSites: number;
}
```

## API 设计

### 公开接口（无需登录）

#### POST /api/sites — 提交网站

```typescript
// Request
{
  title: string;        // 必填
  url: string;          // 必填，需验证格式
  description: string;  // 必填，10-200 字
  category_id: string;  // 必填，从分类列表选
  logo?: string;        // 可选，URL
  tags?: string[];      // 可选
  submitter_name?: string;
  submitter_email?: string;
  submitter_reason?: string;  // 推荐理由
}

// Response 201
{ id: "uuid", message: "提交成功，等待审核" }
```

**防滥用：**
- Rate limit：同 IP 每小时最多 5 次提交
- URL 去重：已存在的 URL 不允许重复提交
- Turnstile 验证码（Cloudflare 免费）

#### GET /api/sites — 获取已审核网站

```typescript
// Query params
?category=slug&featured=true&limit=50

// Response
{ sites: [...], total: 100 }
```

#### GET /api/categories — 获取分类列表

```typescript
// Response
{ categories: [{ id, name, slug, icon, siteCount }] }
```

### 管理接口（需登录）

#### GET /api/sites/pending — 待审核列表

#### PUT /api/sites/:id — 审核/编辑

```typescript
// Request
{
  status?: "approved" | "rejected";
  reviewer_note?: string;
  title?: string;       // 可编辑
  description?: string;
  category_id?: string;
  featured?: boolean;
  sort_order?: number;
}
```

#### POST /api/sites/publish — 生成前端 JSON

从 D1 查询所有 `status=approved` 的网站，按分类组织，写入 KV。

```typescript
// 流程
1. SELECT * FROM sites WHERE status = 'approved' ORDER BY sort_order, created_at
2. SELECT * FROM categories ORDER BY sort_order
3. 组装 NavData JSON
4. KV.put("nav:sites.json", JSON.stringify(navData))
5. 返回 { message: "发布成功", totalSites: N }
```

## 前端渲染方案

### 方案 A：构建时生成（推荐，当前模式升级）

```
管理员点"发布" → KV 更新 → 触发 GitHub Actions → Astro build → 部署
```

Astro 构建时 fetch KV 的 JSON，生成静态 HTML。适合更新频率低（每天几次）的场景。

### 方案 B：运行时动态渲染

前端直接 fetch `/api/sites`，客户端渲染。适合更新频率高的场景，但 SEO 较差。

### 方案 C：混合（ISR）

Astro SSR + Cloudflare Pages，设置 `Cache-Control: s-maxage=3600`，每小时刷新一次。

**建议先用方案 A**，和当前架构兼容，只是数据源从手动 JSON 变成了 KV。

## 提交页面设计

```
┌─────────────────────────────────────────┐
│  提交网站                                │
├─────────────────────────────────────────┤
│                                         │
│  网站名称 *  [________________]         │
│  网站 URL *  [________________]         │
│  一句话描述 * [________________]         │
│  分类 *      [▼ 选择分类      ]         │
│  Logo URL    [________________]         │
│  标签        [________________] (逗号分隔)│
│                                         │
│  ── 提交者信息（可选）──                  │
│  你的名字    [________________]         │
│  你的邮箱    [________________]         │
│  推荐理由    [________________]         │
│                                         │
│  [✓] 我确认该网站内容合规                 │
│                                         │
│  [Turnstile 验证码]                      │
│                                         │
│         [ 提交 ]                         │
└─────────────────────────────────────────┘
```

## 管理后台设计

复用 Worker 的 HTML 渲染模式（和 msgflow 后台类似）：

```
/admin              → 仪表盘（总数/待审核数/今日提交数）
/admin/pending      → 待审核列表（批量审核）
/admin/sites        → 所有网站管理（编辑/删除/排序）
/admin/categories   → 分类管理
/admin/publish      → 一键发布到 KV
```

## Worker 部署方案

### 方案 A：独立 Worker

新建一个 Worker（`astro-nav-api`），独立部署。

```
api.nav.ouraihub.com → astro-nav-api Worker
nav.ouraihub.com     → Astro 静态站（Cloudflare Pages）
```

### 方案 B：复用 msgflow Worker

在 msgflow Worker 里加路由前缀 `/nav/`。

**建议用方案 A**——职责分离，独立部署，互不影响。

## 从当前架构迁移

1. 保留现有 `packages/shared` 的类型定义和工具函数
2. `packages/admin` 改为调用 Worker API（不再直接操作 JSON 文件）
3. `packages/website` 的数据源从本地 JSON 改为 fetch KV
4. 新增 `packages/worker`（Cloudflare Worker，D1 + KV）

```
astro-nav-monorepo/
├── packages/
│   ├── shared/       # 类型定义 + 工具（保留）
│   ├── website/      # 前端导航站（数据源改为 KV）
│   ├── worker/       # 新增：Worker API + D1 + KV
│   └── admin/        # 管理后台（调用 Worker API）
├── turbo.json
└── pnpm-workspace.yaml
```

## 费用估算

| 资源 | 免费额度 | 预估用量 |
|------|---------|---------|
| D1 存储 | 5 GB | < 1 MB（几千条记录） |
| D1 读取 | 500 万行/天 | < 1000 行/天 |
| KV 读取 | 10 万次/天 | < 1000 次/天 |
| KV 写入 | 1000 次/天 | < 10 次/天 |
| Worker 请求 | 10 万次/天 | < 1000 次/天 |

完全在免费额度内。

## 实施步骤

1. **创建 Worker 包** — D1 schema + 基础 CRUD API
2. **提交页面** — 表单 + Turnstile + 调用 API
3. **管理后台** — 审核列表 + 批量操作 + 发布按钮
4. **前端适配** — website 包改为 fetch KV JSON
5. **迁移数据** — 现有 JSON 数据导入 D1
6. **部署** — Worker 绑定域名 + Pages 部署
