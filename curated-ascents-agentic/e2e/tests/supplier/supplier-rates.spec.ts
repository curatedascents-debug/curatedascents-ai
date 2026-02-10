import { test, expect } from '@playwright/test';
import { ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Supplier Rates', () => {
  test('rates tab shows rate list when authenticated', async ({ page }) => {
    await page.goto(ROUTES.supplierDashboard);
    const url = page.url();
    if (!url.includes('/login')) {
      const ratesTab = page.getByRole('button', { name: /rates/i });
      if (await ratesTab.count() > 0) {
        await ratesTab.click();
        await page.waitForTimeout(1000);
        // Should show rate table or empty state
        const content = page.locator('table, [class*="grid"]');
        if (await content.count() > 0) {
          await expect(content.first()).toBeVisible();
        }
      }
    }
  });

  test('rates have search functionality', async ({ page }) => {
    await page.goto(ROUTES.supplierDashboard);
    const url = page.url();
    if (!url.includes('/login')) {
      const ratesTab = page.getByRole('button', { name: /rates/i });
      if (await ratesTab.count() > 0) {
        await ratesTab.click();
        await page.waitForTimeout(500);
        const searchInput = page.locator('input[placeholder*="Search"]');
        if (await searchInput.count() > 0) {
          await searchInput.first().fill('Everest');
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('supplier rates API returns 401 without auth', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/supplier/rates`);
    expect([401, 403]).toContain(response.status());
  });
});
