import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  fullyParallel: true,
  forbidOnly: isCI,
  // Retries in CI are deliberate: a test that fails then passes on retry is
  // reported by Playwright as "flaky", which feeds the flaky-rate metric.
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,
  reporter: isCI
    ? [['blob'], ['list']] // each CI shard writes a blob; the report job merges them
    : [
        ['html', { open: 'never' }],
        ['json', { outputFile: 'results/results.json' }],
        ['list'],
      ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'ui',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], baseURL: 'https://www.saucedemo.com' },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: 'https://jsonplaceholder.typicode.com' },
    },
  ],
});
