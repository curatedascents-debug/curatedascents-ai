import { test, expect } from '@playwright/test';

test.describe('About Page @smoke @regression', () => {
  test('loads successfully with heading', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL('/about');
    const heading = page.getByRole('heading', { name: /our story/i }).first();
    await expect(heading).toBeVisible();
  });

  test('has page title with CuratedAscents', async ({ page }) => {
    await page.goto('/about');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.toLowerCase()).toContain('curatedascents');
  });

  test('displays founder name', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('Kiran Pokhrel').first()).toBeVisible();
  });

  test('displays enterprise career section', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(/Enterprise Technology/i).first()).toBeVisible();
  });

  test('displays philosophy section', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(/Our Philosophy/i).first()).toBeVisible();
  });

  test('displays office contact info', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(/4498 Voyageur Way/i).first()).toBeVisible();
  });

  test('has navigation', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });

  test('has footer', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
  });

  test('has meta description', async ({ page }) => {
    await page.goto('/about');
    const metaDesc = page.locator('meta[name="description"]');
    if (await metaDesc.count() > 0) {
      const content = await metaDesc.getAttribute('content');
      expect(content).toBeTruthy();
    }
  });

  test('displays CTA button', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    const cta = page.getByText(/Start Your Journey/i).first();
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeVisible();
  });
});
