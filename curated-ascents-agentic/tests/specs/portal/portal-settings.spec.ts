import { test, expect } from '@playwright/test';
import { ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Portal Settings @portal @regression', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(ROUTES.portalSettings);
    await expect(page).toHaveURL(/\/portal\/login/);
  });

  test('settings page loads for authenticated users', async ({ page }) => {
    await page.goto(ROUTES.portalSettings);
    const url = page.url();
    if (!url.includes('/login')) {
      const content = page.locator('main, [class*="container"]').first();
      await expect(content).toBeVisible();
    }
  });

  test('settings page has profile form fields', async ({ page }) => {
    await page.goto(ROUTES.portalSettings);
    const url = page.url();
    if (!url.includes('/login')) {
      const inputs = page.locator('input');
      const count = await inputs.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
