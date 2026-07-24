const { test, expect } = require('@playwright/test')

test.describe('Litewrite smoke tests', () => {
  test('loads the app and opens the welcome note', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('Litewrite')

    const editor = page.locator('#editor')
    await expect(editor).toBeVisible()
    await expect(editor).toHaveValue(/Litewrite/)

    await expect(page.locator('#entries .item')).toHaveCount(1)
  })

  test('typing in the editor updates the note content and sidebar title', async ({ page }) => {
    await page.goto('/')
    const editor = page.locator('#editor')
    await expect(editor).toHaveValue(/Litewrite/)

    await editor.fill('My first note for testing')
    await expect(editor).toHaveValue('My first note for testing')
    await expect(page.locator('#entries .item a')).toHaveText(/My first note for testing/)
  })

  test('creating a new note adds another entry and clears the editor', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#entries .item')).toHaveCount(1)

    await page.locator('#editor').fill('First note content')
    await expect(page.locator('#entries .item')).toHaveCount(1)

    await page.locator('#add').click()
    await expect(page.locator('#entries .item')).toHaveCount(2)
    await expect(page.locator('#editor')).toHaveValue('')
  })

  test('deleting a note clears its content', async ({ page }) => {
    await page.goto('/')
    const editor = page.locator('#editor')
    await expect(editor).toHaveValue(/Litewrite/)

    page.once('dialog', dialog => dialog.accept())
    await page.locator('#delete').click()

    await expect(editor).toHaveValue('')
  })

  test('sidebar toggle button opens the sidebar on mobile', async ({ page }) => {
    // The hamburger menu button is only shown below the mobile breakpoint
    // (see the media query in style/litewrite.css).
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    const menuButton = page.locator('#menu-button')
    await expect(menuButton).toBeVisible()

    await menuButton.click()
    await expect(page.locator('body')).toHaveClass(/snapjs-left/)
  })
})
