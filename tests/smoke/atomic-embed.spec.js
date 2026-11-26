const { test, expect } = require('@playwright/test')
const { createServer } = require('node:http')

function openLitewrite (iframe) {
  const channel = new MessageChannel()
  const notes = JSON.parse(window.sessionStorage.getItem('notes') || '{}')
  channel.port1.onmessage = ({ data: { id, op, key, note } }) => {
    if (op === 'put') notes[key] = note
    if (op === 'delete') delete notes[key]
    window.sessionStorage.setItem('notes', JSON.stringify(notes))
    channel.port1.postMessage({ id, result: op === 'list' ? notes : notes[key] })
  }
  iframe.contentWindow.postMessage({ type: 'pondersource.atomic.documents.v1' }, 'http://localhost:8000', [channel.port2])
}

test('an Atomic frame opens the same Litewrite build and saves notes through its host', async ({ page }) => {
  const server = createServer((request, response) => {
    response.setHeader('Content-Type', 'text/html')
    response.end(`<!doctype html>
      <script>${openLitewrite}</script>
      <iframe id="litewrite" referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-modals"
        src="http://localhost:8000/?embed=atomic" onload="openLitewrite(this)"></iframe>`)
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))

  const diagnostics = []
  page.on('requestfailed', request => diagnostics.push(request.url() + ' ' + request.failure()?.errorText))
  page.on('pageerror', error => diagnostics.push(error.message))

  try {
    await page.goto('http://localhost:' + server.address().port)
    const frame = page.frameLocator('#litewrite')
    const editor = frame.locator('#editor')
    const status = frame.getByRole('status')
    await expect(editor).toBeEnabled()
    await expect(frame.locator('#sharing')).toBeHidden()
    await editor.fill('Atomic note <b>with literal HTML</b>')
    await expect(status).toHaveText('Saved to Atomic')
    await expect(frame.locator('.highlights b')).toHaveCount(0)

    await page.reload()
    await expect(editor).toHaveValue('Atomic note <b>with literal HTML</b>')
    await expect(editor).toBeEnabled()
  } catch (error) {
    error.message += '\nBrowser diagnostics: ' + diagnostics.join('\n')
    throw error
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
})

test('embedded mode opened in its own tab waits for Atomic instead of using guest storage', async ({ page }) => {
  await page.goto('/?embed=atomic')
  await expect(page.getByRole('status')).toHaveText('Open Litewrite from Atomic to connect your storage.')
  await expect(page.locator('#editor')).toBeDisabled()
  await expect(page.locator('#entries .item')).toHaveCount(0)
})
