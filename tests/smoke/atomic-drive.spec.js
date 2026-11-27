const { test, expect } = require('@playwright/test')
const { readFileSync } = require('node:fs')
const { join } = require('node:path')

function boot (source) {
  const rows = new Map()
  const core = 'https://atomicdata.dev/properties/'
  const table = 'https://atomic.example/notes'
  const rowClass = table + '/note'
  let nextRow = 0

  function resource (subject) {
    const props = { ...rows.get(subject) }
    return {
      get: property => props[property],
      set: (property, value) => { props[property] = value },
      save: async () => { rows.set(subject, props) },
      destroy: async () => { rows.delete(subject) }
    }
  }

  const store = {
    getData: async () => ({ table, rowClass }),
    query: async ({ property, value }) =>
      [...rows].filter(([, props]) => props[property] === value).map(([subject]) => subject),
    getMany: async subjects => subjects.map(resource),
    newResource: async ({ parent, isA, propVals }) => {
      rows.set(table + '/' + ++nextRow, { ...propVals, [core + 'parent']: parent, [core + 'isA']: isA })
    }
  }

  async function render () {
    const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }))
    const { view } = await import(url)
    URL.revokeObjectURL(url)
    const root = document.getElementById('root')
    root.replaceChildren()
    await view({ root, store })
  }

  // A new view instance is tested in a clean document with the same saved rows.
  window.addEventListener('message', ({ data }) => {
    if (data === 'saved-rows') window.parent.postMessage([...rows], '*')
  })
  window.addEventListener('message', ({ data }) => {
    if (Array.isArray(data)) {
      for (const [subject, props] of data) rows.set(subject, props)
      nextRow = rows.size
      render().catch(error => { document.getElementById('root').textContent = error.message })
    }
  })
}

test('the verified bundle opens and saves Litewrite notes in Atomic’s opaque sandbox', async ({ page }) => {
  const source = readFileSync(join(__dirname, '../../atomic/litewrite-0.1.1.js'), 'utf8')
  const payload = JSON.stringify(source).replace(/</g, '\\u003c')
  const frameDocument = `<!doctype html>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-demo' blob:; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'">
    <div id="root"></div>
    <script type="module" nonce="demo">(${boot})(${payload})</script>`

  await page.setContent('<iframe id="atomic" width="1200" height="680" sandbox="allow-scripts allow-modals"></iframe>')
  const frame = page.frameLocator('#atomic')
  const editor = frame.locator('#editor')
  const diagnostics = []
  page.on('pageerror', error => diagnostics.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') diagnostics.push(message.text())
  })

  async function open (rows) {
    await page.locator('#atomic').evaluate((element, { frameDocument, rows }) => new Promise(resolve => {
      element.addEventListener('load', () => {
        element.contentWindow.postMessage(rows, '*')
        resolve()
      }, { once: true })
      element.srcdoc = frameDocument
    }), { frameDocument, rows })
    await expect(editor).toBeEnabled()
  }

  await open([])
  await expect(frame.locator('#sharing')).toBeHidden()
  await editor.fill('Atomic note <b>with literal HTML</b>')
  await expect(frame.getByRole('status')).toHaveText('Saved to Atomic')
  await expect(frame.locator('.highlights b')).toHaveCount(0)

  await frame.locator('#add').click()
  await editor.fill('A distinct second note')
  await expect(frame.getByRole('status')).toHaveText('Saved to Atomic')

  const saved = await page.locator('#atomic').evaluate(element => new Promise(resolve => {
    window.addEventListener('message', event => resolve(event.data), { once: true })
    element.contentWindow.postMessage('saved-rows', '*')
  }))
  expect(saved).toHaveLength(2)
  await open(saved)
  await expect(editor).toHaveValue('A distinct second note')
  await frame.locator('#entries .item').filter({ hasText: 'Atomic note' }).click()
  await expect(editor).toHaveValue('Atomic note <b>with literal HTML</b>')
  expect(diagnostics).toEqual([])
})
