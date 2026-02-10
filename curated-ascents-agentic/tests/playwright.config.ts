import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Multi-environment Playwright configuration.
 * Set TEST_ENV=local|staging|production to control behavior.
 */
const TEST_ENV = (process.env.TEST_ENV || 'local') as 'local' | 'staging' | 'production';

// Load environment-specific .env file
const envFiles: Record<string, string> = {
  local: '.env.test',
  staging: '.env.staging',
  production: '.env.production',
};
dotenv.config({ path: path.resolve(__dirname, envFiles[TEST_ENV]) });

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

// Production only runs smoke tests (public + auth specs)
const testDir = TEST_ENV === 'production'
  ? './specs'
  : './specs';

const testMatch = TEST_ENV === 'production'
  ? ['**/public/**/*.spec.ts', '**/auth/**/*.spec.ts']
  : undefined;

export default defineConfig({
  testDir,
  testMatch,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Only start the local dev server for local testing
  ...(TEST_ENV === 'local'
    ? {
        webServer: {
          command: 'npm run dev',
          port: 3000,
          reuseExistingServer: !process.env.CI,
          cwd: path.resolve(__dirname, '..'),
          timeout: 120_000,
          env: {
            ...process.env,
            ENABLE_MSW: 'true',
          },
        },
      }
    : {}),

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
