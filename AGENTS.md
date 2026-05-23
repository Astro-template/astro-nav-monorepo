# AGENTS.md

astro-nav-monorepo — pnpm monorepo，导航站。

## 开发

```bash
pnpm install && pnpm build
```

## 文件放置规范（严格遵守）

| 路径 | 允许放什么 |
|------|-----------|
| `packages/*/src/` | 各包源码 |
| `docs/` | 设计文档 |

**根目录允许的文件（不得新增）：**

```
package.json, pnpm-lock.yaml, pnpm-workspace.yaml, turbo.json, README.md, .gitignore
```

**绝对禁止：**

- ❌ 创建新 package（除非明确要求）
- ❌ 在 `packages/` 外放源码
- ❌ 创建新顶层目录
