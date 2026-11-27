const assert = require('node:assert/strict')
const { createServer } = require('node:http')
const { readFileSync } = require('node:fs')
const { chromium, expect } = require('@playwright/test')

const core = 'https://atomicdata.dev/properties/'
const props = 'https://atomicdata.dev/integrations/properties/'
const catalog = JSON.parse(readFileSync('upstream-catalog.json', 'utf8'))
const litewrite = catalog.find(entry => entry[core + 'shortname'] === 'litewrite')
assert.ok(litewrite)
const moduleUrl = litewrite[props + 'app-module']

if (process.argv[2] === 'serve') {
  createServer((request, response) => {
    response.setHeader('Content-Type', 'application/json')
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.end(JSON.stringify(request.url === '/catalog.json' ? [litewrite] : []))
  }).listen(8000, '127.0.0.1')
} else {
  verify().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}

async function verify () {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } })
  const diagnostics = []
  page.on('pageerror', error => diagnostics.push(error.message))
  page.on('console', message => { if (message.type() === 'error') diagnostics.push(message.text()) })
  page.on('requestfailed', request => diagnostics.push(request.url() + ' ' + request.failure()?.errorText))
  try {
    await page.goto('http://localhost:6747/app/dev-drive', { waitUntil: 'commit', timeout: 90000 })
    await page.waitForURL(/(?:did(?:%3A|:)ad|atomic)(?:%3A|:)/, { timeout: 150000 })
    console.log('Created fresh drive')
    await page.goto('http://localhost:6747/app/apps?preview=plugins&marketplace=' + encodeURIComponent('http://localhost:8000/catalog.json'), { waitUntil: 'commit', timeout: 90000 })
    await page.getByRole('button', { name: 'Add marketplace', exact: true }).click({ timeout: 90000 })
    await page.getByRole('checkbox', { name: 'Show experimental apps' }).check({ timeout: 30000 })
    const install = page.getByRole('button', { name: 'Install Litewrite', exact: true })
    await install.waitFor({ timeout: 40000 })
    const download = page.waitForResponse(r => r.url() === moduleUrl && r.ok(), { timeout: 50000 })
    await install.click()
    await download
    const frameSelector = 'iframe[title="App"][sandbox="allow-scripts allow-modals"]'
    const frame = page.frameLocator(frameSelector)
    const editor = frame.locator('#editor:not([disabled])')
    await editor.waitFor({ timeout: 90000 })
    console.log('The verified module rendered in the opaque app sandbox')
    const saved = page.waitForResponse(r => new URL(r.url()).pathname === '/app-write' && r.request().method() === 'POST' && r.ok(), { timeout: 30000 })
    const content = 'Litewrite production bundle\n\nThis note is stored in the Atomic Notes table.'
    await editor.fill(content)
    await saved
    await expect(frame.getByRole('status')).toHaveText('Saved to Atomic', { timeout: 30000 })
    const count = await page.locator('iframe[src*="embed=atomic"]').count()
    assert.equal(count, 0)
    await page.reload({ waitUntil: 'commit', timeout: 90000 })
    await expect(page.frameLocator(frameSelector).locator('#editor:not([disabled])')).toHaveValue(content, { timeout: 90000 })
    console.log('Installed the live bundle, wrote a note through Atomic, and reopened it after reload')
  } catch (error) {
    console.error((await page.locator('body').innerText().catch(() => '')).slice(0, 3200))
    for (const frame of page.frames().slice(1)) {
      console.error(frame.url(), (await frame.locator('body').innerText({ timeout: 3000 }).catch(() => '')).slice(0, 1000))
    }
    console.error(diagnostics.slice(-35).join('\n'))
    throw error
  } finally {
    await browser.close()
  }
}
