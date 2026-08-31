const { REMOTESTORAGE_URL, TEST_USERNAME, TEST_PASSWORD } = require('./env')

const REMOTESTORAGE_HOST = REMOTESTORAGE_URL.replace(/^https?:\/\//, '')

// Drives the actual widget UI through a full OAuth round trip against the
// real remoteStorage server, the same path a person uses. Returns the
// bearer token litewrite ends up with, captured off the redirect back from
// the storage server before the app's own routing rewrites the URL hash.
async function connectWidget (page, { username = TEST_USERNAME, password = TEST_PASSWORD } = {}) {
  let accessToken = null
  page.on('framenavigated', frame => {
    if (frame !== page.mainFrame()) return
    const match = frame.url().match(/[#&]access_token=([^&]+)/)
    if (match) accessToken = decodeURIComponent(match[1])
  })

  await page.locator('.rs-box-initial').click()
  await page.locator('button.rs-choose-rs').click()
  await page.locator('input[name="rs-user-address"]').fill(`${username}@${REMOTESTORAGE_HOST}`)
  await page.locator('button.rs-connect').click()

  await page.getByLabel(`Enter the ${username} account's password`).fill(password)
  await page.getByRole('button', { name: 'Allow' }).click()

  await page.locator('.rs-widget').waitFor({ state: 'attached' })
  await expectConnected(page, username)

  if (!accessToken) throw new Error('Did not observe an access_token in the OAuth redirect')
  return accessToken
}

async function expectConnected (page, username) {
  const { expect } = require('@playwright/test')
  await expect(page.locator('.rs-widget')).toHaveClass(/rs-state-connected/)
  await expect(page.locator('.rs-connected-text h1.rs-user')).toHaveText(new RegExp(username))
}

// Reads a document straight from the storage server's HTTP API, bypassing
// the app entirely, so "persisted server-side" means what it says.
async function readStorageItem (request, { username = TEST_USERNAME, path, accessToken }) {
  const response = await request.get(`${REMOTESTORAGE_URL}/storage/${username}/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  return response
}

module.exports = { connectWidget, readStorageItem, REMOTESTORAGE_HOST }
