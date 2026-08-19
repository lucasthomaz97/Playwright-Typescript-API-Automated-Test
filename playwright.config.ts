import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/api/tests',
  workers: 2,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
   reporter: [
    ['html'],
    ['list']
  ],
  globalTeardown: './tests/api/helpers/teardown_helper.ts'
});