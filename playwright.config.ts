import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;
export const E2E_DB = path.resolve('tests/.tmp/e2e.db');

const serverEnv = {
  DATABASE_URL: `file:${E2E_DB}`,
  NEXTAUTH_URL: BASE_URL,
  NEXTAUTH_SECRET: 'e2e-secret-that-is-at-least-32-characters-long',
};

export default defineConfig({
  testDir: 'e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], channel: 'chrome', storageState: 'e2e/.auth/demo.json' },
      dependencies: ['setup'],
      testIgnore: /mobile\.spec\.ts/,
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], channel: 'chrome', storageState: 'e2e/.auth/demo.json' },
      dependencies: ['setup'],
      testMatch: /mobile\.spec\.ts/,
    },
  ],
  webServer: {
    // Production build: what users actually run, and no on-demand compiles to wait for
    command: `npx next build && npx next start -p ${PORT}`,
    url: `${BASE_URL}/api/health`,
    env: serverEnv,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
  },
});
