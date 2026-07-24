const os = require('os')
const path = require('path')
const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests/smoke',
  // Keep test artifacts outside the repo: webpack-dev-server serves the repo
  // root as static content, and writes under it during a run would trigger
  // spurious live-reloads mid-test.
  outputDir: path.join(os.tmpdir(), 'litewrite-playwright-results'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  expect: {
    timeout: 10 * 1000
  },
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH
        }
      }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
})
