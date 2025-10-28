import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.astro/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/static/**',
        'tests/**'
      ]
    },
    include: ['tests/**/*.{test,spec}.{js,ts}', 'src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', '.astro']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@astro-nav/shared': resolve(__dirname, '../shared/src/index.ts')
    }
  }
});
