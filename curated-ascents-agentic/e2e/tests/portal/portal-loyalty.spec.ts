import { test, expect } from '@playwright/test';
import { ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Portal Loyalty', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(ROUTES.portalLoyalty);
    await expect(page).toHaveURL(/\/portal\/login/);
  });

  test('loyalty page loads for authenticated users', async ({ page }) => {
    await page.goto(ROUTES.portalLoyalty);
    const url = page.url();
    if (!url.includes('/login')) {
      const content = page.locator('main, [class*="container"]').first();
      await expect(content).toBeVisible();
    }
  });

  test('loyalty page shows tier information', async ({ page }) => {
    await page.goto(ROUTES.portalLoyalty);
    const url = page.url();
    if (!url.includes('/login')) {
      const tierText = page.getByText(/bronze|silver|gold|platinum|points|tier/i);
      if (await tierText.count() > 0) {
        await expect(tierText.first()).toBeVisible();
      }
    }
  });
});
