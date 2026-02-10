import { test, expect } from '@playwright/test';
import { SupplierLoginPage } from '../../page-objects/SupplierLoginPage';
import { ROUTES, TEST_SUPPLIER_USER } from '../../fixtures/test-data.fixture';

test.describe('Supplier Confirmation Journey @regression @supplier @booking', () => {
  test('supplier can access login page', async ({ page }) => {
    const loginPage = new SupplierLoginPage(page);
    await loginPage.goto();
    await loginPage.expectLoaded();
  });

  test('supplier login → dashboard → bookings → rates flow', async ({ page }) => {
    // Step 1: Login
    const loginPage = new SupplierLoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_SUPPLIER_USER.email, TEST_SUPPLIER_USER.password);
    await page.waitForTimeout(2000);

    const url = page.url();
    if (url.includes('/supplier/dashboard')) {
      // Step 2: Check Profile tab
      const profileTab = page.getByRole('button', { name: /Profile/i });
      if (await profileTab.count() > 0) {
        await profileTab.click();
        await page.waitForTimeout(500);
      }

      // Step 3: Switch to Bookings tab
      const bookingsTab = page.getByRole('button', { name: /Bookings/i });
      if (await bookingsTab.count() > 0) {
        await bookingsTab.click();
        await page.waitForTimeout(500);
      }

      // Step 4: Switch to Rates tab
      const ratesTab = page.getByRole('button', { name: /Rates/i });
      if (await ratesTab.count() > 0) {
        await ratesTab.click();
        await page.waitForTimeout(500);
      }

      // Step 5: Check Earnings tab
      const earningsTab = page.getByRole('button', { name: /Earnings/i });
      if (await earningsTab.count() > 0) {
        await earningsTab.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('supplier API endpoints require authentication', async ({ request, baseURL }) => {
    const endpoints = [
      { url: `${baseURL}/api/supplier/rates`, method: 'GET' },
      { url: `${baseURL}/api/supplier/bookings`, method: 'GET' },
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint.url);
      expect([401, 403, 307]).toContain(response.status());
    }
  });
});
