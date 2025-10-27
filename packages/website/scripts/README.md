# 配置同步脚本

## 概述

`sync-config.js` 脚本用于将配置文件从 `shared/config` 目录同步到 `website/static` 目录。

## 功能

- ✅ 自动复制配置文件
- ✅ 支持多个配置文件（config.json, config-optimized.json, config-traditional.json）
- ✅ 开发模式文件监听
- ✅ 友好的错误提示
- ✅ 构建前自动同步

## 使用方法

### 1. 手动同步

```bash
pnpm sync-config
```

或直接运行：

```bash
node scripts/sync-config.js
```

### 2. 监听模式（开发时使用）

```bash
pnpm dev:sync
```

或直接运行：

```bash
node scripts/sync-config.js --watch
```

在监听模式下，脚本会持续运行并监听 `shared/config` 目录的变化，自动同步更新的配置文件。

### 3. 构建时自动同步

构建时会自动执行同步（通过 `prebuild` 脚本）：

```bash
pnpm build
```

## 工作流程

```
packages/shared/config/
├── config.json
├── config-optimized.json
└── config-traditional.json
         ↓
    [同步脚本]
         ↓
packages/website/static/
├── config.json
├── config-optimized.json
└── config-traditional.json
```

## 配置文件说明

- **config.json**: 主配置文件，包含完整的导航数据
- **config-optimized.json**: 优化版配置，体积更小
- **config-traditional.json**: 传统格式配置

## 开发建议

### 并行开发模式

如果你需要同时开发 admin 和 website，并希望配置变更能实时同步：

**终端 1 - 运行 admin（生成配置）：**
```bash
cd packages/admin
pnpm dev
```

**终端 2 - 监听配置变化：**
```bash
cd packages/website
pnpm dev:sync
```

**终端 3 - 运行 website：**
```bash
cd packages/website
pnpm dev
```

这样，当你在 admin 中生成新配置时，配置会自动同步到 website，然后 Astro 的热重载会自动刷新页面。

### 单独开发 website

如果只开发 website，不需要运行监听脚本，直接运行：

```bash
pnpm dev
```

配置文件会在构建时自动同步。

## 故障排查

### 问题：配置文件不存在

**错误信息：**
```
⚠️  配置文件不存在: config.json
```

**解决方法：**
1. 确保 `packages/shared/config/` 目录存在
2. 确保配置文件已经生成（通过 admin 生成或手动复制）

### 问题：源目录不存在

**错误信息：**
```
❌ 错误: 配置源目录不存在
```

**解决方法：**
1. 确保 shared 包已经创建
2. 创建 `packages/shared/config/` 目录

### 问题：监听模式无法启动

**错误信息：**
```
❌ 监听失败: ...
```

**解决方法：**
1. 确保 Node.js 版本 >= 14（支持 fs.watch）
2. 检查文件系统权限
3. 在 Windows 上可能需要管理员权限

## 技术细节

- 使用 Node.js 原生 `fs/promises` API
- 使用 `fs.watch` 实现文件监听
- 支持跨平台（Windows、macOS、Linux）
- 零依赖（只使用 Node.js 内置模块）

## 相关脚本

- `pnpm dev` - 启动开发服务器
- `pnpm dev:sync` - 启动配置监听
- `pnpm build` - 构建项目（自动同步配置）
- `pnpm sync-config` - 手动同步配置
- `pnpm prebuild` - 构建前钩子（自动调用）
