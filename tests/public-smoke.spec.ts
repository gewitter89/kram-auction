import { test, expect } from '@playwright/test'

const publicPages = ['/', '/catalog', '/fees', '/safety', '/rules', '/terms', '/privacy']

test.describe('public launch smoke', () => {
  for (const path of publicPages) {
    test(`${path} renders without obvious demo/beta positioning`, async ({ page }) => {
      await page.goto(path)
      await expect(page.locator('body')).toBeVisible()
      await expect(page.locator('body')).not.toContainText(/Beta|beta|демо|тестов/i)
    })
  }

  test('mobile home has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
    expect(hasOverflow).toBe(false)
  })

  test('catalog mobile toolbar renders and filters open', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/catalog')
    await expect(page.getByPlaceholder('Пошук лотів, брендів, моделей...')).toBeVisible()
    await page.getByRole('button', { name: /Фільтри/i }).click()
    await expect(page.getByText('Ціна, ₴')).toBeVisible()
  })
})
