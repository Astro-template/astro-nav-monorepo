# seeds — 导航内容数据

这里每套导航内容（分类 + 站点）有两种形态，内容同源：

- `<名字>-nav.sql` —— 灌进 D1，走后台管理（需要部署 worker）。
- `<名字>-nav.json` —— 直接给前端当 `static/config.json`（**纯静态玩法，不用部署 worker**）。

与 `../migrations/` 的区别：`migrations/` 是表结构，所有环境都要跑；`seeds/` 是内容，选一套。

## 现有数据集

| 数据集 | 内容 | 规模 |
|--------|------|------|
| `aff-nav.{sql,json}`   | Affiliate 营销导航（项目最初的数据，含 advantages/details） | 16 分类 / 167 站点 |
| `eooce-nav.{sql,json}` | 老王导航 nav.eooce.com | 8 分类（含 8 个子分类）/ 269 站点 |

## 用法 A：走 D1 + 后台（需要部署 worker）

先建表，再选一套灌数据：

```bash
# 1) 建表（只有结构）
pnpm --filter @astro-nav/worker db:migrate:local     # 或 :remote

# 2) 二选一灌数据
pnpm --filter @astro-nav/worker db:seed:aff:local    # 或 :remote
pnpm --filter @astro-nav/worker db:seed:eooce:local  # 或 :remote
```

## 用法 B：纯静态（不部署 worker）

把 JSON 装进 `packages/website/static/config.json`，直接构建：

```bash
pnpm --filter @astro-nav/website use:aff      # 或 use:eooce
pnpm --filter @astro-nav/website build
```

> ⚠️ 这条路径下**不要设 `PUBLIC_API_URL`**。设了之后 build 前的 sync-config 会去抓 worker 并覆盖 `config.json`，你装的数据集会被顶掉。

JSON 由 SQL 生成，改完 SQL 用下面命令重新生成，不要手改 JSON 后指望两边一致：

```bash
pnpm --filter @astro-nav/worker seeds:json aff     # 或 eooce
```

`build-json.mjs` 在内存 sqlite 里跑一遍 migrations + seed，再按 worker publish 的同一套映射导出，
所以两条路径产出的结构一致。

## ⚠️ 关键约定（部署者/大模型务必看）

- **每个 seed 开头都是 `DELETE FROM sites; DELETE FROM categories;`** —— 是整站替换，不是追加。
- **两套 seed 互斥，绝不能同时跑**：后跑的会清空先跑的，先跑的白灌。
- **换数据集直接重跑另一个 seed 即可**（它自带清空），不用先手动删。
- `db:migrate` 灌完是**空库**，必须再跑一个 `db:seed:*` 才有内容。

## 新增一套导航数据

1. 在本目录加 `<名字>-nav.sql`，开头照抄现有文件的 `DELETE` + 头部注释。
2. 在 `packages/worker/package.json` 配一对脚本：`db:seed:<名字>:local` 和 `:remote`。
3. 在 `build-json.mjs` 的 `DATASETS` 里登记（决定站点标题/描述），跑 `seeds:json <名字>` 生成 JSON。
4. 想让它支持纯静态切换，再在 `packages/website/package.json` 加 `use:<名字>` 脚本。
5. **不要**把数据文件放进 `migrations/`——那里只放表结构。
