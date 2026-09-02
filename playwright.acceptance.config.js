const { defineConfig } = require('@playwright/test')

// Tier 2: exercises the real remoteStorage connect-and-sync flow against the
// containers started by docker-compose.acceptance.yml. Unlike
// playwright.config.js (tier 1), there is no webServer here - app and
// remotestorage are already running as sibling containers by the time this
// runs, reached by their compose service names.
module.exports = defineConfig({
  testDir: './tests/acceptance',
  globalSetup: require.resolve('./tests/acceptance/global-setup.js'),
  fullyParallel: false,
  // All specs share one remoteStorage account (see global-setup.js); running
  // them concurrently would have them stomp on each other's documents.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 30 * 1000,
  expect: {
    timeout: 15 * 1000
  },
  use: {
    baseURL: process.env.APP_URL || 'http://localhost:8000',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
})
