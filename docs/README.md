# 文档索引

| 文档 | 用途 | 时效 |
|------|------|------|
| [quick-start.md](quick-start.md) | 本地开发 + 云端部署的完整上手指南 | ✅ 当前有效 |
| [deployment.md](deployment.md) | 部署速查（Worker + Pages + D1 建表/灌数据） | ✅ 当前有效 |
| [archive/refactor-design.md](archive/refactor-design.md) | 重构前的架构设计蓝图 | 🗄️ 已归档，勿作现状参考 |
| [archive/code-review-checklist.md](archive/code-review-checklist.md) | 重构前的一次性代码评审清单 | 🗄️ 已归档 |

## 说明

- **数据库两步走**：先 `db:migrate`（建表），再 `db:seed:aff|eooce`（二选一灌数据）。详见各 seed 文件与 [../packages/worker/seeds/README.md](../packages/worker/seeds/README.md)。
- **归档文档**放在 `archive/`，是重构动工前的历史材料，与当前代码可能不符，仅保留架构决策背景。
- 项目整体约定见根目录 [../AGENTS.md](../AGENTS.md)。
