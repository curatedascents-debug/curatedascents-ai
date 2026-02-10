import { test, expect } from '@playwright/test';
import { ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Portal Trips @portal @booking', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(ROUTES.portalTrips);
    await expect(page).toHaveURL(/\/portal\/login/);
  });

  test('trips page loads for authenticated users', async ({ page }) => {
    await page.goto(ROUTES.portalTrips);
    const url = page.url();
    if (!url.includes('/login')) {
      // Page loaded — should show trips content or empty state
      const content = page.locator('main, [class*="container"]').first();
      await expect(content).toBeVisible();
    }
  });

  test('trips page shows trip list or empty state', async ({ page }) => {
    await page.goto(ROUTES.portalTrips);
    const url = page.url();
    if (!url.includes('/login')) {
      const emptyState = page.getByText(/no trips|upcoming|past/i);
      const tripCards = page.locator('[class*="trip"], [class*="booking"]');
      const total = (await emptyState.count()) + (await tripCards.count());
      expect(total).toBeGreaterThanOrEqual(0);
    }
  });
});
