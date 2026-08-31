const { test, expect } = require('@playwright/test')
const { connectWidget } = require('./support/remote-storage')

test('an edit in one browser context appears in a second', async ({ browser }) => {
  const contextA = await browser.newContext()
  const contextB = await browser.newContext()
  const pageA = await contextA.newPage()
  const pageB = await contextB.newPage()

  try {
    await pageA.goto('/')
    await connectWidget(pageA)

    await pageB.goto('/')
    await connectWidget(pageB)

    // Kept short (under the sidebar's 40-character title truncation, see
    // models/doc.js#updateTitle) so the assertion below sees the whole marker.
    const marker = `sync-${Date.now().toString(36)}`
    await pageA.locator('#add').click()
    await pageA.locator('#editor').fill(marker)

    // remoteStorage.js polls for remote changes in the background; this
    // waits on that real sync landing in B's UI rather than a fixed sleep.
    await expect(pageB.locator('#entries .item').filter({ hasText: marker })).toHaveCount(1, { timeout: 20 * 1000 })
  } finally {
    await contextA.close()
    await contextB.close()
  }
})
