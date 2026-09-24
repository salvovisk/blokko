import { defineConfig } from 'vitest/config';
import path from 'node:path';

const alias = { '@': path.resolve(__dirname, 'src') };
const TEST_DB = `file:${path.resolve(__dirname, 'tests/.tmp/test.db')}`;

export default defineConfig({
  resolve: { alias },
  esbuild: { jsx: 'automatic' },
  test: {
    globalSetup: ['tests/setup/global-setup.ts'],
    env: {
      DATABASE_URL: TEST_DB,
      NEXTAUTH_SECRET: 'test-secret-that-is-at-least-32-characters-long',
      NEXTAUTH_URL: 'http://localhost:3000',
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/unit/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'api',
          environment: 'node',
          include: ['tests/api/**/*.test.ts'],
          // All API suites share one SQLite file
          fileParallelism: false,
        },
      },
      {
        extends: true,
        test: {
          name: 'components',
          environment: 'happy-dom',
          include: ['tests/components/**/*.test.tsx'],
          setupFiles: ['tests/setup/dom-setup.ts'],
        },
      },
    ],
  },
});
