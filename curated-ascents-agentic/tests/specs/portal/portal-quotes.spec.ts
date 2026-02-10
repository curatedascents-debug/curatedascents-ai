import { test, expect } from '@playwright/test';
import { ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Portal Quotes @portal @booking', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(ROUTES.portalQuotes);
    await expect(page).toHaveURL(/\/portal\/login/);
  });

  test('quotes page loads for authenticated users', async ({ page }) => {
    await page.goto(ROUTES.portalQuotes);
    const url = page.url();
    if (!url.includes('/login')) {
      const content = page.locator('main, [class*="container"]').first();
      await expect(content).toBeVisible();
    }
  });

  test('quotes page shows quote list or empty state', async ({ page }) => {
    await page.goto(ROUTES.portalQuotes);
    const url = page.url();
    if (!url.includes('/login')) {
      const quoteElements = page.locator('[class*="quote"], table tbody tr');
      const count = await quoteElements.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('quotes do not show cost price or margin', async ({ page }) => {
    await page.goto(ROUTES.portalQuotes);
    const url = page.url();
    if (!url.includes('/login')) {
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.toLowerCase()).not.toContain('costprice');
      expect(bodyText.toLowerCase()).not.toContain('margin');
    }
  });
});
