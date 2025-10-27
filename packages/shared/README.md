# @astro-nav/shared

共享代码库，包含类型定义、工具函数和常量，供 Astro Nav monorepo 中的其他包使用。

## 功能

- **类型定义**: 统一的 TypeScript 类型定义
- **工具函数**: 通用的工具函数（验证、格式化、配置辅助）
- **常量**: 共享的常量定义
- **验证器**: 数据验证逻辑

## 安装

在 monorepo 中的其他包中使用：

```json
{
  "dependencies": {
    "@astro-nav/shared": "workspace:*"
  }
}
```

## 使用

### 导入类型

```typescript
import type { SiteConfig, MenuItem, Site } from '@astro-nav/shared';
```

### 使用工具函数

```typescript
import { validateConfig, formatUrl, generateId } from '@astro-nav/shared';

// 验证配置
const isValid = validateConfig(config);

// 格式化URL
const url = formatUrl('example.com'); // 'https://example.com'

// 生成ID
const id = generateId('site'); // 'site-abc123-xyz789'
```

### 使用常量

```typescript
import { ERROR_MESSAGES, DEFAULT_CONFIG } from '@astro-nav/shared';

console.log(ERROR_MESSAGES.CONFIG_LOAD_FAILED);
```

## 开发

```bash
# 构建
pnpm build

# 开发模式（监听文件变化）
pnpm dev

# 类型检查
pnpm type-check

# 清理构建产物
pnpm clean
```

## 导出结构

- `@astro-nav/shared` - 主入口，导出所有内容
- `@astro-nav/shared/types` - 仅类型定义
- `@astro-nav/shared/utils` - 仅工具函数
- `@astro-nav/shared/constants` - 仅常量

## 配置文件

配置文件存储在 `config/` 目录中，由 admin 包生成：

- `config.json` - 主配置文件
- `config-optimized.json` - 优化版本配置
- `config-traditional.json` - 传统版本配置
