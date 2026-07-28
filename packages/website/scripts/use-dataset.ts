/**
 * 把一套现成的导航数据集装进 static/config.json（纯静态玩法，不需要部署 worker）。
 *
 *   pnpm use:aff      # Affiliate 导航（16 分类 / 167 站点）
 *   pnpm use:eooce    # 老王导航（8 分类 / 269 站点）
 *
 * 数据集与 db:seed:* 用的 SQL 同源（packages/worker/seeds/），二者都是整站替换。
 * 注意：设了 PUBLIC_API_URL 时，build 前的 sync-config 会用 worker 数据覆盖 config.json，
 * 纯静态玩法不要设这个变量。
 */
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATASETS = ['aff', 'eooce'] as const;
type Dataset = (typeof DATASETS)[number];

const here = dirname(fileURLToPath(import.meta.url));
const name = process.argv[2];

if (!name || !(DATASETS as readonly string[]).includes(name)) {
  console.error(`用法: tsx scripts/use-dataset.ts <${DATASETS.join('|')}>`);
  process.exit(1);
}

const source = join(here, '../../worker/seeds', `${name as Dataset}-nav.json`);
const target = join(here, '../static/config.json');

if (!existsSync(source)) {
  console.error(`❌ 找不到数据集 ${source}`);
  console.error(`   可在 packages/worker 下用 node seeds/build-json.mjs ${name} 从 SQL 重新生成。`);
  process.exit(1);
}

copyFileSync(source, target);
console.log(`✅ 已装入数据集 ${name}：${target}`);
console.log('   接着跑 pnpm dev 或 pnpm build 即可看到效果。');
