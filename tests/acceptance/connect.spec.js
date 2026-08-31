const { test, expect } = require('@playwright/test')
const { connectWidget } = require('./support/remote-storage')

test('connects to a remoteStorage account through the widget', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.rs-widget')).toHaveClass(/rs-state-initial/)

  await connectWidget(page)

  // Reloading should stay connected without going through the widget again.
  await page.reload()
  await expect(page.locator('.rs-widget')).toHaveClass(/rs-state-connected/)
})
