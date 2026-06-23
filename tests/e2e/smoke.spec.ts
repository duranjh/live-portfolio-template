import { test, expect } from '@playwright/test'

/**
 * Demo-mode smoke test — the template's headline promise: a fresh clone with zero env renders
 * every key route. Proves the site (not just the build) actually works for a forker.
 */

test('home renders the hero + section nav', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1').first()).toBeVisible()
  // Scope to the header so we match the nav link, not the explore-card / footer links.
  const header = page.getByRole('banner')
  await expect(header.getByRole('link', { name: 'Apps', exact: true })).toBeVisible()
  await expect(header.getByRole('link', { name: 'Guides', exact: true })).toBeVisible()
})

test('guides index renders the browser controls', async ({ page }) => {
  await page.goto('/guides')
  await expect(page.getByPlaceholder(/search guides/i)).toBeVisible()
  await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
})

test('core routes return 200 in demo mode', async ({ page }) => {
  for (const path of ['/projects', '/resume', '/ideas', '/guides/premium', '/privacy', '/terms']) {
    const res = await page.goto(path)
    expect(res?.status(), `${path} should be 200`).toBe(200)
  }
})

test('a missing project slug renders the 404 page', async ({ page }) => {
  const res = await page.goto('/projects/this-does-not-exist')
  expect(res?.status()).toBe(404)
  await expect(page.getByText(/not found/i)).toBeVisible()
})
