# seeds — 导航内容数据

这里每个 `.sql` 文件是**一整套导航内容**（分类 + 站点）。与 `../migrations/` 的区别：

- `migrations/` = 表结构，所有环境都要跑，幂等、单向。
- `seeds/` = 往表里灌哪套内容，**部署时选一套手动执行**。

## 现有数据集

| 文件 | 内容 | 规模 |
|------|------|------|
| `aff-nav.sql`   | Affiliate 营销导航（项目最初的数据，含 advantages/details） | 16 分类 / 167 站点 |
| `eooce-nav.sql` | 老王导航 nav.eooce.com | 16 分类 / 269 站点 |

## 怎么用

先建表，再选一套灌数据：

```bash
# 1) 建表（只有结构）
pnpm --filter @astro-nav/worker db:migrate:local     # 或 :remote

# 2) 二选一灌数据
pnpm --filter @astro-nav/worker db:seed:aff:local    # 或 :remote
pnpm --filter @astro-nav/worker db:seed:eooce:local  # 或 :remote
```

## ⚠️ 关键约定（部署者/大模型务必看）

- **每个 seed 开头都是 `DELETE FROM sites; DELETE FROM categories;`** —— 是整站替换，不是追加。
- **两套 seed 互斥，绝不能同时跑**：后跑的会清空先跑的，先跑的白灌。
- **换数据集直接重跑另一个 seed 即可**（它自带清空），不用先手动删。
- `db:migrate` 灌完是**空库**，必须再跑一个 `db:seed:*` 才有内容。

## 新增一套导航数据

1. 在本目录加 `<名字>-nav.sql`，开头照抄现有文件的 `DELETE` + 头部注释。
2. 在 `packages/worker/package.json` 配一对脚本：`db:seed:<名字>:local` 和 `:remote`。
3. **不要**把数据文件放进 `migrations/`——那里只放表结构。
