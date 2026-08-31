const { test, expect } = require('@playwright/test')
const { connectWidget, readStorageItem } = require('./support/remote-storage')

// Finds the one document under documents/notes/ whose content contains
// `marker`, polling the real storage API rather than trusting the UI.
async function findPersistedDocument (request, accessToken, marker) {
  let found = null
  await expect(async () => {
    const listing = await readStorageItem(request, { path: 'documents/notes/', accessToken })
    expect(listing.ok()).toBeTruthy()
    const items = Object.keys((await listing.json()).items || {})
    expect(items.length).toBeGreaterThan(0)

    for (const id of items) {
      const doc = await readStorageItem(request, { path: `documents/notes/${id}`, accessToken })
      const body = await doc.json()
      if (body.content && body.content.includes(marker)) {
        found = body
        return
      }
    }
    throw new Error(`No document under documents/notes/ contains "${marker}" yet`)
  }).toPass({ timeout: 15 * 1000 })
  return found
}

// Kept short (well under the sidebar's 40-character title truncation, see
// models/doc.js#updateTitle) so assertions against the sidebar text see the
// whole marker, not a cut-off prefix of it.
function uniqueMarker (label) {
  return `${label}-${Date.now().toString(36)}`
}

test('creating a document persists it on the remoteStorage server', async ({ page, request }) => {
  const marker = uniqueMarker('persist')
  await page.goto('/')
  const accessToken = await connectWidget(page)

  await page.locator('#add').click()
  await page.locator('#editor').fill(marker)

  const doc = await findPersistedDocument(request, accessToken, marker)
  expect(doc.content).toContain(marker)
})

test('reloading in a fresh session recovers the document from the server', async ({ page, request, browser }) => {
  const marker = uniqueMarker('recover')
  await page.goto('/')
  const accessToken = await connectWidget(page)
  await page.locator('#add').click()
  await page.locator('#editor').fill(marker)
  await findPersistedDocument(request, accessToken, marker)

  // A brand new context has no local cache, so seeing the note here proves
  // it came from the server, not from IndexedDB left over in the same tab.
  const freshContext = await browser.newContext()
  const freshPage = await freshContext.newPage()
  await freshPage.goto('/')
  await connectWidget(freshPage)

  await expect(freshPage.locator('#entries .item').filter({ hasText: marker })).toHaveCount(1, { timeout: 15 * 1000 })
  await freshContext.close()
})
