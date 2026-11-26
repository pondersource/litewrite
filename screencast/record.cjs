const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const { createServer } = require('node:http')
const { mkdirSync, readFileSync, writeFileSync } = require('node:fs')
const { chromium } = require('@playwright/test')

const origin = 'http://localhost:8000'
const catalogUrl = origin + '/catalog/catalog.json'
const frontend = 'http://localhost:6747'
const moduleUrl = origin + '/catalog/litewrite-0.1.0.js'
const moduleText = "export function view({root}) { root.textContent = 'Litewrite is starting…'; }\n"
const catalog = [{
  '@id': origin + '/catalog/litewrite',
  'https://atomicdata.dev/properties/isA': ['https://atomicdata.dev/integrations/classes/PluginCatalogEntry'],
  'https://atomicdata.dev/properties/shortname': 'litewrite-preview',
  'https://atomicdata.dev/properties/name': 'Litewrite',
  'https://atomicdata.dev/properties/description': 'Write private notes in the current Atomic drive.',
  'https://atomicdata.dev/integrations/properties/version': '0.1.0',
  'https://atomicdata.dev/integrations/properties/app-module': moduleUrl,
  'https://atomicdata.dev/integrations/properties/app-module-integrity': 'sha384-' + createHash('sha384').update(moduleText).digest('base64'),
  'https://atomicdata.dev/integrations/properties/app-row-name': 'Note',
  'https://atomicdata.dev/integrations/properties/app-row-name-plural': 'Notes',
  'https://atomicdata.dev/integrations/properties/experimental': false,
  'https://atomicdata.dev/integrations/properties/enabled': true
}]

if (process.argv[2] === 'setup') {
  mkdirSync('catalog', { recursive: true })
  writeFileSync('catalog/catalog.json', JSON.stringify(catalog))
  writeFileSync('catalog/litewrite-0.1.0.js', moduleText)
  const path = 'atomic/browser/data-browser/src/chunks/AppPage/index.tsx'
  let code = readFileSync(path, 'utf8')
  assert.ok(code.includes('  if (!drive) {'))
  code = code.replace("import { styled } from 'styled-components';", "import { styled } from 'styled-components';\nimport { useEffect, useState } from 'react';\nimport { readSchema, schemaValue } from '@tomic/lib';")
  code = code.replace('  if (!drive) {', `
  const subject = resource.subject;
  const [catalogPreview, setCatalogPreview] = useState<string>();
  useEffect(() => {
    if (!import.meta.env.DEV || !drive) return;
    let current = true;
    void (async () => {
      const schema = await readSchema(store, drive);
      const app = await store.getResource(subject);
      const module = await schemaValue(store, schema, app, 'app-module');
      if (current && module === '${moduleUrl}') setCatalogPreview(subject);
    })().catch(console.warn);
    return () => { current = false; };
  }, [drive, store, subject]);
  if (!drive) {`)
  code = code.replace("preview === 'litewrite-local'\n", "preview === 'litewrite-local' || catalogPreview === subject\n")
  assert.ok(code.includes("|| catalogPreview === subject"))
  writeFileSync(path, code)
  const host = 'atomic/browser/data-browser/src/chunks/AppPage/HostedLitewriteFrame.tsx'
  const frameSource = readFileSync(host, 'utf8').replace('  border: 0;', '  border: 0;\n  display: block;\n  min-height: 520px;').replace('        } catch {', '        } catch (error) {\n          console.error(error);')
  writeFileSync(host, frameSource)
} else {
  void record().catch(error => { console.error(error); process.exitCode = 1 })
}

