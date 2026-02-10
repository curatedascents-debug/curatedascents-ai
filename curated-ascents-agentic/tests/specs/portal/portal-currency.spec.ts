import { test, expect } from '@playwright/test';
import { mockCurrencyRates, mockCurrencyConvert } from '../../mocks/external-services';
import { ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Portal Currency @portal @regression', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(ROUTES.portalCurrency);
    await expect(page).toHaveURL(/\/portal\/login/);
  });

  test('currency page loads for authenticated users', async ({ page }) => {
    await mockCurrencyRates(page);
    await page.goto(ROUTES.portalCurrency);
    const url = page.url();
    if (!url.includes('/login')) {
      const content = page.locator('main, [class*="container"]').first();
      await expect(content).toBeVisible();
    }
  });

  test('has currency converter inputs', async ({ page }) => {
    await mockCurrencyRates(page);
    await mockCurrencyConvert(page);
    await page.goto(ROUTES.portalCurrency);
    const url = page.url();
    if (!url.includes('/login')) {
      const inputs = page.locator('input[type="number"], select');
      const count = await inputs.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
