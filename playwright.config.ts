
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({

  // Test directory
  testDir: './tests',

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Test timeout
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  // Reports
  reporter: [
    ['list'],
    ['html', {
      outputFolder: 'reports/html-report',
      open: 'never',
    }],
  ],

  // Shared browser settings
  use: {

    // Nextenti QA application URL
    baseURL:
      process.env.BASE_URL ||
      'https://k8-qa-job-web.nextenti.ai',

    // Browser settings
    headless: true,
    viewport: { width: 1920, height: 1080 },

    // Evidence collection
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Navigation settings
    actionTimeout: 15000,
    navigationTimeout: 30000,

    ignoreHTTPSErrors: false,
  },

  // Browser projects
  projects: [

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

  ],

  // Global output directory
  outputDir: 'reports/test-results',

});