async function record () {
  mkdirSync('recording', { recursive: true })
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    recordVideo: { dir: 'recording/raw', size: { width: 1440, height: 960 } }
  })
  const page = await context.newPage()
  const seen = []
  page.on('pageerror', error => seen.push(error.message))
  page.on('console', event => { if (event.type() === 'error') seen.push(event.text()) })
  page.on('response', response => {
    if (/app-write|app-agent/.test(response.url())) console.log(response.status(), new URL(response.url()).pathname)
  })
  try {
    await page.goto(frontend + '/app/dev-drive', { waitUntil: 'domcontentloaded' })
    await page.waitForURL(/(?:did(?:%3A|:)ad|atomic)(?:%3A|:)/, { timeout: 75000 })
    console.log('Created fresh drive')
    const warm = page
    const demo = await context.newPage()
    await warm.close()
    const capture = demo.video()
    const settle = ms => demo.waitForTimeout(ms)
    demo.on('pageerror', error => seen.push(error.message))
    demo.on('console', event => { if (event.type() === 'error') seen.push(event.text()) })
    demo.on('response', response => {
      if (/app-write|app-agent/.test(response.url())) console.log(response.status(), new URL(response.url()).pathname)
    })
    await demo.goto(frontend + '/app/apps?marketplace=' + encodeURIComponent(catalogUrl), { waitUntil: 'domcontentloaded' })
    const add = demo.getByRole('button', { name: 'Add marketplace', exact: true })
    await add.waitFor({ timeout: 90000 })
    await settle(950)
    await add.click()
    const install = demo.getByRole('button', { name: 'Install Litewrite', exact: true })
    await install.waitFor({ timeout: 40000 })
    await settle(1500)
    const downloaded = demo.waitForResponse(r => r.url() === moduleUrl && r.ok(), { timeout: 50000 })
    await install.click()
    await downloaded
    const open = demo.getByRole('button', { name: 'Open hosted Litewrite', exact: true })
    await open.waitFor({ timeout: 60000 })
    await settle(1200)
    await open.click()
    const frame = demo.frameLocator('iframe[title="Litewrite"]')
    const editor = frame.locator('#editor')
    await demo.locator('iframe[title="Litewrite"]').waitFor({ state: 'attached', timeout: 15000 })
    await frame.locator('#remotestorage-connect[role="status"]').waitFor({ state: 'attached', timeout: 15000 })
    console.log('Litewrite status:', await frame.locator('#remotestorage-connect').textContent())
    const url = await demo.locator('iframe[title="Litewrite"]').getAttribute('src')
    assert.equal(url, origin + '/?embed=atomic')
    await frame.locator('#editor:not([disabled])').waitFor({ timeout: 45000 })
    await settle(1000)
    const saved = demo.waitForResponse(r => new URL(r.url()).pathname === '/app-write' && r.request().method() === 'POST' && r.ok(), { timeout: 30000 })
    await editor.fill('Catalog to AtomicServer\n\nLitewrite is storing this note in the current Atomic drive.')
    await saved
    await frame.getByText('Saved to Atomic', { exact: true }).waitFor({ timeout: 20000 })
    await settle(2000)
    await demo.reload({ waitUntil: 'domcontentloaded' })
    await open.click({ timeout: 50000 })
    await frame.locator('#editor:not([disabled])').waitFor({ timeout: 35000 })
    assert.match(await editor.inputValue(), /Litewrite is storing this note in the current Atomic drive/)
    await settle(1900)
    await demo.close()
    await capture.saveAs('recording/litewrite-from-atomic-catalog.webm')
  } catch (error) {
    const active = context.pages().at(-1)
    if (active) {
      console.error('Visible text:', (await active.locator('body').innerText().catch(() => '')).slice(0, 2800))
      for (const f of active.frames()) {
        if (f === active.mainFrame()) continue
        const metrics = await f.evaluate(() => ({
          title: document.title, size: [window.innerWidth, window.innerHeight],
          text: document.body?.innerText.slice(0, 1000),
          status: document.querySelector('#remotestorage-connect')?.outerHTML,
          referrer: document.referrer
        })).catch(() => undefined)
        console.error('Iframe diagnostic:', f.url(), metrics)
      }
      await active.screenshot({ path: 'recording/diagnostic.png' }).catch(() => undefined)
    }
    console.error('Browser diagnostics:', seen.slice(-35).join('\n'))
    throw error
  } finally {
    await context.close()
    await browser.close()
  }
}
