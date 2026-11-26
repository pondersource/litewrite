const { test, expect } = require('@playwright/test')

test('an Atomic frame opens the same Litewrite build and saves notes through its host', async ({ page }) => {
  await page.route('http://127.0.0.1:8001/', route => route.fulfill({
    contentType: 'text/html',
    body: '<iframe id="litewrite" referrerpolicy="origin" src="http://localhost:8000/?embed=atomic"></iframe>'
  }))
  await page.addInitScript(() => {
    if (window.location.origin !== 'http://127.0.0.1:8001') return
    document.addEventListener('load', event => {
      const iframe = event.target
      if (iframe.id !== 'litewrite') return
      const channel = new MessageChannel()
      const notes = JSON.parse(window.sessionStorage.getItem('notes') || '{}')
      channel.port1.onmessage = ({ data: { id, op, key, note } }) => {
        if (op === 'put') notes[key] = note
        if (op === 'delete') delete notes[key]
        window.sessionStorage.setItem('notes', JSON.stringify(notes))
        channel.port1.postMessage({ id, result: op === 'list' ? notes : notes[key] })
      }
      iframe.contentWindow.postMessage({ type: 'pondersource.atomic.documents.v1' }, 'http://localhost:8000', [channel.port2])
    }, true)
  })
  await page.goto('http://127.0.0.1:8001/')
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
})

test('embedded mode opened in its own tab waits for Atomic instead of using guest storage', async ({ page }) => {
  await page.goto('/?embed=atomic')
  await expect(page.getByRole('status')).toHaveText('Open Litewrite from Atomic to connect your storage.')
  await expect(page.locator('#editor')).toBeDisabled()
  await expect(page.locator('#entries .item')).toHaveCount(0)
})
