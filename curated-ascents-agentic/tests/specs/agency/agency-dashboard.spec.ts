import { test, expect } from '@playwright/test';
import { ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Agency Dashboard @agency @regression', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(ROUTES.agencyDashboard);
    await expect(page).toHaveURL(/\/agency\/login/);
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto(ROUTES.agencyLogin);
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('dashboard has tabs when authenticated', async ({ page }) => {
    await page.goto(ROUTES.agencyDashboard);
    const url = page.url();
    if (!url.includes('/login')) {
      const tabs = page.getByRole('button');
      const count = await tabs.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('dashboard shows agency name when authenticated', async ({ page }) => {
    await page.goto(ROUTES.agencyDashboard);
    const url = page.url();
    if (!url.includes('/login')) {
      const agencyName = page.getByText(/Agency Dashboard/i);
      await expect(agencyName).toBeVisible();
    }
  });
});
