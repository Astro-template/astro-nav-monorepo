# Astro Nav Monorepo

> 🚀 A modern, high-performance navigation website built with Astro, TypeScript, and Tailwind CSS in a monorepo structure.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Astro](https://img.shields.io/badge/Astro-7-orange.svg)](https://astro.build/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)

## ✨ Features

- 🎯 **Monorepo Architecture** - Organized with pnpm workspaces and Turborepo
- ⚡ **Lightning Fast** - Built with Astro for optimal performance
- 🎨 **Modern UI** - Styled with Tailwind CSS v4
- 📦 **Type Safe** - Full TypeScript support across all packages
- 🧪 **Well Tested** - Comprehensive test coverage with Vitest
- 🔄 **Shared Logic** - Reusable types and utilities across packages
- 📱 **Responsive** - Mobile-first design approach

## 📁 Project Structure

```
astro-nav-monorepo/
├── packages/
│   ├── shared/          # 📚 Shared types, utilities, and business logic
│   │   ├── src/
│   │   │   ├── types/       # TypeScript type definitions
│   │   │   ├── utils/       # Utility functions
│   │   │   ├── constants/   # Constants and configurations
│   │   │   └── validators/  # Validation logic
│   │   └── tests/           # Unit tests
│   │
│   ├── website/         # 🌐 Main Astro website (static, reads config.json)
│   │   ├── src/
│   │   │   ├── components/  # Astro components
│   │   │   ├── layouts/     # Page layouts
│   │   │   ├── pages/       # Route pages
│   │   │   ├── styles/      # Global styles
│   │   │   └── utils/       # Website-specific utilities
│   │   ├── scripts/         # sync-config: pull data from Worker at build time
│   │   └── static/          # Static assets + generated config.json
│   │
│   └── worker/          # ⚙️ Cloudflare Worker (D1 + KV API + admin SSR)
│       ├── src/            # Router, handlers, repositories, services
│       ├── migrations/     # D1 schema (tables only)
│       └── seeds/          # Nav content datasets (aff / eooce, pick one)
│
├── pnpm-workspace.yaml  # PNPM workspace configuration
├── turbo.json          # Turborepo build configuration
└── package.json        # Root package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **pnpm** 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/Astro-template/astro-nav-monorepo.git
cd astro-nav-monorepo

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development server
pnpm dev
```

The website will be available at `http://localhost:4321`

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server for all packages |
| `pnpm build` | Build all packages for production |
| `pnpm test` | Run tests for all packages |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm lint` | Lint all packages |
| `pnpm clean` | Clean all build artifacts |

### Package-specific Commands

```bash
# Work with the website package
pnpm --filter @astro-nav/website dev
pnpm --filter @astro-nav/website build

# Work with the shared package
pnpm --filter @astro-nav/shared test
pnpm --filter @astro-nav/shared build
```

## 📦 Packages

### @astro-nav/shared

Core business logic, types, and utilities shared across all packages.

**Key Features:**
- Type definitions for configuration, navigation, and data models
- Utility functions for data transformation and validation
- Shared constants and validators
- Comprehensive test coverage

### @astro-nav/website

Statically generated Astro site. At build time `scripts/sync-config.ts` pulls nav data from the Worker and writes `static/config.json`, which the pages render from.

**Key Features:**
- Modern, responsive UI with Tailwind CSS v4
- Optimized for performance and SEO
- Lazy loading and code splitting
- Dynamic navigation with hash routing

### @astro-nav/worker

Cloudflare Worker backing the site: D1 database, KV cache, public submit API (with Turnstile), and the admin dashboard served directly at `/admin/*` (server-rendered with Mustache — there is no separate admin package).

- **`migrations/`** — D1 schema only (tables/indexes).
- **`seeds/`** — nav content datasets (`aff-nav.sql` / `eooce-nav.sql`), applied one at a time. See [`packages/worker/seeds/README.md`](packages/worker/seeds/README.md).

> Deployment and local setup: [`docs/quick-start.md`](docs/quick-start.md) · [`docs/deployment.md`](docs/deployment.md). Full doc index: [`docs/README.md`](docs/README.md).

## 🏗️ Architecture

This project follows a **monorepo architecture** with clear separation of concerns:

```
┌─────────────────────────────────────┐
│         Root Workspace              │
│  (pnpm workspace + Turborepo)       │
└─────────────────────────────────────┘
           │
           ├─────────────────┬─────────────────┐
           │                 │                 │
    ┌──────▼──────┐   ┌─────▼──────┐   ┌─────▼──────┐
    │   Shared    │   │  Website   │   │   Worker   │
    │   Package   │◄──┤  Package   │   │  (D1 + KV) │
    └─────────────┘   └─────▲──────┘   └─────┬──────┘
                            │  build-time     │ publish
                            │  fetch config   ▼
                            └───────────  KV (nav:sites.json)
```

**数据流**：管理员在 Worker 后台（`/admin`）编辑 → 点「发布」写入 KV → website 构建时（`sync-config`）拉取 KV JSON 生成 `config.json` → Astro 静态渲染。

**Benefits:**
- 🔄 Code reusability across packages
- 🎯 Clear dependency management
- ⚡ Efficient builds with Turborepo caching
- 🧪 Isolated testing per package
- 📦 Independent versioning and deployment

## 🎨 Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| [Astro](https://astro.build/) | Static Site Generator | 7+ |
| [TypeScript](https://www.typescriptlang.org/) | Type Safety | 5.9+ |
| [Tailwind CSS](https://tailwindcss.com/) | Styling | v4 |
| [Cloudflare Workers](https://workers.cloudflare.com/) | API + admin SSR | v4 (wrangler) |
| [Cloudflare D1](https://developers.cloudflare.com/d1/) | SQLite database | - |
| [Cloudflare KV](https://developers.cloudflare.com/kv/) | Published nav data cache | - |
| [Vitest](https://vitest.dev/) | Testing Framework | Latest |
| [Turborepo](https://turbo.build/) | Build System | Latest |
| [pnpm](https://pnpm.io/) | Package Manager | 8+ |

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch

# Run tests for specific package
pnpm --filter @astro-nav/shared test
```

## 📝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Astro](https://astro.build/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Iconify](https://iconify.design/)

---

Made with ❤️ by the Astro Template Team
