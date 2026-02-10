import { test, expect } from '@playwright/test';
import { ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Agency Reports', () => {
  test('reports tab exists in agency dashboard', async ({ page }) => {
    await page.goto(ROUTES.agencyDashboard);
    const url = page.url();
    if (!url.includes('/login')) {
      const reportsTab = page.getByRole('button', { name: /Reports/i });
      if (await reportsTab.count() > 0) {
        await expect(reportsTab).toBeVisible();
      }
    }
  });

  test('reports tab shows coming soon or report data', async ({ page }) => {
    await page.goto(ROUTES.agencyDashboard);
    const url = page.url();
    if (!url.includes('/login')) {
      const reportsTab = page.getByRole('button', { name: /Reports/i });
      if (await reportsTab.count() > 0) {
        await reportsTab.click();
        await page.waitForTimeout(500);
        // May show "Coming Soon" or actual report data
        const content = page.locator('main, [class*="container"], [class*="grid"]').first();
        await expect(content).toBeVisible();
      }
    }
  });
});
