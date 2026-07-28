/**
 * Website 包功能验证脚本
 * 验证所有必要的文件和配置是否正确
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let hasErrors = false;

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface ConfigCheck {
  pattern: RegExp;
  name: string;
}

/**
 * 验证配置文件
 */
function verifyConfigFiles(): void {
  console.log('📋 验证配置文件...');
  const configFiles = [
    'static/config.json'
  ];

  for (const file of configFiles) {
    const path = join(__dirname, '..', file);
    if (!existsSync(path)) {
      console.error(`  ❌ 配置文件不存在: ${file}`);
      hasErrors = true;
    } else {
      try {
        const content = readFileSync(path, 'utf-8');
        JSON.parse(content);
        console.log(`  ✅ ${file} - 格式正确`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`  ❌ ${file} - JSON 格式错误: ${errorMessage}`);
        hasErrors = true;
      }
    }
  }
  console.log();
}

/**
 * 验证页面文件
 */
function verifyPages(): void {
  console.log('📄 验证页面文件...');
  const pages = [
    'src/pages/index.astro',
    'src/pages/submit.astro'
  ];

  for (const page of pages) {
    const path = join(__dirname, '..', page);
    if (!existsSync(path)) {
      console.error(`  ❌ 页面文件不存在: ${page}`);
      hasErrors = true;
    } else {
      console.log(`  ✅ ${page}`);
    }
  }
  console.log();
}

/**
 * 验证组件文件
 */
function verifyComponents(): void {
  console.log('🧩 验证组件文件...');
  const components = [
    'src/components/Sidebar.astro',
    'src/components/CategoryCard.astro',
    'src/components/NavItem.astro'
  ];

  for (const component of components) {
    const path = join(__dirname, '..', component);
    if (!existsSync(path)) {
      console.error(`  ❌ 组件文件不存在: ${component}`);
      hasErrors = true;
    } else {
      console.log(`  ✅ ${component}`);
    }
  }
  console.log();
}

/**
 * 验证布局文件
 */
function verifyLayouts(): void {
  console.log('🎨 验证布局文件...');
  const layouts = [
    'src/layouts/Layout.astro'
  ];

  for (const layout of layouts) {
    const path = join(__dirname, '..', layout);
    if (!existsSync(path)) {
      console.error(`  ❌ 布局文件不存在: ${layout}`);
      hasErrors = true;
    } else {
      console.log(`  ✅ ${layout}`);
    }
  }
  console.log();
}

/**
 * 验证样式文件
 */
function verifyStyles(): void {
  console.log('💅 验证样式文件...');
  const styles = [
    'src/styles/global.css'
  ];

  for (const style of styles) {
    const path = join(__dirname, '..', style);
    if (!existsSync(path)) {
      console.error(`  ❌ 样式文件不存在: ${style}`);
      hasErrors = true;
    } else {
      console.log(`  ✅ ${style}`);
    }
  }
  console.log();
}

/**
 * 验证配置文件
 */
function verifyConfigFile(): void {
  console.log('⚙️  验证 Astro 配置...');
  const configPath = join(__dirname, '..', 'astro.config.mjs');
  
  if (!existsSync(configPath)) {
    console.error('  ❌ astro.config.mjs 不存在');
    hasErrors = true;
  } else {
    const content = readFileSync(configPath, 'utf-8');
    
    // 检查关键配置
    const checks: ConfigCheck[] = [
      { pattern: /port:\s*4321/, name: '端口配置 (4321)' },
      { pattern: /@tailwindcss\/vite/, name: 'Tailwind CSS v4 集成' },
      { pattern: /output:\s*["']static["']/, name: '静态输出模式' },
      { pattern: /publicDir:\s*["']\.\/static["']/, name: '静态文件目录' }
    ];

    for (const check of checks) {
      if (check.pattern.test(content)) {
        console.log(`  ✅ ${check.name}`);
      } else {
        console.error(`  ❌ ${check.name} - 未找到`);
        hasErrors = true;
      }
    }
  }
  console.log();
}

/**
 * 验证 Tailwind 使用
 */
function verifyTailwindUsage(): void {
  console.log('🎨 验证 Tailwind CSS 使用...');
  
  const filesToCheck = [
    'src/components/Sidebar.astro',
    'src/components/CategoryCard.astro',
    'src/components/NavItem.astro',
    'src/pages/index.astro'
  ];

  for (const file of filesToCheck) {
    const path = join(__dirname, '..', file);
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf-8');
      
      // 检查是否使用了 Tailwind 类
      const hasTailwindClasses = /class="[^"]*(?:flex|grid|bg-|text-|p-|m-|border-|rounded|shadow|hover:|transition)/i.test(content);
      
      if (hasTailwindClasses) {
        console.log(`  ✅ ${file} - 使用了 Tailwind 类`);
      } else {
        console.warn(`  ⚠️  ${file} - 未检测到 Tailwind 类`);
      }
    }
  }
  console.log();
}

/**
 * 验证依赖
 */
function verifyDependencies(): void {
  console.log('📦 验证依赖配置...');
  const packagePath = join(__dirname, '..', 'package.json');
  
  if (!existsSync(packagePath)) {
    console.error('  ❌ package.json 不存在');
    hasErrors = true;
    return;
  }

  const pkg: PackageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
  
  const requiredDeps: Record<string, string> = {
    '@astro-nav/shared': 'workspace:*',
    'astro': '^5.15.1',
    'tailwindcss': '^4.0.0-beta.7'
  };

  for (const [dep, version] of Object.entries(requiredDeps)) {
    if (pkg.dependencies?.[dep]) {
      console.log(`  ✅ ${dep}: ${pkg.dependencies[dep]}`);
    } else {
      console.error(`  ❌ 缺少依赖: ${dep}`);
      hasErrors = true;
    }
  }
  console.log();
}

/**
 * 执行所有验证
 */
function runAllVerifications(): boolean {
  verifyConfigFiles();
  verifyPages();
  verifyComponents();
  verifyLayouts();
  verifyStyles();
  verifyConfigFile();
  verifyTailwindUsage();
  verifyDependencies();
  
  return !hasErrors;
}

/**
 * 主函数
 */
function main(): void {
  console.log('🔍 开始验证 website 包功能...\n');
  
  const success = runAllVerifications();
  
  // 输出结果
  console.log('═'.repeat(50));
  if (!success) {
    console.log('❌ 验证失败：发现错误');
    process.exit(1);
  } else {
    console.log('✅ 所有验证通过！');
    console.log('\n📝 下一步：');
    console.log('   1. 运行 "pnpm --filter @astro-nav/website dev" 启动开发服务器');
    console.log('   2. 在浏览器中访问 http://localhost:4321');
    console.log('   3. 验证所有页面和样式是否正确显示');
    console.log('   4. 测试响应式布局和交互效果');
    process.exit(0);
  }
}

// 只在直接运行时执行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// 导出函数供测试使用
export {
  verifyConfigFiles,
  verifyPages,
  verifyComponents,
  verifyLayouts,
  verifyStyles,
  verifyConfigFile,
  verifyTailwindUsage,
  verifyDependencies,
  runAllVerifications
};
