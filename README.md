# Astro Nav Monorepo

这是 Astro 导航网站的 Monorepo 架构版本，使用 pnpm workspace 和 Turborepo 管理多个子项目。

## 项目结构

```
astro-nav-workspace/
├── packages/
│   ├── shared/       # 共享代码库（类型、工具函数）
│   ├── website/      # 用户导航网站
│   └── admin/        # 管理后台
├── turbo.json        # Turborepo 配置
├── pnpm-workspace.yaml
└── package.json
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 同时启动所有服务
pnpm dev

# 或单独启动某个包
pnpm --filter @astro-nav/website dev
pnpm --filter @astro-nav/admin dev
```

### 构建

```bash
# 构建所有包
pnpm build

# 或单独构建某个包
pnpm --filter @astro-nav/website build
pnpm --filter @astro-nav/admin build
```

## 子项目说明

### @astro-nav/shared

共享代码库，包含：
- 类型定义
- 工具函数
- 常量定义
- 数据验证逻辑

### @astro-nav/website

用户导航网站，运行在端口 4321：
- 导航页面
- 搜索功能
- 网站详情页

### @astro-nav/admin

管理后台，运行在端口 4322：
- 配置文件生成
- 表格数据导入
- 开发工具集合

## 常用命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm type-check

# 代码格式化
pnpm format

# 清理构建产物
pnpm clean
```

## 技术栈

- **包管理器**: pnpm 8.x
- **构建工具**: Turborepo 1.x
- **前端框架**: Astro 5.x
- **类型系统**: TypeScript 5.x
