import { copyFile, mkdir, watch } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 定义源目录和目标目录
const SOURCE_DIR = join(__dirname, '../../shared/config');
const TARGET_DIR = join(__dirname, '../static');

// 需要同步的配置文件列表
const CONFIG_FILES = [
  'config.json',
  'config-optimized.json',
  'config-traditional.json'
];

/**
 * 复制单个配置文件
 * @param {string} filename - 文件名
 */
async function copyConfigFile(filename) {
  const sourcePath = join(SOURCE_DIR, filename);
  const targetPath = join(TARGET_DIR, filename);

  // 检查源文件是否存在
  if (!existsSync(sourcePath)) {
    console.warn(`⚠️  配置文件不存在: ${filename}`);
    return false;
  }

  try {
    // 确保目标目录存在
    await mkdir(TARGET_DIR, { recursive: true });
    
    // 复制文件
    await copyFile(sourcePath, targetPath);
    console.log(`✅ 已同步: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ 复制失败 ${filename}:`, error.message);
    return false;
  }
}

/**
 * 同步所有配置文件
 */
async function syncAllConfigs() {
  console.log('🔄 开始同步配置文件...');
  console.log(`   源目录: ${SOURCE_DIR}`);
  console.log(`   目标目录: ${TARGET_DIR}`);
  console.log('');

  let successCount = 0;
  for (const filename of CONFIG_FILES) {
    const success = await copyConfigFile(filename);
    if (success) successCount++;
  }

  console.log('');
  console.log(`📦 同步完成: ${successCount}/${CONFIG_FILES.length} 个文件`);
  return successCount;
}

/**
 * 监听配置文件变化（开发模式）
 */
async function watchConfigs() {
  console.log('');
  console.log('👀 监听配置文件变化...');
  console.log('   按 Ctrl+C 停止监听');
  console.log('');

  try {
    const watcher = watch(SOURCE_DIR, { recursive: false });
    
    for await (const event of watcher) {
      const { eventType, filename } = event;
      
      // 只处理我们关心的配置文件
      if (filename && CONFIG_FILES.includes(filename)) {
        console.log(`📝 检测到变化: ${filename} (${eventType})`);
        await copyConfigFile(filename);
      }
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('❌ 配置目录不存在:', SOURCE_DIR);
      console.error('   请确保 shared/config 目录已创建');
    } else {
      console.error('❌ 监听失败:', error.message);
    }
    process.exit(1);
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const watchMode = args.includes('--watch') || args.includes('-w');

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  配置文件同步工具');
  console.log('═══════════════════════════════════════');
  console.log('');

  // 检查源目录是否存在
  if (!existsSync(SOURCE_DIR)) {
    console.error('❌ 错误: 配置源目录不存在');
    console.error(`   路径: ${SOURCE_DIR}`);
    console.error('');
    console.error('💡 提示: 请先创建 shared/config 目录并添加配置文件');
    process.exit(1);
  }

  // 执行初始同步
  const syncedCount = await syncAllConfigs();

  // 如果没有文件被同步，给出提示
  if (syncedCount === 0) {
    console.log('');
    console.log('💡 提示: shared/config 目录中没有找到配置文件');
    console.log('   请确保以下文件存在:');
    CONFIG_FILES.forEach(file => console.log(`   - ${file}`));
  }

  // 如果是监听模式，继续监听文件变化
  if (watchMode) {
    await watchConfigs();
  } else {
    console.log('');
    console.log('✨ 完成！');
    console.log('');
    console.log('💡 提示: 使用 --watch 或 -w 参数启用文件监听模式');
    console.log('   例如: node scripts/sync-config.js --watch');
    console.log('');
  }
}

// 运行主函数
main().catch(error => {
  console.error('');
  console.error('❌ 发生错误:', error);
  process.exit(1);
});
