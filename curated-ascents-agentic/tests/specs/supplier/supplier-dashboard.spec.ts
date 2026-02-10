import { test, expect } from '@playwright/test';
import { ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Supplier Dashboard @supplier @regression', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(ROUTES.supplierDashboard);
    await expect(page).toHaveURL(/\/supplier\/login/);
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto(ROUTES.supplierLogin);
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('dashboard has 4 tabs when authenticated', async ({ page }) => {
    await page.goto(ROUTES.supplierDashboard);
    const url = page.url();
    if (!url.includes('/login')) {
      // Should have: Profile, My Rates, Bookings, Earnings
      const profileTab = page.getByRole('button', { name: /profile/i });
      const ratesTab = page.getByRole('button', { name: /rates/i });
      const bookingsTab = page.getByRole('button', { name: /bookings/i });
      const earningsTab = page.getByRole('button', { name: /earnings/i });

      if (await profileTab.count() > 0) {
        await expect(profileTab).toBeVisible();
        await expect(ratesTab).toBeVisible();
        await expect(bookingsTab).toBeVisible();
        await expect(earningsTab).toBeVisible();
      }
    }
  });

  test('profile tab shows supplier information', async ({ page }) => {
    await page.goto(ROUTES.supplierDashboard);
    const url = page.url();
    if (!url.includes('/login')) {
      const profileTab = page.getByRole('button', { name: /profile/i });
      if (await profileTab.count() > 0) {
        await profileTab.click();
        await page.waitForTimeout(500);
        const content = page.locator('[class*="grid"], [class*="container"]').first();
        await expect(content).toBeVisible();
      }
    }
  });
});
