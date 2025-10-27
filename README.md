# Astro Nav Monorepo

> 🚀 A modern, high-performance navigation website built with Astro, TypeScript, and Tailwind CSS in a monorepo structure.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Astro](https://img.shields.io/badge/Astro-5.15-orange.svg)](https://astro.build/)
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
│   ├── website/         # 🌐 Main Astro website
│   │   ├── src/
│   │   │   ├── components/  # Astro components
│   │   │   ├── layouts/     # Page layouts
│   │   │   ├── pages/       # Route pages
│   │   │   ├── styles/      # Global styles
│   │   │   └── utils/       # Website-specific utilities
│   │   └── static/          # Static assets
│   │
│   └── admin/           # 🔧 Admin dashboard (planned)
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

Main Astro-based website with server-side rendering.

**Key Features:**
- Modern, responsive UI with Tailwind CSS v4
- Optimized for performance and SEO
- Lazy loading and code splitting
- Dynamic navigation with hash routing

### @astro-nav/admin (Planned)

Admin dashboard for content management.

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
    │   Shared    │   │  Website   │   │   Admin    │
    │   Package   │◄──┤  Package   │   │  Package   │
    └─────────────┘   └────────────┘   └────────────┘
```

**Benefits:**
- 🔄 Code reusability across packages
- 🎯 Clear dependency management
- ⚡ Efficient builds with Turborepo caching
- 🧪 Isolated testing per package
- 📦 Independent versioning and deployment

## 🎨 Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| [Astro](https://astro.build/) | Static Site Generator | 5.15+ |
| [TypeScript](https://www.typescriptlang.org/) | Type Safety | 5.9+ |
| [Tailwind CSS](https://tailwindcss.com/) | Styling | v4 |
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
